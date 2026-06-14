import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Users, ShoppingCart, TrendingUp, Megaphone } from 'lucide-react'
import { api } from '../services/api'

const COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6']

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-gray-600 text-xs mt-0.5">{subtitle}</p>
    </div>
  )
}

export function DashboardPage() {
  const [overview, setOverview] = useState<any>(null)
  const [customerStats, setCustomerStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [o, c] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/customers/stats'),
        ])
        setOverview(o.data)
        setCustomerStats(c.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  const totalRevenue = overview?.total_revenue ?? 0
  const revenueInLakhs = (totalRevenue / 100000).toFixed(1)
  const revenueThisMonth = (overview?.revenue_this_month ?? 0).toLocaleString('en-IN')
  const totalOrders = overview?.revenue_trend?.reduce(
    (acc: number, d: any) => acc + d.orders, 0
  ) ?? 0
  const totalCustomers = (customerStats?.total_customers ?? 0).toLocaleString('en-IN')
  const newThisMonth = customerStats?.new_this_month ?? 0
  const totalCampaigns = (overview?.total_campaigns ?? 0).toString()
  const activeCampaigns = overview?.active_campaigns ?? 0

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Your brand marketing performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={totalCustomers}
          subtitle={`+${newThisMonth} this month`}
          icon={Users}
          color="bg-violet-600"
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders.toLocaleString('en-IN')}
          subtitle="All time orders"
          icon={ShoppingCart}
          color="bg-cyan-600"
        />
        <MetricCard
          title="Total Revenue"
          value={`Rs ${revenueInLakhs}L`}
          subtitle={`Rs ${revenueThisMonth} this month`}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
        <MetricCard
          title="Campaigns"
          value={totalCampaigns}
          subtitle={`${activeCampaigns} running`}
          icon={Megaphone}
          color="bg-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1">Revenue Trend</h2>
          <p className="text-gray-500 text-xs mb-5">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={overview?.revenue_trend ?? []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(v) => [
                  `Rs ${typeof v === 'number' ? v.toLocaleString('en-IN') : v}`,
                  'Revenue'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1">By Category</h2>
          <p className="text-gray-500 text-xs mb-4">Revenue breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={overview?.category_breakdown?.slice(0, 6) ?? []}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {(overview?.category_breakdown?.slice(0, 6) ?? []).map(
                  (_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i]} />
                  )
                )}
              </Pie>
              <Tooltip
                formatter={(v) => [
                  `Rs ${typeof v === 'number' ? v.toLocaleString('en-IN') : v}`,
                  'Revenue'
                ]}
                contentStyle={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {(overview?.category_breakdown?.slice(0, 4) ?? []).map(
              (cat: any, i: number) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: COLORS[i] }}
                    />
                    <span className="text-gray-400 text-xs truncate">
                      {cat.category}
                    </span>
                  </div>
                  <span className="text-gray-300 text-xs font-medium">
                    {(cat.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Customer Growth + Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Customer Growth */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1">Customer Growth</h2>
          <p className="text-gray-500 text-xs mb-5">New signups per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={customerStats?.growth_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
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
              <Bar dataKey="count" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1">Recent Campaigns</h2>
          <p className="text-gray-500 text-xs mb-5">Performance overview</p>
          <div className="space-y-3">
            {(overview?.campaign_performance?.slice(0, 5) ?? []).map(
              (camp: any, i: number) => {
                const rate =
                  camp.sent > 0
                    ? Math.round((camp.delivered / camp.sent) * 100)
                    : 0
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        camp.status === 'completed'
                          ? 'bg-emerald-500'
                          : camp.status === 'running'
                          ? 'bg-yellow-500 animate-pulse'
                          : 'bg-gray-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-xs font-medium truncate">
                        {camp.name}
                      </p>
                      <p className="text-gray-500 text-xs capitalize">
                        {camp.channel} · {camp.sent} sent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-semibold">{rate}%</p>
                      <p className="text-gray-500 text-xs">delivered</p>
                    </div>
                  </div>
                )
              }
            )}
            {!overview?.campaign_performance?.length && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No campaigns yet</p>
                <p className="text-gray-600 text-xs">
                  Launch one from AI Copilot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}