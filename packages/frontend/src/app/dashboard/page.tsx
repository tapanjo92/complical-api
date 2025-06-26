'use client'

import { useEffect, useState } from 'react'
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

export default function DashboardPage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual usage stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        apiCalls: 127,
        apiCallsLimit: 1000,
        currentPeriod: 'December 2024',
        subscription: {
          tier: 'Developer',
          status: 'Active'
        }
      })
      setLoading(false)
    }, 500)
  }, [])

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