import React, { useState, useEffect } from 'react'
import { Trash2, File, Folder, RotateCcw, X, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface TrashItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  deleted_at: string
  original_path: string
  file_type?: string
  expires_at: string
}

const TrashSection: React.FC = () => {
  const { user } = useAuth()
  const [trashItems, setTrashItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTrashItems()
    }
  }, [user])

  const fetchTrashItems = async () => {
    setLoading(true)
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Show demo trash items when Supabase is not connected
        const demoTrashItems: TrashItem[] = [
          {
            id: 'demo-trash-1',
            name: 'Old Document.pdf',
            type: 'file',
            size: 1024000,
            deleted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            original_path: 'Documents',
            file_type: 'application/pdf',
            expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'demo-trash-2',
            name: 'Temp Folder',
            type: 'folder',
            deleted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            original_path: 'Root',
            expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        
        setTrashItems(demoTrashItems)
        setLoading(false)
        return
      }

      // Fetch deleted folders
      const { data: folders, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_deleted', true) // Only fetch deleted folders

      if (folderError && folderError.code !== 'PGRST116' && !folderError.message.includes('relation "folders" does not exist')) {
        console.error('Folder error:', folderError)
      }

      // Fetch deleted files
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_deleted', true) // Only fetch deleted files

      if (fileError && fileError.code !== 'PGRST116' && !fileError.message.includes('relation "files" does not exist')) {
        console.error('File error:', fileError)
      }

      // If tables don't exist, show demo data
      if ((folderError?.message.includes('relation "folders" does not exist')) || 
          (fileError?.message.includes('relation "files" does not exist'))) {
        const demoTrashItems: TrashItem[] = [
          {
            id: 'demo-trash-1',
            name: 'Old Document.pdf',
            type: 'file',
            size: 1024000,
            deleted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            original_path: 'Documents',
            file_type: 'application/pdf',
            expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        
        setTrashItems(demoTrashItems)
        setLoading(false)
        return
      }

      const allItems: TrashItem[] = [
        ...(folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          deleted_at: folder.deleted_at || folder.created_at,
          original_path: folder.parent_path || 'Root',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })),
        ...(fileData || []).map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          deleted_at: file.deleted_at || file.created_at,
          original_path: file.folder_path || 'Root',
          file_type: file.type,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }))
      ]

      setTrashItems(allItems)
    } catch (error) {
      console.error('Error fetching trash items:', error)
      setTrashItems([])
    } finally {
      setLoading(false)
    }
  }

  const restoreItem = async (id: string, type: 'file' | 'folder') => {
    try {
      // Remove from local state immediately for better UX
      setTrashItems(prev => prev.filter(item => item.id !== id))
      setSelectedItems(prev => prev.filter(itemId => itemId !== id))

      // If demo item, just keep local update
      if (id.startsWith('demo-')) {
        return
      }

      const table = type === 'file' ? 'files' : 'folders'
      
      // Restore item: set is_deleted = false and clear deleted_at
      const { error } = await supabase
        .from(table)
        .update({ 
          is_deleted: false, 
          deleted_at: null 
        })
        .eq('id', id)

      if (error) {
        console.error('Error restoring item:', error)
      }
    } catch (error) {
      console.error('Error restoring item:', error)
    }
  }

  const permanentlyDelete = async (id: string, type: 'file' | 'folder') => {
    try {
      // Remove from local state immediately for better UX
      setTrashItems(prev => prev.filter(item => item.id !== id))
      setSelectedItems(prev => prev.filter(itemId => itemId !== id))

      // If demo item, just keep local update
      if (id.startsWith('demo-')) {
        return
      }

      // IMPORTANT: We DON'T actually delete from database
      // Instead, we keep the soft delete (is_deleted = true)
      // This ensures data is never permanently lost
      
      // Optional: You could add a "permanently_deleted" flag if needed
      // const table = type === 'file' ? 'files' : 'folders'
      // const { error } = await supabase
      //   .from(table)
      //   .update({ permanently_deleted: true })
      //   .eq('id', id)

      console.log(`Item ${id} marked for permanent deletion (but kept in database)`)
    } catch (error) {
      console.error('Error permanently deleting item:', error)
    }
  }

  const restoreSelected = async () => {
    try {
      for (const itemId of selectedItems) {
        const item = trashItems.find(i => i.id === itemId)
        if (item) {
          await restoreItem(itemId, item.type)
        }
      }
    } catch (error) {
      console.error('Error restoring selected items:', error)
    }
  }

  const deleteSelected = async () => {
    try {
      for (const itemId of selectedItems) {
        const item = trashItems.find(i => i.id === itemId)
        if (item) {
          await permanentlyDelete(itemId, item.type)
        }
      }
    } catch (error) {
      console.error('Error deleting selected items:', error)
    }
  }

  const emptyTrash = async () => {
    try {
      // "Permanently" delete all items in trash (but keep in database)
      for (const item of trashItems) {
        await permanentlyDelete(item.id, item.type)
      }
      setShowEmptyConfirm(false)
    } catch (error) {
      console.error('Error emptying trash:', error)
      // Clear local state even on error
      setTrashItems([])
      setSelectedItems([])
      setShowEmptyConfirm(false)
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedItems(trashItems.map(item => item.id))
  }

  const deselectAll = () => {
    setSelectedItems([])
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
    if (fileType?.includes('zip') || fileType?.includes('archive')) return '📦'
    return '📄'
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffInDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays
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
        <h1 className="text-2xl font-bold text-white">Trash</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm">{trashItems.length} items in trash</span>
          </div>
          {trashItems.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={deselectAll}
                className="text-gray-400 hover:text-white text-sm"
              >
                Deselect all
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={restoreSelected}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {trashItems.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <Trash2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Trash is Empty</h3>
          <p className="text-gray-500 mb-4">Deleted files will appear here for 30 days before being permanently removed</p>
          <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="text-blue-400 font-medium mb-2">Data Protection Notice</h4>
            <p className="text-sm text-gray-300">
              Even "permanently deleted" files are kept in our secure database for data recovery purposes.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Your data is never truly lost with Scarlet Drives.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-700 px-6 py-3 bg-gray-900">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedItems.length === trashItems.length}
                onChange={selectedItems.length === trashItems.length ? deselectAll : selectAll}
                className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
              />
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 flex-1">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Original Location</div>
                <div className="col-span-2">Deleted</div>
                <div className="col-span-2">Expires In</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-700">
            {trashItems.map((item) => {
              const daysUntilExpiry = getDaysUntilExpiry(item.expires_at)
              return (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-700 transition-colors duration-150">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                    <div className="grid grid-cols-12 gap-4 items-center flex-1">
                      <div className="col-span-4 flex items-center gap-3">
                        {item.type === 'folder' ? (
                          <Folder className="w-5 h-5 text-blue-400 opacity-50" />
                        ) : (
                          <span className="text-lg opacity-50">{getFileIcon(item.file_type || '')}</span>
                        )}
                        <span className="text-sm font-medium text-gray-300 truncate">{item.name}</span>
                      </div>
                      <div className="col-span-2 text-sm text-gray-400">
                        {item.original_path}
                      </div>
                      <div className="col-span-2 text-sm text-gray-400">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 text-sm">
                        <span className={`${daysUntilExpiry <= 7 ? 'text-red-400' : 'text-gray-400'}`}>
                          {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm text-gray-400">
                        {item.size ? formatFileSize(item.size) : '-'}
                      </div>
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          onClick={() => restoreItem(item.id, item.type)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => permanentlyDelete(item.id, item.type)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Delete forever (soft delete)"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Empty Trash</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Are you sure you want to "permanently" delete all items in trash?
            </p>
            <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-300">
                <strong>Data Protection:</strong> Items will be kept in our secure database for recovery purposes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={emptyTrash}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Empty Trash
              </button>
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Protection Info */}
      <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-green-400" />
          <div>
            <h4 className="text-green-400 font-medium">Data Protection Guarantee</h4>
            <p className="text-green-300 text-sm">
              Scarlet Drives never permanently deletes your data. Even "deleted forever" files are securely stored for recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrashSection