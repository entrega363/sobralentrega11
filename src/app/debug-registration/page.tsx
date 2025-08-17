'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface DiagnosisResult {
  success: boolean
  diagnosis?: {
    timestamp: string
    tests: {
      profiles_table: {
        accessible: boolean
        error?: string
        sample_data?: any[]
        count: number
      }
      auth_users: {
        accessible: boolean
        error?: string
        count: number
      }
      empresas_table: {
        accessible: boolean
        error?: string
        sample_data?: any[]
        count: number
      }
      logs_table: {
        accessible: boolean
        error?: string
        sample_data?: any[]
        count: number
      }
    }
    issues_detected: Array<{
      severity: string
      issue: string
      details: string
    }>
    recommendations: string[]
  }
  error?: string
}

interface UserDiagnosisResult {
  success: boolean
  user_diagnosis?: {
    email: string
    user_id?: string
    auth_user: {
      exists: boolean
      created_at?: string
      email_confirmed: boolean
      metadata?: any
    }
    profile: {
      exists: boolean
      error?: string
      data?: any
    }
    empresa: {
      exists: boolean
      error?: string
      data?: any
    }
    logs: {
      available: boolean
      error?: string
      data?: any[]
    }
  }
  error?: string
}

export default function DebugRegistrationPage() {
  const [systemDiagnosis, setSystemDiagnosis] = useState<DiagnosisResult | null>(null)
  const [userDiagnosis, setUserDiagnosis] = useState<UserDiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const runSystemDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/diagnose')
      const data = await response.json()
      setSystemDiagnosis(data)
    } catch (error) {
      setSystemDiagnosis({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const runUserDiagnosis = async () => {
    if (!userEmail.trim()) return
    
    setUserLoading(true)
    try {
      const response = await fetch('/api/auth/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      })
      const data = await response.json()
      setUserDiagnosis(data)
    } catch (error) {
      setUserDiagnosis({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUserLoading(false)
    }
  }

  useEffect(() => {
    runSystemDiagnosis()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (accessible: boolean, error?: string) => {
    if (accessible) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registration System Debug</h1>
          <p className="text-muted-foreground">
            Diagnose and debug user registration issues
          </p>
        </div>
        <Button onClick={runSystemDiagnosis} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh Diagnosis
        </Button>
      </div>

      {/* System Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>System Diagnosis</CardTitle>
          <CardDescription>
            Overall system health and database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Running diagnosis...</span>
            </div>
          ) : systemDiagnosis?.success ? (
            <div className="space-y-4">
              {/* Database Tables Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profiles</span>
                    {getStatusIcon(systemDiagnosis.diagnosis?.tests.profiles_table.accessible || false)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Count: {systemDiagnosis.diagnosis?.tests.profiles_table.count || 0}
                  </p>
                  {systemDiagnosis.diagnosis?.tests.profiles_table.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {systemDiagnosis.diagnosis.tests.profiles_table.error}
                    </p>
                  )}
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Auth Users</span>
                    {getStatusIcon(systemDiagnosis.diagnosis?.tests.auth_users.accessible || false)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Count: {systemDiagnosis.diagnosis?.tests.auth_users.count || 0}
                  </p>
                  {systemDiagnosis.diagnosis?.tests.auth_users.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {systemDiagnosis.diagnosis.tests.auth_users.error}
                    </p>
                  )}
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Empresas</span>
                    {getStatusIcon(systemDiagnosis.diagnosis?.tests.empresas_table.accessible || false)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Count: {systemDiagnosis.diagnosis?.tests.empresas_table.count || 0}
                  </p>
                  {systemDiagnosis.diagnosis?.tests.empresas_table.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {systemDiagnosis.diagnosis.tests.empresas_table.error}
                    </p>
                  )}
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Logs</span>
                    {getStatusIcon(systemDiagnosis.diagnosis?.tests.logs_table.accessible || false)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Count: {systemDiagnosis.diagnosis?.tests.logs_table.count || 0}
                  </p>
                  {systemDiagnosis.diagnosis?.tests.logs_table.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {systemDiagnosis.diagnosis.tests.logs_table.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Issues Detected */}
              {systemDiagnosis.diagnosis?.issues_detected && systemDiagnosis.diagnosis.issues_detected.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Issues Detected
                  </h3>
                  <div className="space-y-2">
                    {systemDiagnosis.diagnosis.issues_detected.map((issue, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">{issue.issue}</span>
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {systemDiagnosis.diagnosis?.recommendations && systemDiagnosis.diagnosis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <ul className="space-y-1">
                    {systemDiagnosis.diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-500">
              <p>System diagnosis failed: {systemDiagnosis?.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User-Specific Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>User-Specific Diagnosis</CardTitle>
          <CardDescription>
            Check the registration status of a specific user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runUserDiagnosis()}
            />
            <Button onClick={runUserDiagnosis} disabled={userLoading || !userEmail.trim()}>
              {userLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Diagnose User
            </Button>
          </div>

          {userDiagnosis && (
            <div className="space-y-4">
              {userDiagnosis.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">Auth User</h4>
                      <div className="space-y-1 text-sm">
                        <p>Exists: {userDiagnosis.user_diagnosis?.auth_user.exists ? '✅' : '❌'}</p>
                        <p>Email Confirmed: {userDiagnosis.user_diagnosis?.auth_user.email_confirmed ? '✅' : '❌'}</p>
                        {userDiagnosis.user_diagnosis?.auth_user.created_at && (
                          <p>Created: {new Date(userDiagnosis.user_diagnosis.auth_user.created_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">Profile</h4>
                      <div className="space-y-1 text-sm">
                        <p>Exists: {userDiagnosis.user_diagnosis?.profile.exists ? '✅' : '❌'}</p>
                        {userDiagnosis.user_diagnosis?.profile.error && (
                          <p className="text-red-500">Error: {userDiagnosis.user_diagnosis.profile.error}</p>
                        )}
                        {userDiagnosis.user_diagnosis?.profile.data && (
                          <p>Role: {userDiagnosis.user_diagnosis.profile.data.role}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">Empresa</h4>
                      <div className="space-y-1 text-sm">
                        <p>Exists: {userDiagnosis.user_diagnosis?.empresa.exists ? '✅' : '❌'}</p>
                        {userDiagnosis.user_diagnosis?.empresa.error && (
                          <p className="text-red-500">Error: {userDiagnosis.user_diagnosis.empresa.error}</p>
                        )}
                        {userDiagnosis.user_diagnosis?.empresa.data && (
                          <p>Status: {userDiagnosis.user_diagnosis.empresa.data.status}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">Logs</h4>
                      <div className="space-y-1 text-sm">
                        <p>Available: {userDiagnosis.user_diagnosis?.logs.available ? '✅' : '❌'}</p>
                        {userDiagnosis.user_diagnosis?.logs.error && (
                          <p className="text-red-500">Error: {userDiagnosis.user_diagnosis.logs.error}</p>
                        )}
                        {userDiagnosis.user_diagnosis?.logs.data && (
                          <p>Entries: {userDiagnosis.user_diagnosis.logs.data.length}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Raw Data */}
                  <details className="border rounded-lg p-3">
                    <summary className="cursor-pointer font-medium">Raw Data</summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(userDiagnosis.user_diagnosis, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-500">
                  <p>User diagnosis failed: {userDiagnosis.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common debugging and fix actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.open('/api/auth/diagnose', '_blank')}>
              View Raw Diagnosis JSON
            </Button>
            <Button variant="outline" onClick={() => window.open('/test-cadastro', '_blank')}>
              Test Registration Form
            </Button>
            <Button variant="outline" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
              Open Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}