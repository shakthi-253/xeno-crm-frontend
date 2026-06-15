import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Users, ShoppingCart, TrendingUp, Megaphone } from 'lucide-react'
import { api } from '../services/api'

const COLORS = ['#c0185a','#d4a017','#7a3db0','#e05c80','#f0c040','#a060d0']

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
    <div style={{ background: '#0f0810', border: '1px solid #2a1520' }} className="rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: '#f5d0de' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: '#c8899e' }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: '#5a2535' }}>{subtitle}</p>
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
              className="rounded-xl h-32 animate-pulse"
              style={{ background: '#0f0810', border: '1px solid #2a1520' }}
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
        <h1 className="text-2xl font-bold" style={{ color: '#f5d0de' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#7a3550' }}>
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
          color="bg-rose-700"
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders.toLocaleString('en-IN')}
          subtitle="All time orders"
          icon={ShoppingCart}
          color="bg-yellow-600"
        />
        <MetricCard
          title="Total Revenue"
          value={`Rs ${revenueInLakhs}L`}
          subtitle={`Rs ${revenueThisMonth} this month`}
          icon={TrendingUp}
          color="bg-purple-700"
        />
        <MetricCard
          title="Campaigns"
          value={totalCampaigns}
          subtitle={`${activeCampaigns} running`}
          icon={Megaphone}
          color="bg-rose-800"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
          <h2 className="font-semibold mb-1" style={{ color: '#f5d0de' }}>Revenue Trend</h2>
          <p className="text-xs mb-5" style={{ color: '#7a3550' }}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={overview?.revenue_trend ?? []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c0185a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c0185a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1520" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#7a3550', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#7a3550', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a0810',
                  border: '1px solid #2a1520',
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
                stroke="#c0185a"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl p-6" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
          <h2 className="font-semibold mb-1" style={{ color: '#f5d0de' }}>By Category</h2>
          <p className="text-xs mb-4" style={{ color: '#7a3550' }}>Revenue breakdown</p>
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
                  background: '#1a0810',
                  border: '1px solid #2a1520',
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
                    <span className="text-xs truncate" style={{ color: '#c8899e' }}>
                      {cat.category}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#f5d0de' }}>
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
        <div className="rounded-xl p-6" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
          <h2 className="font-semibold mb-1" style={{ color: '#f5d0de' }}>Customer Growth</h2>
          <p className="text-xs mb-5" style={{ color: '#7a3550' }}>New signups per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={customerStats?.growth_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1520" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#7a3550', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#7a3550', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a0810',
                  border: '1px solid #2a1520',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#d4a017" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Campaigns */}
        <div className="rounded-xl p-6" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
          <h2 className="font-semibold mb-1" style={{ color: '#f5d0de' }}>Recent Campaigns</h2>
          <p className="text-xs mb-5" style={{ color: '#7a3550' }}>Performance overview</p>
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
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: '#1a0810' }}
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
                      <p className="text-xs font-medium truncate" style={{ color: '#f5d0de' }}>
                        {camp.name}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#7a3550' }}>
                        {camp.channel} · {camp.sent} sent
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: '#f5d0de' }}>{rate}%</p>
                      <p className="text-xs" style={{ color: '#7a3550' }}>delivered</p>
                    </div>
                  </div>
                )
              }
            )}
            {!overview?.campaign_performance?.length && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#7a3550' }}>No campaigns yet</p>
                <p className="text-xs" style={{ color: '#5a2535' }}>
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