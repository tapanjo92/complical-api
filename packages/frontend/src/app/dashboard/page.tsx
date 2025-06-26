'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UsageStats {
  apiCalls: number
  apiCallsLimit: number
  currentPeriod: string
  subscription: {
    tier: string
    status: string
  }
}

interface ApiKey {
  id: string
  name: string
  apiKey?: string
  createdAt: string
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [creatingKey, setCreatingKey] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch actual usage stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        apiCalls: 127,
        apiCallsLimit: 10000,
        currentPeriod: 'December 2024',
        subscription: {
          tier: 'Free',
          status: 'Active'
        }
      })
      setLoading(false)
    }, 500)
    
    // Fetch API keys
    fetchApiKeys()
  }, [])
  
  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return
      
      const response = await fetch(`${window.COMPLICAL_CONFIG?.API_URL || ''}/v1/auth/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err)
    }
  }
  
  const handleCreateApiKey = async () => {
    setCreatingKey(true)
    setNewApiKey(null)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/auth/login')
        return
      }
      
      const response = await fetch(`${window.COMPLICAL_CONFIG?.API_URL || ''}/v1/auth/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Quick API Key',
          description: 'Generated from dashboard',
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewApiKey(data.apiKey)
        fetchApiKeys() // Refresh the list
      }
    } catch (err) {
      console.error('Failed to create API key:', err)
    } finally {
      setCreatingKey(false)
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (!stats) {
    return <div>Error loading stats</div>
  }

  const usagePercentage = (stats.apiCalls / stats.apiCallsLimit) * 100

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Usage</CardTitle>
            <CardDescription>Current period: {stats.currentPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.apiCalls.toLocaleString()} / {stats.apiCallsLimit.toLocaleString()}
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black rounded-full h-2"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {usagePercentage.toFixed(1)}% of monthly limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription</CardTitle>
            <CardDescription>Current plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscription.tier}</div>
            <p className="text-sm text-green-600 mt-1">
              {stats.subscription.status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/dashboard/api-keys"
                className="block text-sm text-blue-600 hover:underline"
              >
                → Generate API Key
              </a>
              <a
                href="/docs"
                className="block text-sm text-blue-600 hover:underline"
              >
                → View Documentation
              </a>
              <a
                href="/dashboard/billing"
                className="block text-sm text-blue-600 hover:underline"
              >
                → Upgrade Plan
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Quick Access */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Quick access to your API credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {newApiKey ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  New API Key Created!
                </p>
                <p className="text-xs text-green-700 mb-3">
                  Copy this key now. You won't be able to see it again.
                </p>
                <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                  {newApiKey}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newApiKey)
                    alert('API key copied to clipboard!')
                  }}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Copy Key
                </button>
                <button
                  onClick={() => setNewApiKey(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div>
              {apiKeys.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      You have {apiKeys.filter(k => k.status === 'active').length} active API {apiKeys.filter(k => k.status === 'active').length === 1 ? 'key' : 'keys'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last created: {new Date(apiKeys[0]?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateApiKey}
                      disabled={creatingKey}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                      {creatingKey ? 'Creating...' : 'Create New Key'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('This will revoke your current key and create a new one. Continue?')) {
                          handleCreateApiKey()
                        }
                      }}
                      disabled={creatingKey}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Refresh Key
                    </button>
                    <a
                      href="/dashboard/api-keys"
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center"
                    >
                      Manage All Keys
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No API keys yet</p>
                  <button
                    onClick={handleCreateApiKey}
                    disabled={creatingKey}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {creatingKey ? 'Creating...' : 'Create Your First API Key'}
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Activity</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">GET /v1/au/ato/deadlines</p>
                <p className="text-sm text-gray-600">2 minutes ago</p>
              </div>
              <span className="text-sm text-green-600">200 OK</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">GET /v1/au/ato/deadlines?type=BAS_QUARTERLY</p>
                <p className="text-sm text-gray-600">1 hour ago</p>
              </div>
              <span className="text-sm text-green-600">200 OK</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">GET /v1/au/ato/deadlines</p>
                <p className="text-sm text-gray-600">3 hours ago</p>
              </div>
              <span className="text-sm text-green-600">200 OK</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}