import React, { useState } from 'react'
import { Users, Plus, Mail, Shield, Crown, UserCheck, MoreVertical } from 'lucide-react'

const TeamSection: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Owner',
      avatar: 'JD',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: 'Admin',
      avatar: 'SW',
      status: 'active',
      joinedAt: '2024-02-01'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: 'Editor',
      avatar: 'MJ',
      status: 'active',
      joinedAt: '2024-02-15'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily@company.com',
      role: 'Viewer',
      avatar: 'ED',
      status: 'pending',
      joinedAt: '2024-03-01'
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-400" />
      case 'Editor':
        return <UserCheck className="w-4 h-4 text-blue-400" />
      default:
        return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-yellow-900 text-yellow-300'
      case 'Admin':
        return 'bg-red-900 text-red-300'
      case 'Editor':
        return 'bg-blue-900 text-blue-300'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const handleInvite = () => {
    // Handle team member invitation
    console.log('Inviting:', inviteEmail, 'as', inviteRole)
    setShowInviteModal(false)
    setInviteEmail('')
    setInviteRole('viewer')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-sm text-gray-400">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-sm text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-sm text-gray-400">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {teamMembers.map((member) => (
            <div key={member.id} className="px-6 py-4 hover:bg-gray-700 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${member.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-600 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleInvite}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamSection