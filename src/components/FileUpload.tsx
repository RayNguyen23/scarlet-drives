import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Folder, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface FileUploadProps {
  currentPath: string
  onFileUploaded: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({ currentPath, onFileUploaded }) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [folderName, setFolderName] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return

    setUploading(true)
    const newProgress: { [key: string]: number } = {}

    for (const file of acceptedFiles) {
      newProgress[file.name] = 0
      setUploadProgress({ ...newProgress })

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${file.name}`
        
        // Create user-specific path: {user-id}/{currentPath}/{fileName}
        const userFolder = user.id
        const fullPath = currentPath 
          ? `${userFolder}/${currentPath}/${fileName}` 
          : `${userFolder}/${fileName}`

        // Check if we have Supabase connection
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          // Simulate upload for demo
          for (let i = 0; i <= 100; i += 10) {
            newProgress[file.name] = i
            setUploadProgress({ ...newProgress })
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          continue
        }

        // Upload to 'scarlet-drives' bucket with user-specific folder structure
        const { error: uploadError } = await supabase.storage
          .from('scarlet-drives')
          .upload(fullPath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            size: file.size,
            type: file.type,
            folder_path: currentPath,
            user_id: user.id,
            storage_path: fullPath, // Store the full path including user folder
            is_deleted: false
          })

        if (dbError) throw dbError

        newProgress[file.name] = 100
        setUploadProgress({ ...newProgress })
      } catch (error) {
        console.error('Error uploading file:', error)
        delete newProgress[file.name]
      }
    }

    setTimeout(() => {
      setUploading(false)
      setUploadProgress({})
      setShowUploadModal(false)
      onFileUploaded()
    }, 1000)
  }, [user, currentPath, onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  })

  const createFolder = async () => {
    if (!user || !folderName.trim()) return

    try {
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName
      
      // Check if we have Supabase connection
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Just close modal for demo
        setFolderName('')
        setShowCreateFolder(false)
        onFileUploaded()
        return
      }
      
      const { error } = await supabase
        .from('folders')
        .insert({
          name: folderName,
          path: folderPath,
          parent_path: currentPath,
          user_id: user.id,
          is_deleted: false
        })

      if (error) throw error

      setFolderName('')
      setShowCreateFolder(false)
      onFileUploaded()
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCreateFolder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Folder</h3>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={createFolder}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragActive
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-400 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-300 font-medium mb-2">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports all file types
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-3 text-white">Uploading Files</h4>
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="flex items-center gap-3">
                      <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 truncate">
                          {fileName}
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            {!uploading && (
              <div className="mt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-full bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload