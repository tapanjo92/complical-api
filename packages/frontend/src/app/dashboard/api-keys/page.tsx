'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  status: 'active' | 'revoked'
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'cc_live_****************************7d3f',
      created: '2024-12-01',
      lastUsed: '2024-12-26',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'cc_test_****************************4a2b',
      created: '2024-11-15',
      lastUsed: '2024-12-25',
      status: 'active'
    }
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyCreated, setNewKeyCreated] = useState<string | null>(null)

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Call API to create key
    // For now, mock the response
    const mockKey = `cc_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    setNewKeyCreated(mockKey)
    setKeys([...keys, {
      id: Date.now().toString(),
      name: newKeyName,
      key: `cc_live_****************************${mockKey.slice(-4)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active'
    }])
    
    setNewKeyName('')
    setTimeout(() => {
      setNewKeyCreated(null)
      setShowCreateForm(false)
    }, 10000)
  }

  const handleRevokeKey = (keyId: string) => {
    setKeys(keys.map(key => 
      key.id === keyId ? { ...key, status: 'revoked' } : key
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Create New Key
        </button>
      </div>

      {/* Create Key Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for accessing CompliCal API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!newKeyCreated ? (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="block text-sm font-medium mb-2">
                    Key Name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Server"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    Create Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    API Key created successfully!
                  </p>
                  <p className="text-xs text-green-700 mb-3">
                    Copy this key now. You won't be able to see it again.
                  </p>
                  <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                    {newKeyCreated}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyCreated)
                    alert('Key copied to clipboard!')
                  }}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {keys.map((key) => (
          <Card key={key.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{key.name}</h3>
                  <p className="font-mono text-sm text-gray-600 mt-1">{key.key}</p>
                  <div className="flex space-x-4 mt-3 text-sm text-gray-500">
                    <span>Created: {key.created}</span>
                    <span>Last used: {key.lastUsed}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    key.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {key.status}
                  </span>
                  {key.status === 'active' && (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}