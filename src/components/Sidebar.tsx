import React from 'react'
import { 
  Home, 
  Clock, 
  Star, 
  Share2, 
  Trash2, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Shield,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSectionChange }) => {
  const { signOut, user } = useAuth()

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'shared', label: 'Shared', icon: Share2 },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const bottomItems = [
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col border-r border-gray-700 shadow-lg">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Scarlet Drives" 
            className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg object-contain bg-white p-1" 
            onError={(e) => {
              // Fallback if logo doesn't load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg hidden"
            style={{ display: 'none' }}
          >
            S
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">Scarlet Drives</h1>
            <p className="text-xs text-gray-400">Secure Cloud Storage</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'Guest User'}
            </p>
            <p className="text-xs text-red-400">Pro Plan</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 sm:px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 sm:p-4 border-t border-gray-700">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-red-900 hover:text-red-300"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar