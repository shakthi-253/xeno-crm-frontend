import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  CheckCircle, Mail, MousePointerClick,
  TrendingUp, Loader2, RefreshCw, AlertCircle
} from 'lucide-react'
import { api } from '../services/api'

function KPICard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}

function FunnelBar({
  label,
  value,
  max,
  color,
  percentage
}: {
  label: string
  value: number
  max: number
  color: string
  percentage: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">
            {value.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-xs">{percentage}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/campaigns')
      setCampaigns(data.campaigns)
      const first = data.campaigns.find((c: any) => c.stats.sent > 0)
      if (first) {
        setSelected(first.campaign_id)
        loadAnalytics(first.campaign_id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (id: string) => {
    setAnalyticsLoading(true)
    try {
      const { data } = await api.get(`/analytics/campaigns/${id}`)
      setAnalytics(data)
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const totalSent = campaigns.reduce((a, c) => a + c.stats.sent, 0)
  const totalDelivered = campaigns.reduce((a, c) => a + c.stats.delivered, 0)
  const totalOpened = campaigns.reduce((a, c) => a + c.stats.opened, 0)
  const totalClicked = campaigns.reduce((a, c) => a + c.stats.clicked, 0)
  const avgDelivery = totalSent > 0
    ? Math.round((totalDelivered / totalSent) * 100)
    : 0

  const chartData = campaigns
    .filter(c => c.stats.sent > 0)
    .slice(0, 8)
    .map(c => ({
      name: c.name.slice(0, 12) + (c.name.length > 12 ? '...' : ''),
      sent: c.stats.sent,
      delivered: c.stats.delivered,
      opened: c.stats.opened,
      clicked: c.stats.clicked,
    }))

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Campaign Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track performance across all campaigns
          </p>
        </div>
        <button
          onClick={loadCampaigns}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Mail}
          label="Total Sent"
          value={totalSent.toLocaleString('en-IN')}
          color="bg-violet-600"
        />
        <KPICard
          icon={CheckCircle}
          label="Delivery Rate"
          value={`${avgDelivery}%`}
          color="bg-emerald-600"
        />
        <KPICard
          icon={TrendingUp}
          label="Total Opens"
          value={totalOpened.toLocaleString('en-IN')}
          color="bg-cyan-600"
        />
        <KPICard
          icon={MousePointerClick}
          label="Total Clicks"
          value={totalClicked.toLocaleString('en-IN')}
          color="bg-orange-600"
        />
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-5">
            Campaign Performance Comparison
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="sent" name="Sent" fill="#7c3aed" radius={[2,2,0,0]} />
              <Bar dataKey="delivered" name="Delivered" fill="#06b6d4" radius={[2,2,0,0]} />
              <Bar dataKey="opened" name="Opened" fill="#10b981" radius={[2,2,0,0]} />
              <Bar dataKey="clicked" name="Clicked" fill="#f59e0b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign List + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Campaign List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white font-medium text-sm">
              Select Campaign
            </h2>
          </div>
          <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto">
            {campaigns.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <AlertCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No campaigns yet</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <button
                  key={campaign.campaign_id}
                  onClick={() => {
                    setSelected(campaign.campaign_id)
                    loadAnalytics(campaign.campaign_id)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors ${
                    selected === campaign.campaign_id
                      ? 'bg-violet-500/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-200 text-sm font-medium truncate max-w-36">
                      {campaign.name}
                    </p>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      campaign.status === 'completed'
                        ? 'bg-emerald-500'
                        : campaign.status === 'running'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-gray-600'
                    }`} />
                  </div>
                  <p className="text-gray-500 text-xs capitalize">
                    {campaign.channel} · {campaign.stats.sent} sent
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Funnel */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : analytics ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold">
                    {analytics.campaign.name}
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5 capitalize">
                    {analytics.campaign.channel} campaign
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  analytics.campaign.status === 'completed'
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : analytics.campaign.status === 'running'
                    ? 'bg-yellow-400/10 text-yellow-400'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {analytics.campaign.status}
                </span>
              </div>

              {/* Rate KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-violet-400">
                    {analytics.funnel.delivery_rate}%
                  </p>
                  <p className="text-gray-500 text-xs">Delivery Rate</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-cyan-400">
                    {analytics.funnel.open_rate}%
                  </p>
                  <p className="text-gray-500 text-xs">Open Rate</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">
                    {analytics.funnel.ctr}%
                  </p>
                  <p className="text-gray-500 text-xs">CTR</p>
                </div>
              </div>

              {/* Funnel Bars */}
              <div className="space-y-3">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3">
                  Delivery Funnel
                </h3>
                <FunnelBar
                  label="Sent"
                  value={analytics.funnel.sent}
                  max={analytics.funnel.total}
                  color="bg-violet-500"
                  percentage={100}
                />
                <FunnelBar
                  label="Delivered"
                  value={analytics.funnel.delivered}
                  max={analytics.funnel.total}
                  color="bg-cyan-500"
                  percentage={analytics.funnel.delivery_rate}
                />
                <FunnelBar
                  label="Opened"
                  value={analytics.funnel.opened}
                  max={analytics.funnel.total}
                  color="bg-emerald-500"
                  percentage={analytics.funnel.open_rate}
                />
                <FunnelBar
                  label="Clicked"
                  value={analytics.funnel.clicked}
                  max={analytics.funnel.total}
                  color="bg-yellow-500"
                  percentage={analytics.funnel.ctr}
                />
                <FunnelBar
                  label="Failed"
                  value={analytics.funnel.failed}
                  max={analytics.funnel.total}
                  color="bg-red-500"
                  percentage={analytics.funnel.failure_rate}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <AlertCircle className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">
                Select a campaign to view analytics
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}