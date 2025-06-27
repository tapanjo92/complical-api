'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiKey {
  id: string
  name: string
  description?: string
  apiKey?: string
  createdAt: string
  lastUsed: string | null
  status: 'active' | 'revoked'
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyDescription, setNewKeyDescription] = useState('')
  const [newKeyCreated, setNewKeyCreated] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Fetch API keys on mount
  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const idToken = localStorage.getItem('id_token')
      if (!idToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${window.COMPLICAL_CONFIG?.API_URL || ''}/v1/auth/api-keys`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('id_token')
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch API keys')
      }

      const data = await response.json()
      setKeys(data.apiKeys || [])
    } catch (err) {
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const idToken = localStorage.getItem('id_token')
      if (!idToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${window.COMPLICAL_CONFIG?.API_URL || ''}/v1/auth/api-keys`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: newKeyName,
          description: newKeyDescription,
          expiresIn: 90, // Default 90 days
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('id_token')
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to create API key')
      }

      const data = await response.json()
      setNewKeyCreated(data.apiKey)
      
      // Refresh the list
      await fetchApiKeys()
      
      setNewKeyName('')
      setNewKeyDescription('')
    } catch (err) {
      setError('Failed to create API key')
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      const idToken = localStorage.getItem('id_token')
      const csrfToken = localStorage.getItem('csrf_token')
      
      if (!idToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${window.COMPLICAL_CONFIG?.API_URL || ''}/v1/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('id_token')
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to revoke API key')
      }

      // Refresh the list
      await fetchApiKeys()
    } catch (err) {
      setError('Failed to revoke API key')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading API keys...</p>
      </div>
    )
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

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
                <div>
                  <label htmlFor="key-description" className="block text-sm font-medium mb-2">
                    Description (optional)
                  </label>
                  <input
                    id="key-description"
                    type="text"
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                    placeholder="e.g., Used for production environment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
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
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewKeyName('')
                      setNewKeyDescription('')
                      setError('')
                    }}
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
                <button
                  onClick={() => {
                    setNewKeyCreated(null)
                    setShowCreateForm(false)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {keys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No API keys yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Create Your First Key
              </button>
            </CardContent>
          </Card>
        ) : (
          keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{key.name}</h3>
                    {key.description && (
                      <p className="text-sm text-gray-600 mt-1">{key.description}</p>
                    )}
                    <p className="font-mono text-sm text-gray-500 mt-2">ID: {key.id}</p>
                    <div className="flex space-x-4 mt-3 text-sm text-gray-500">
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      <span>Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
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
          ))
        )}
      </div>
    </div>
  )
}