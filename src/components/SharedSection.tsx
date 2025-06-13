import React, { useState, useEffect } from 'react'
import { Share2, File, Folder, Users, Link, Eye, MoreVertical, Copy, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SharedItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  created_at: string
  shared_at: string
  shared_with: string[]
  share_link?: string
  permissions: 'view' | 'edit' | 'admin'
  file_type?: string
  folder_path: string
}

const SharedSection: React.FC = () => {
  const { user } = useAuth()
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'by_me' | 'with_me'>('all')

  useEffect(() => {
    if (user) {
      fetchSharedItems()
    }
  }, [user, filter])

  const fetchSharedItems = async () => {
    setLoading(true)
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setSharedItems([])
        setLoading(false)
        return
      }

      // Fetch shared files
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_shared', true)
        .eq('is_deleted', false)

      // Fetch shared folders
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_shared', true)
        .eq('is_deleted', false)

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
        setSharedItems([])
        setLoading(false)
        return
      }

      const allItems: SharedItem[] = [
        ...(files || []).map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          created_at: file.created_at,
          shared_at: file.updated_at || file.created_at,
          shared_with: ['team@company.com'], // This would come from a separate sharing table
          share_link: `https://scarletdrives.com/s/${file.id}`,
          permissions: 'view' as const,
          file_type: file.type,
          folder_path: file.folder_path || 'Root'
        })),
        ...(folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          created_at: folder.created_at,
          shared_at: folder.updated_at || folder.created_at,
          shared_with: ['team@company.com'], // This would come from a separate sharing table
          share_link: `https://scarletdrives.com/s/${folder.id}`,
          permissions: 'edit' as const,
          folder_path: folder.parent_path || 'Root'
        }))
      ]

      setSharedItems(allItems)
    } catch (error) {
      console.error('Error fetching shared items:', error)
      setSharedItems([])
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link)
    // Show toast notification
  }

  const revokeShare = async (id: string) => {
    try {
      setSharedItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error revoking share:', error)
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

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'bg-red-900 text-red-300'
      case 'edit': return 'bg-blue-900 text-blue-300'
      case 'view': return 'bg-gray-700 text-gray-300'
      default: return 'bg-gray-700 text-gray-300'
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
        <h1 className="text-2xl font-bold text-white">Shared Files</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Share2 className="w-5 h-5 text-green-400" />
          <span className="text-sm">{sharedItems.length} shared items</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
        {[
          { key: 'all', label: 'All Shared' },
          { key: 'by_me', label: 'Shared by Me' },
          { key: 'with_me', label: 'Shared with Me' }
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

      {sharedItems.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <Share2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No Shared Files</h3>
          <p className="text-gray-500 mb-4">Files you share or that are shared with you will appear here</p>
          <div className="text-sm text-gray-600">
            <p>Use the share button on any file or folder to start collaborating</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-700">
            {sharedItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-700 transition-colors duration-150">
                <div className="flex items-start gap-4">
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(item.permissions)}`}>
                        {item.permissions}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>Shared {new Date(item.shared_at).toLocaleDateString()}</span>
                      {item.size && <span>{formatFileSize(item.size)}</span>}
                      <span>{item.folder_path}</span>
                    </div>

                    {/* Shared With */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Shared with:</span>
                      <div className="flex items-center gap-2">
                        {item.shared_with.slice(0, 3).map((email, index) => (
                          <span key={index} className="text-sm text-white bg-gray-700 px-2 py-1 rounded">
                            {email}
                          </span>
                        ))}
                        {item.shared_with.length > 3 && (
                          <span className="text-sm text-gray-400">
                            +{item.shared_with.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Share Link */}
                    {item.share_link && (
                      <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                        <Link className="w-4 h-4 text-gray-400" />
                        <code className="text-sm text-gray-300 flex-1 truncate">
                          {item.share_link}
                        </code>
                        <button
                          onClick={() => copyShareLink(item.share_link!)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => revokeShare(item.id)}
                      className="p-2 hover:bg-gray-600 rounded-lg"
                      title="Revoke sharing"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sharing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{sharedItems.filter(i => i.type === 'file').length}</p>
          <p className="text-gray-400 text-sm">Files Shared</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{sharedItems.filter(i => i.type === 'folder').length}</p>
          <p className="text-gray-400 text-sm">Folders Shared</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{sharedItems.reduce((acc, item) => acc + item.shared_with.length, 0)}</p>
          <p className="text-gray-400 text-sm">Total Collaborators</p>
        </div>
      </div>
    </div>
  )
}

export default SharedSection