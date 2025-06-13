import React, { useState } from 'react'
import { Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const SecuritySection: React.FC = () => {
  const [showApiKey, setShowApiKey] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: Shield,
      status: twoFactorEnabled ? 'enabled' : 'disabled',
      action: () => setTwoFactorEnabled(!twoFactorEnabled)
    },
    {
      title: 'End-to-End Encryption',
      description: 'All your files are encrypted with AES-256',
      icon: Key,
      status: 'enabled',
      action: null
    },
    {
      title: 'Auto-Lock Sessions',
      description: 'Automatically lock inactive sessions after 30 minutes',
      icon: Clock,
      status: 'enabled',
      action: null
    }
  ]

  const recentActivity = [
    {
      action: 'Login from Chrome on Windows',
      location: 'New York, US',
      time: '2 hours ago',
      status: 'success'
    },
    {
      action: 'Password changed',
      location: 'New York, US',
      time: '1 day ago',
      status: 'success'
    },
    {
      action: 'Failed login attempt',
      location: 'Unknown location',
      time: '3 days ago',
      status: 'warning'
    },
    {
      action: 'API key generated',
      location: 'New York, US',
      time: '1 week ago',
      status: 'success'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Security Settings</h1>
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Account Secure</span>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Security Score</h3>
              <p className="text-sm text-gray-400">Excellent</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">85/100</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Encryption</h3>
              <p className="text-sm text-gray-400">AES-256</p>
            </div>
          </div>
          <p className="text-green-400 text-sm font-medium">✓ All files encrypted</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Alerts</h3>
              <p className="text-sm text-gray-400">1 Warning</p>
            </div>
          </div>
          <p className="text-yellow-400 text-sm">Enable 2FA for better security</p>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Features</h3>
        <div className="space-y-4">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <Icon className="w-6 h-6 text-red-400" />
                  <div>
                    <h4 className="text-white font-medium">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feature.status === 'enabled' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {feature.status}
                  </span>
                  {feature.action && (
                    <button
                      onClick={feature.action}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      {feature.status === 'enabled' ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Production API Key</h4>
              <p className="text-gray-400 text-sm font-mono">
                {showApiKey ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••••••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 hover:bg-gray-600 rounded-lg"
              >
                {showApiKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Activity */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Security Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.location}</p>
              </div>
              <span className="text-gray-400 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SecuritySection