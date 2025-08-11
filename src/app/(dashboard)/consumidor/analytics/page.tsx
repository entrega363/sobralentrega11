'use client'

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export default function ConsumidorAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <AnalyticsDashboard userType="consumidor" />
    </div>
  )
}