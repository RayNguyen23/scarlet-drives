import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/AuthForm'
import Sidebar from './components/Sidebar'
import FileUpload from './components/FileUpload'
import FileGrid from './components/FileGrid'
import PlansSection from './components/PlansSection'
import PaymentSection from './components/PaymentSection'
import AnalyticsSection from './components/AnalyticsSection'
import SecuritySection from './components/SecuritySection'
import SettingsSection from './components/SettingsSection'
import HelpSection from './components/HelpSection'
import RecentSection from './components/RecentSection'
import StarredSection from './components/StarredSection'
import SharedSection from './components/SharedSection'
import TrashSection from './components/TrashSection'
import Stats from './components/Stats'
import { Search, Grid, List, Bell, Menu, X } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentSection, setCurrentSection] = useState('home')
  const [currentPath, setCurrentPath] = useState('')
  const [refreshFiles, setRefreshFiles] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavigate = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName
    setCurrentPath(newPath)
  }

  const handleFileUploaded = () => {
    setRefreshFiles(!refreshFiles)
  }

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    setCurrentSection('payment')
  }

  const breadcrumbs = currentPath.split('/').filter(Boolean)

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'recent':
        return <RecentSection />
      case 'starred':
        return <StarredSection />
      case 'shared':
        return <SharedSection />
      case 'trash':
        return <TrashSection />
      case 'plans':
        return <PlansSection onPlanSelect={handlePlanSelect} />
      case 'payment':
        return <PaymentSection selectedPlan={selectedPlan} onBack={() => setCurrentSection('plans')} />
      case 'analytics':
        return <AnalyticsSection />
      case 'security':
        return <SecuritySection />
      case 'settings':
        return <SettingsSection />
      case 'help':
        return <HelpSection />
      default:
        return (
          <div className="space-y-6">
            {/* Stats */}
            <Stats />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white">My Files</h1>
                
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 mt-2 overflow-x-auto">
                    <button
                      onClick={() => setCurrentPath('')}
                      className="text-red-400 hover:text-red-300 font-medium whitespace-nowrap"
                    >
                      Home
                    </button>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <span className="text-gray-500">/</span>
                        <button
                          onClick={() => {
                            const newPath = breadcrumbs.slice(0, index + 1).join('/')
                            setCurrentPath(newPath)
                          }}
                          className="text-red-400 hover:text-red-300 font-medium whitespace-nowrap"
                        >
                          {crumb}
                        </button>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 w-full sm:w-64"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-600">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Notifications */}
                <button className="p-2 hover:bg-gray-800 rounded-lg border border-gray-600">
                  <Bell className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* File Upload */}
            <FileUpload 
              currentPath={currentPath} 
              onFileUploaded={handleFileUploaded}
            />

            {/* File Grid */}
            <FileGrid
              currentPath={currentPath}
              onNavigate={handleNavigate}
              refresh={refreshFiles}
              viewMode={viewMode}
            />
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg border border-gray-600 lg:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out lg:transition-none
      `}>
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={(section) => {
            setCurrentSection(section)
            setSidebarOpen(false) // Close mobile menu when selecting
          }}
        />
      </div>
      
      <main className="flex-1 overflow-hidden lg:ml-0">
        <div className="h-full overflow-y-auto p-4 sm:p-6 pt-16 lg:pt-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App