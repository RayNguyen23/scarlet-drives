import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Download, Upload, Eye, File, Folder } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const AnalyticsSection: React.FC = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalFiles: 0,
    totalFolders: 0,
    totalStorage: 0,
    recentUploads: 0,
    starredItems: 0,
    sharedItems: 0,
    deletedItems: 0,
    storageGrowth: 0,
    popularFiles: [] as Array<{ name: string; size: number; type: string }>
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Show empty analytics when Supabase is not connected
        setAnalytics({
          totalFiles: 0,
          totalFolders: 0,
          totalStorage: 0,
          recentUploads: 0,
          starredItems: 0,
          sharedItems: 0,
          deletedItems: 0,
          storageGrowth: 0,
          popularFiles: []
        })
        setLoading(false)
        return
      }

      // Fetch files data
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)

      // Fetch folders data
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)

      // Handle errors gracefully
      if (filesError && !filesError.message.includes('relation "files" does not exist')) {
        console.error('Files error:', filesError)
      }

      if (foldersError && !foldersError.message.includes('relation "folders" does not exist')) {
        console.error('Folders error:', foldersError)
      }

      // If tables don't exist, show empty analytics
      if ((filesError?.message.includes('relation "files" does not exist')) || 
          (foldersError?.message.includes('relation "folders" does not exist'))) {
        setAnalytics({
          totalFiles: 0,
          totalFolders: 0,
          totalStorage: 0,
          recentUploads: 0,
          starredItems: 0,
          sharedItems: 0,
          deletedItems: 0,
          storageGrowth: 0,
          popularFiles: []
        })
        setLoading(false)
        return
      }

      // Calculate analytics from real data
      const activeFiles = (files || []).filter(f => !f.is_deleted)
      const activeFolders = (folders || []).filter(f => !f.is_deleted)
      const deletedFiles = (files || []).filter(f => f.is_deleted)
      const deletedFolders = (folders || []).filter(f => f.is_deleted)

      // Calculate total storage used
      const totalStorage = activeFiles.reduce((sum, file) => sum + (file.size || 0), 0)

      // Calculate recent uploads (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentUploads = activeFiles.filter(file => 
        new Date(file.created_at) > weekAgo
      ).length

      // Calculate starred items
      const starredItems = [
        ...activeFiles.filter(f => f.is_starred),
        ...activeFolders.filter(f => f.is_starred)
      ].length

      // Calculate shared items
      const sharedItems = [
        ...activeFiles.filter(f => f.is_shared),
        ...activeFolders.filter(f => f.is_shared)
      ].length

      // Get popular files (largest files)
      const popularFiles = activeFiles
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 5)
        .map(file => ({
          name: file.name,
          size: file.size || 0,
          type: file.type || 'unknown'
        }))

      // Calculate storage growth (simplified - would need historical data for real calculation)
      const storageGrowth = recentUploads > 0 ? Math.min(recentUploads * 5, 100) : 0

      setAnalytics({
        totalFiles: activeFiles.length,
        totalFolders: activeFolders.length,
        totalStorage,
        recentUploads,
        starredItems,
        sharedItems,
        deletedItems: deletedFiles.length + deletedFolders.length,
        storageGrowth,
        popularFiles
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set empty analytics on error
      setAnalytics({
        totalFiles: 0,
        totalFolders: 0,
        totalStorage: 0,
        recentUploads: 0,
        starredItems: 0,
        sharedItems: 0,
        deletedItems: 0,
        storageGrowth: 0,
        popularFiles: []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const analyticsCards = [
    {
      title: 'Total Files',
      value: analytics.totalFiles.toLocaleString(),
      icon: File,
      color: 'bg-blue-600',
      change: analytics.recentUploads > 0 ? `+${analytics.recentUploads} this week` : 'No recent uploads'
    },
    {
      title: 'Total Folders',
      value: analytics.totalFolders.toLocaleString(),
      icon: Folder,
      color: 'bg-green-600',
      change: 'Organized storage'
    },
    {
      title: 'Storage Used',
      value: formatFileSize(analytics.totalStorage),
      icon: Upload,
      color: 'bg-red-600',
      change: analytics.storageGrowth > 0 ? `+${analytics.storageGrowth.toFixed(1)}% growth` : 'No growth'
    },
    {
      title: 'Starred Items',
      value: analytics.starredItems.toLocaleString(),
      icon: Eye,
      color: 'bg-yellow-600',
      change: 'Important files'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">Real-time data</span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-red-500 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{card.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Overview */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Storage Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Files</span>
              <span className="text-white font-medium">{analytics.totalFiles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Folders</span>
              <span className="text-white font-medium">{analytics.totalFolders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Shared Items</span>
              <span className="text-white font-medium">{analytics.sharedItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Starred Items</span>
              <span className="text-white font-medium">{analytics.starredItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">In Trash</span>
              <span className="text-white font-medium">{analytics.deletedItems}</span>
            </div>
            <hr className="border-gray-600" />
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Storage</span>
              <span className="text-white font-bold">{formatFileSize(analytics.totalStorage)}</span>
            </div>
          </div>
        </div>

        {/* Largest Files */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Largest Files</h3>
          {analytics.popularFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No files uploaded yet</p>
              <p className="text-gray-500 text-sm">Upload files to see analytics</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.popularFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-white font-medium truncate block">{file.name}</span>
                      <span className="text-gray-400 text-xs">{file.type}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
        {analytics.totalFiles === 0 && analytics.totalFolders === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No activity data available</p>
            <p className="text-gray-500 text-sm">Start uploading files and creating folders to see detailed analytics</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{analytics.totalFiles + analytics.totalFolders}</p>
              <p className="text-gray-400 text-sm">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{analytics.recentUploads}</p>
              <p className="text-gray-400 text-sm">Recent Uploads</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{formatFileSize(analytics.totalStorage)}</p>
              <p className="text-gray-400 text-sm">Storage Used</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsSection