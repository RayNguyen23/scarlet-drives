import React, { useState, useEffect } from 'react'
import { HardDrive, Files, Users, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Stats: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    sharedFiles: 0,
    recentActivity: 0
  })

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Demo stats when Supabase is not connected
        setStats({
          totalFiles: 0,
          totalStorage: 0,
          sharedFiles: 0,
          recentActivity: 0
        })
        return
      }

      // Get file count and total storage
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('size, is_shared, created_at')
        .eq('user_id', user?.id)
        .eq('is_deleted', false)

      if (filesError && !filesError.message.includes('relation "files" does not exist')) {
        console.error('Files error:', filesError)
        return
      }

      const totalFiles = files?.length || 0
      const totalStorage = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
      const sharedFiles = files?.filter(file => file.is_shared).length || 0
      
      // Recent activity (files created in last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentActivity = files?.filter(file => 
        new Date(file.created_at) > weekAgo
      ).length || 0

      setStats({
        totalFiles,
        totalStorage,
        sharedFiles,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const statItems = [
    {
      label: 'Total Files',
      value: stats.totalFiles.toLocaleString(),
      icon: Files,
      color: 'bg-blue-600',
      change: '+12%'
    },
    {
      label: 'Storage Used',
      value: formatStorage(stats.totalStorage),
      icon: HardDrive,
      color: 'bg-red-600',
      change: '+8%'
    },
    {
      label: 'Shared Files',
      value: stats.sharedFiles.toLocaleString(),
      icon: Users,
      color: 'bg-green-600',
      change: '+23%'
    },
    {
      label: 'Recent Activity',
      value: stats.recentActivity.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-yellow-600',
      change: '+15%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:shadow-lg hover:border-red-500 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-green-400 mt-1">{item.change} this week</p>
              </div>
              <div className={`p-3 rounded-lg ${item.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Stats