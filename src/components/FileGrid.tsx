import React, { useState, useEffect } from 'react'
import { 
  File, 
  Folder, 
  Star, 
  Share2, 
  MoreVertical, 
  Download, 
  Trash2,
  Eye,
  Edit3,
  Copy,
  ExternalLink,
  Upload,
  Link,
  X,
  Check
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  created_at: string
  is_starred: boolean
  is_shared: boolean
  file_type?: string
  storage_path?: string
  is_deleted?: boolean
  deleted_at?: string
}

interface FileGridProps {
  currentPath: string
  onNavigate: (path: string) => void
  refresh: boolean
  viewMode: 'grid' | 'list'
}

const FileGrid: React.FC<FileGridProps> = ({ currentPath, onNavigate, refresh, viewMode }) => {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user, currentPath, refresh])

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Show demo files when Supabase is not connected
        const demoFiles: FileItem[] = [
          {
            id: 'demo-1',
            name: 'Welcome to Scarlet Drives.pdf',
            type: 'file',
            size: 2048576,
            created_at: new Date().toISOString(),
            is_starred: true,
            is_shared: false,
            file_type: 'application/pdf'
          },
          {
            id: 'demo-2',
            name: 'Documents',
            type: 'folder',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_starred: false,
            is_shared: true
          },
          {
            id: 'demo-3',
            name: 'Sample Image.jpg',
            type: 'file',
            size: 1024000,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_starred: false,
            is_shared: false,
            file_type: 'image/jpeg'
          },
          {
            id: 'demo-4',
            name: 'Spreadsheet.xlsx',
            type: 'file',
            size: 512000,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            is_starred: true,
            is_shared: true,
            file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ]
        
        setFiles(demoFiles)
        setLoading(false)
        return
      }

      // Try to fetch from Supabase
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        setError('Please sign in to view your files')
        setFiles([])
        setLoading(false)
        return
      }

      // Fetch folders (only non-deleted ones for current user)
      const { data: folders, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('parent_path', currentPath || '')
        .eq('is_deleted', false)

      // Fetch files (only non-deleted ones for current user)
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('folder_path', currentPath || '')
        .eq('is_deleted', false)

      // Handle errors gracefully
      if (folderError && folderError.code !== 'PGRST116' && !folderError.message.includes('relation "folders" does not exist')) {
        console.error('Folder error:', folderError)
      }

      if (fileError && fileError.code !== 'PGRST116' && !fileError.message.includes('relation "files" does not exist')) {
        console.error('File error:', fileError)
      }

      // If tables don't exist, show demo data
      if ((folderError?.message.includes('relation "folders" does not exist')) || 
          (fileError?.message.includes('relation "files" does not exist'))) {
        setError('Database not set up. Please connect to Supabase and run migrations.')
        
        // Show demo files
        const demoFiles: FileItem[] = [
          {
            id: 'demo-1',
            name: 'Welcome to Scarlet Drives.pdf',
            type: 'file',
            size: 2048576,
            created_at: new Date().toISOString(),
            is_starred: true,
            is_shared: false,
            file_type: 'application/pdf'
          },
          {
            id: 'demo-2',
            name: 'Documents',
            type: 'folder',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_starred: false,
            is_shared: true
          }
        ]
        
        setFiles(demoFiles)
        setLoading(false)
        return
      }

      const allItems: FileItem[] = [
        ...(folders || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          created_at: folder.created_at,
          is_starred: folder.is_starred || false,
          is_shared: folder.is_shared || false,
          is_deleted: folder.is_deleted || false,
          deleted_at: folder.deleted_at
        })),
        ...(fileData || []).map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          size: file.size,
          created_at: file.created_at,
          is_starred: file.is_starred || false,
          is_shared: file.is_shared || false,
          file_type: file.type,
          storage_path: file.storage_path,
          is_deleted: file.is_deleted || false,
          deleted_at: file.deleted_at
        }))
      ]

      setFiles(allItems)
    } catch (error) {
      console.error('Error fetching files:', error)
      setError('Failed to load files. Please try again.')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const toggleStar = async (id: string, type: 'file' | 'folder', isStarred: boolean) => {
    try {
      // Update locally first for better UX
      setFiles(prev => prev.map(file => 
        file.id === id ? { ...file, is_starred: !isStarred } : file
      ))

      // If demo file, just keep local update
      if (id.startsWith('demo-')) {
        return
      }

      const table = type === 'file' ? 'files' : 'folders'
      const { error } = await supabase
        .from(table)
        .update({ is_starred: !isStarred })
        .eq('id', id)

      if (error) {
        console.error('Error toggling star:', error)
        // Revert on error
        setFiles(prev => prev.map(file => 
          file.id === id ? { ...file, is_starred: isStarred } : file
        ))
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      // Revert on error
      setFiles(prev => prev.map(file => 
        file.id === id ? { ...file, is_starred: isStarred } : file
      ))
    }
  }

  const toggleShare = async (id: string, type: 'file' | 'folder', isShared: boolean) => {
    try {
      // Update locally first for better UX
      setFiles(prev => prev.map(file => 
        file.id === id ? { ...file, is_shared: !isShared } : file
      ))

      // If demo file, just keep local update
      if (id.startsWith('demo-')) {
        return
      }

      const table = type === 'file' ? 'files' : 'folders'
      const { error } = await supabase
        .from(table)
        .update({ is_shared: !isShared })
        .eq('id', id)

      if (error) {
        console.error('Error toggling share:', error)
        // Revert on error
        setFiles(prev => prev.map(file => 
          file.id === id ? { ...file, is_shared: isShared } : file
        ))
      }
    } catch (error) {
      console.error('Error toggling share:', error)
      // Revert on error
      setFiles(prev => prev.map(file => 
        file.id === id ? { ...file, is_shared: isShared } : file
      ))
    }
  }

  const deleteItem = async (id: string, type: 'file' | 'folder') => {
    try {
      // Remove from local state immediately for better UX
      setFiles(prev => prev.filter(file => file.id !== id))

      // If demo file, just keep local update
      if (id.startsWith('demo-')) {
        return
      }

      const table = type === 'file' ? 'files' : 'folders'
      
      // Soft delete: set is_deleted = true and deleted_at = now()
      const { error } = await supabase
        .from(table)
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id)

      if (error) {
        console.error('Error soft deleting item:', error)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const openDocument = async (file: FileItem) => {
    if (file.type === 'folder') {
      onNavigate(file.name)
      return
    }

    // For demo files, show a preview
    if (file.id.startsWith('demo-')) {
      openDemoViewer(file)
      return
    }

    // Get public URL from Supabase storage (using 'scarlet-drives' bucket)
    if (file.storage_path) {
      try {
        const { data } = supabase.storage
          .from('scarlet-drives')
          .getPublicUrl(file.storage_path)
        
        if (data?.publicUrl) {
          window.open(data.publicUrl, '_blank')
          return
        }
      } catch (error) {
        console.error('Error getting public URL:', error)
      }
    }

    // Fallback: Create a mock viewer
    openDemoViewer(file)
  }

  const openDemoViewer = (file: FileItem) => {
    const newWindow = window.open('', '_blank', 'width=1000,height=700')
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${file.name} - Scarlet Drives</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #1f2937;
              color: white;
            }
            .header {
              background: #374151;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border: 1px solid #4b5563;
            }
            .content {
              background: #374151;
              border: 1px solid #4b5563;
              border-radius: 8px;
              height: 500px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
              text-align: center;
            }
            .demo-notice {
              background: #1e40af;
              color: white;
              padding: 10px 20px;
              border-radius: 6px;
              margin-bottom: 20px;
              text-align: center;
            }
            .user-info {
              background: #059669;
              color: white;
              padding: 10px 20px;
              border-radius: 6px;
              margin-bottom: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="demo-notice">
            <strong>Demo Mode:</strong> This is a preview. Connect to Supabase to view actual files.
          </div>
          <div class="user-info">
            <strong>User Folder:</strong> Files are stored in your personal folder (${user?.id || 'user-id'})
          </div>
          <div class="header">
            <h1>${file.name}</h1>
            <p>File size: ${file.size ? formatFileSize(file.size) : 'Unknown'}</p>
            <p>Type: ${file.file_type || 'Unknown'}</p>
            <p>Storage path: ${user?.id || 'user-id'}/${file.name}</p>
          </div>
          <div class="content">
            <div>
              <h3>File Preview</h3>
              <p>In a real implementation, this would show the actual file content<br>
              from your personal Supabase storage folder.</p>
              <p><strong>Your files are completely isolated from other users!</strong></p>
            </div>
          </div>
        </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  const downloadFile = async (file: FileItem) => {
    if (file.id.startsWith('demo-')) {
      alert('This is a demo file. Connect to Supabase to download actual files.')
      return
    }

    if (!file.storage_path) {
      alert('File path not found. Cannot download.')
      return
    }

    setDownloading(file.id)

    try {
      // Get the file from Supabase storage
      const { data, error } = await supabase.storage
        .from('scarlet-drives')
        .download(file.storage_path)

      if (error) {
        console.error('Error downloading file:', error)
        alert('Failed to download file. Please try again.')
        return
      }

      if (!data) {
        alert('File not found or empty.')
        return
      }

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: file.file_type || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const generateShareLink = (file: FileItem) => {
    // Generate a shareable link
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${file.id}`
    setShareLink(shareUrl)
    setShowShareModal(file.id)
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
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
    if (fileType?.includes('image')) {
      return (
        <img 
          src="/image-icon.png" 
          alt="Image" 
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-cover rounded"
        />
      )
    }
    if (fileType?.includes('video')) return '🎬'
    if (fileType?.includes('audio')) return '🎵'
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('document') || fileType?.includes('text')) return '📝'
    if (fileType?.includes('spreadsheet') || fileType?.includes('csv')) return '📊'
    return '📄'
  }

  const getFileIconForList = (fileType: string) => {
    if (fileType?.includes('image')) {
      return (
        <img 
          src="/image-icon.png" 
          alt="Image" 
          className="w-5 h-5 object-cover rounded"
        />
      )
    }
    if (fileType?.includes('video')) return '🎬'
    if (fileType?.includes('audio')) return '🎵'
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('document') || fileType?.includes('text')) return '📝'
    if (fileType?.includes('spreadsheet') || fileType?.includes('csv')) return '📊'
    return '📄'
  }

  const handleOptionsClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setShowOptionsMenu(showOptionsMenu === itemId ? null : itemId)
  }

  const OptionsMenu = ({ item }: { item: FileItem }) => (
    <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
      <button
        onClick={(e) => {
          e.stopPropagation()
          openDocument(item)
          setShowOptionsMenu(null)
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-gray-200"
      >
        {item.type === 'file' ? <Eye className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
        {item.type === 'file' ? 'Open' : 'Open folder'}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleStar(item.id, item.type, item.is_starred)
          setShowOptionsMenu(null)
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-gray-200"
      >
        <Star className={`w-4 h-4 ${item.is_starred ? 'text-yellow-500 fill-current' : ''}`} />
        {item.is_starred ? 'Remove from starred' : 'Add to starred'}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          generateShareLink(item)
          setShowOptionsMenu(null)
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-gray-200"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleShare(item.id, item.type, item.is_shared)
          setShowOptionsMenu(null)
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-gray-200"
      >
        <Link className="w-4 h-4" />
        {item.is_shared ? 'Make private' : 'Make public'}
      </button>
      {item.type === 'file' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            downloadFile(item)
            setShowOptionsMenu(null)
          }}
          disabled={downloading === item.id}
          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {downloading === item.id ? 'Downloading...' : 'Download'}
        </button>
      )}
      <hr className="my-1 border-gray-600" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          deleteItem(item.id, item.type)
          setShowOptionsMenu(null)
        }}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 text-red-400"
      >
        <Trash2 className="w-4 h-4" />
        Move to trash
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-lg font-medium text-yellow-400 mb-2">Database Setup Required</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 mb-4">
          <h4 className="text-blue-400 font-medium mb-2">User Folder Structure</h4>
          <p className="text-sm text-gray-300">
            Your files will be stored in: <code className="bg-gray-700 px-2 py-1 rounded text-blue-300">{user?.id || 'your-user-id'}/</code>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            This ensures complete isolation from other users' data.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          To get started: Connect to Supabase and run the database migrations.
        </p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <Folder className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">No Files Yet</h3>
        <p className="text-gray-500 mb-4">Upload your first file to get started</p>
        <div className="bg-green-900 bg-opacity-20 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="text-green-400 font-medium mb-2">Your Personal Folder</h4>
          <p className="text-sm text-gray-300">
            Files will be stored in: <code className="bg-gray-700 px-2 py-1 rounded text-green-300">{user?.id || 'your-user-id'}/</code>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Complete data isolation and security guaranteed.
          </p>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="border-b border-gray-700 px-4 sm:px-6 py-3 bg-gray-900">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6 sm:col-span-6">Name</div>
              <div className="col-span-3 sm:col-span-2 hidden sm:block">Modified</div>
              <div className="col-span-2 sm:col-span-2 hidden sm:block">Size</div>
              <div className="col-span-6 sm:col-span-2">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-700">
            {files.map((item) => (
              <div key={item.id} className="px-4 sm:px-6 py-4 hover:bg-gray-700 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0">
                    {item.type === 'folder' ? (
                      <Folder className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    ) : (
                      <div className="flex-shrink-0">
                        {typeof getFileIconForList(item.file_type || '') === 'string' ? (
                          <span className="text-lg">{getFileIconForList(item.file_type || '')}</span>
                        ) : (
                          getFileIconForList(item.file_type || '')
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => openDocument(item)}
                      className="text-sm font-medium text-white hover:text-red-400 transition-colors text-left truncate"
                    >
                      {item.name}
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      {item.is_shared && <Share2 className="w-3 h-3 text-green-400" />}
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-sm text-gray-400 hidden sm:block">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-sm text-gray-400 hidden sm:block">
                    {item.size ? formatFileSize(item.size) : '-'}
                  </div>
                  <div className="col-span-6 sm:col-span-2 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => toggleStar(item.id, item.type, item.is_starred)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Star className={`w-4 h-4 ${item.is_starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                    {item.type === 'file' && (
                      <button
                        onClick={() => downloadFile(item)}
                        disabled={downloading === item.id}
                        className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download file"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => handleOptionsClick(e, item.id)}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {showOptionsMenu === item.id && <OptionsMenu item={item} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Share File</h3>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                    >
                      {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Anyone with this link can access the file. Make sure the file is marked as "public" for sharing to work.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowShareModal(null)}
                    className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {files.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 hover:shadow-lg hover:border-red-500 transition-all duration-200 cursor-pointer group"
            onClick={() => openDocument(item)}
          >
            {/* File Preview/Icon */}
            <div className="mb-3 relative">
              {item.type === 'folder' ? (
                <div className="w-full h-20 sm:h-24 md:h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Folder className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400" />
                </div>
              ) : (
                <div className="w-full h-20 sm:h-24 md:h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                  {typeof getFileIcon(item.file_type || '') === 'string' ? (
                    <span className="text-2xl sm:text-3xl md:text-4xl">{getFileIcon(item.file_type || '')}</span>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {getFileIcon(item.file_type || '')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Overlay with actions */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {item.is_starred && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOptionsClick(e, item.id)}
                    className="p-1 bg-gray-900 bg-opacity-75 hover:bg-gray-800 rounded"
                  >
                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </button>
                  {showOptionsMenu === item.id && <OptionsMenu item={item} />}
                </div>
              </div>
            </div>
            
            <h3 className="font-medium text-white truncate mb-2 text-sm sm:text-base" title={item.name}>
              {item.name}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="truncate">{new Date(item.created_at).toLocaleDateString()}</span>
              {item.size && <span className="ml-2 flex-shrink-0">{formatFileSize(item.size)}</span>}
            </div>

            {item.is_shared && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                  <Share2 className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Shared</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Share File</h3>
              <button
                onClick={() => setShowShareModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  >
                    {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Anyone with this link can access the file. Make sure the file is marked as "public" for sharing to work.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(null)}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FileGrid