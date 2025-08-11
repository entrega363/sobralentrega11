'use client'

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'

export default function AdminAnalyticsPage() {
  return (
    <AdminPageLayout
      title="Analytics"
      description="Métricas e relatórios da plataforma"
    >
      <AnalyticsDashboard userType="admin" />
    </AdminPageLayout>
  )
}