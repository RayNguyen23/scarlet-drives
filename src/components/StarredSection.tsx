import React, { useState, useEffect } from 'react'
import { Star, File, Folder, Share2, MoreVertical, Eye, Download, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface StarredItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  created_at: string
  updated_at: string
  is_shared: boolean
  file_type?: string
  folder_path: string
}

const StarredSection: React.FC = () => {
  const { user } = useAuth()
  const [starredItems, setStarredItems] = useState<StarredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (user) {
      fetchStarredItems()
    }
  }, [user])

  const fetchStarredItems = async () => {
    setLoading(true)
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setStarredItems([])
        setLoading(false)
        return
      }

      // Fetch starred files
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_starred', true)
        .eq('is_deleted', false)

      // Fetch starred folders
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_starred', true)
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
        setStarredItems([])
        setLoading(false)
        return
      }

      const allItems: StarredItem[] = [
        ...(files || []).map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          created_at: file.created_at,
          updated_at: file.updated_at || file.created_at,
          is_shared: file.is_shared || false,
          file_type: file.type,
          folder_path: file.folder_path || 'Root'
        })),
        ...(folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          created_at: folder.created_at,
          updated_at: folder.updated_at || folder.created_at,
          is_shared: folder.is_shared || false,
          folder_path: folder.parent_path || 'Root'
        }))
      ]

      setStarredItems(allItems)
    } catch (error) {
      console.error('Error fetching starred items:', error)
      setStarredItems([])
    } finally {
      setLoading(false)
    }
  }

  const unstarItem = async (id: string, type: 'file' | 'folder') => {
    try {
      // Remove from local state immediately for better UX
      setStarredItems(prev => prev.filter(item => item.id !== id))

      const table = type === 'file' ? 'files' : 'folders'
      
      const { error } = await supabase
        .from(table)
        .update({ is_starred: false })
        .eq('id', id)

      if (error) {
        console.error('Error unstarring item:', error)
        // Revert on error
        fetchStarredItems()
      }
    } catch (error) {
      console.error('Error unstarring item:', error)
      // Revert on error
      fetchStarredItems()
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
        <h1 className="text-2xl font-bold text-white">Starred Files</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-sm">{starredItems.length} starred items</span>
          </div>
          <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {starredItems.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No Starred Files</h3>
          <p className="text-gray-500 mb-4">Star your important files to find them quickly here</p>
          <div className="text-sm text-gray-600">
            <p>Click the star icon on any file or folder to add it to your starred items</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="border-b border-gray-700 px-6 py-3 bg-gray-900">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-700">
            {starredItems.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-700 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    {item.type === 'folder' ? (
                      <Folder className="w-5 h-5 text-blue-400" />
                    ) : (
                      <span className="text-lg">{getFileIcon(item.file_type || '')}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {item.is_shared && <Share2 className="w-3 h-3 text-green-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-400">
                    {item.folder_path}
                  </div>
                  <div className="col-span-2 text-sm text-gray-400">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 text-sm text-gray-400">
                    {item.size ? formatFileSize(item.size) : '-'}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => unstarItem(item.id, item.type)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Remove from starred"
                    >
                      <Star className="w-4 h-4 text-yellow-400 fill-current hover:text-gray-400" />
                    </button>
                    {item.type === 'file' && (
                      <button className="p-1 hover:bg-gray-600 rounded">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {starredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:shadow-lg hover:border-red-500 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {item.type === 'folder' ? (
                    <Folder className="w-8 h-8 text-blue-400" />
                  ) : (
                    <div className="text-2xl">{getFileIcon(item.file_type || '')}</div>
                  )}
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => unstarItem(item.id, item.type)}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Remove from starred"
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current hover:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium text-white truncate mb-2" title={item.name}>
                {item.name}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                {item.size && <span>{formatFileSize(item.size)}</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {item.folder_path}
                </span>
                {item.is_shared && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                    <Share2 className="w-3 h-3" />
                    Shared
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StarredSection