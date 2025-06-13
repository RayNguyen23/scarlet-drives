import React, { useState, useEffect } from 'react'
import { Clock, File, Folder, Star, Share2, MoreVertical, Eye, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RecentItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  created_at: string
  updated_at: string
  is_starred: boolean
  is_shared: boolean
  file_type?: string
  action: 'created' | 'modified' | 'shared' | 'viewed'
}

const RecentSection: React.FC = () => {
  const { user } = useAuth()
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'created' | 'modified' | 'shared' | 'viewed'>('all')

  useEffect(() => {
    if (user) {
      fetchRecentItems()
    }
  }, [user, filter])

  const fetchRecentItems = async () => {
    setLoading(true)
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setRecentItems([])
        setLoading(false)
        return
      }

      // Fetch recent files (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_deleted', false)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_deleted', false)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      // Handle errors gracefully
      if (filesError && !filesError.message.includes('relation "files" does not exist')) {
        console.error('Files error:', filesError)
      }

      if (foldersError && !foldersError.message.includes('relation "folders" does not exist')) {
        console.error('Folders error:', foldersError)
      }

      // If tables don't exist, show empty state
      if ((filesError?.message.includes('relation "files" does not exist')) || 
          (foldersError?.message.includes('relation "folders" does not exist'))) {
        setRecentItems([])
        setLoading(false)
        return
      }

      const allItems: RecentItem[] = [
        ...(files || []).map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          created_at: file.created_at,
          updated_at: file.updated_at || file.created_at,
          is_starred: file.is_starred || false,
          is_shared: file.is_shared || false,
          file_type: file.type,
          action: 'created' as const
        })),
        ...(folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          created_at: folder.created_at,
          updated_at: folder.updated_at || folder.created_at,
          is_starred: folder.is_starred || false,
          is_shared: folder.is_shared || false,
          action: 'created' as const
        }))
      ]

      // Sort by most recent
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const filteredItems = filter === 'all' 
        ? allItems 
        : allItems.filter(item => item.action === filter)

      setRecentItems(filteredItems)
    } catch (error) {
      console.error('Error fetching recent items:', error)
      setRecentItems([])
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) return '🖼️'
    if (fileType?.includes('video')) return '🎬'
    if (fileType?.includes('audio')) return '🎵'
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('document') || fileType?.includes('word')) return '📝'
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return '📊'
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊'
    return '📄'
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-400'
      case 'modified': return 'text-blue-400'
      case 'shared': return 'text-purple-400'
      case 'viewed': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

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
        <h1 className="text-2xl font-bold text-white">Recent Activity</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Last 30 days</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
        {[
          { key: 'all', label: 'All Activity' },
          { key: 'created', label: 'Created' },
          { key: 'modified', label: 'Modified' },
          { key: 'shared', label: 'Shared' },
          { key: 'viewed', label: 'Viewed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recent Items List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {recentItems.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Recent Activity</h3>
            <p className="text-gray-500">Your recent file activity will appear here</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Upload files or create folders to see activity</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {recentItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-center gap-4">
                  {/* File/Folder Icon */}
                  <div className="flex-shrink-0">
                    {item.type === 'folder' ? (
                      <Folder className="w-8 h-8 text-blue-400" />
                    ) : (
                      <div className="text-2xl">{getFileIcon(item.file_type || '')}</div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      {item.is_starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      {item.is_shared && <Share2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className={`capitalize ${getActionColor(item.action)}`}>
                        {item.action}
                      </span>
                      <span>{getTimeAgo(item.updated_at)}</span>
                      {item.size && <span>{formatFileSize(item.size)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.type === 'file' && (
                      <>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    )}
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Files Created', count: recentItems.filter(i => i.type === 'file' && i.action === 'created').length, color: 'text-green-400' },
          { label: 'Folders Created', count: recentItems.filter(i => i.type === 'folder' && i.action === 'created').length, color: 'text-blue-400' },
          { label: 'Files Shared', count: recentItems.filter(i => i.is_shared).length, color: 'text-purple-400' },
          { label: 'Total Items', count: recentItems.length, color: 'text-yellow-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentSection