import { useState, useEffect } from 'react'
import {
  Search, Filter, Users, TrendingDown,
  Star, AlertTriangle, ShoppingBag,
  Loader2, X, ChevronDown, Zap
} from 'lucide-react'
import { campaignService } from '../services/campaignService'
import { toast } from 'sonner'

const SEGMENT_PRESETS = [
  {
    id: 'inactive',
    label: 'Inactive Customers',
    icon: TrendingDown,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'No purchase in 45+ days',
    filter_rules: { inactive_days: 45 }
  },
  {
    id: 'high_value',
    label: 'High Value VIPs',
    icon: Star,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    description: 'Top 20% by lifetime spend',
    filter_rules: { high_value: true }
  },
  {
    id: 'churn_risk',
    label: 'Churn Risk',
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
    description: 'Silent for 30-60 days',
    filter_rules: { churn_risk: true }
  },
  {
    id: 'recent',
    label: 'Recent Buyers',
    icon: ShoppingBag,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Purchased in last 30 days',
    filter_rules: { active_days: 30 }
  },
]

const CITIES = [
  '', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai',
  'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'
]

const CATEGORIES = [
  '', 'Sneakers', 'Casual Wear', 'Formal Wear',
  'Accessories', 'Sports Wear', 'Ethnic Wear',
  'Kids Wear', 'Footwear', 'Bags & Wallets', 'Watches'
]

export function AudiencePage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [presetCounts, setPresetCounts] = useState<Record<string, number>>({})
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [minSpend, setMinSpend] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {}
      for (const preset of SEGMENT_PRESETS) {
        try {
          const result = await campaignService.previewSegment(preset.filter_rules)
          counts[preset.id] = result.customer_count
        } catch {
          counts[preset.id] = 0
        }
      }
      setPresetCounts(counts)
    }
    loadCounts()
    loadCustomers({})
  }, [])

  const loadCustomers = async (filterRules: Record<string, any>) => {
    setLoading(true)
    try {
      const result = await campaignService.previewSegment(filterRules)
      setCustomers(result.customers || [])
      setTotalCount(result.customer_count)
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handlePresetClick = (preset: typeof SEGMENT_PRESETS[0]) => {
    if (activePreset === preset.id) {
      setActivePreset(null)
      loadCustomers({})
    } else {
      setActivePreset(preset.id)
      loadCustomers(preset.filter_rules)
    }
    setAiQuery('')
  }

  const applyManualFilters = () => {
    const rules: Record<string, any> = {}
    if (minSpend) rules.min_spend = parseFloat(minSpend)
    if (selectedCity) rules.city = selectedCity
    if (selectedCategory) rules.category = selectedCategory
    setActivePreset(null)
    loadCustomers(rules)
  }

  const clearFilters = () => {
    setMinSpend('')
    setSelectedCity('')
    setSelectedCategory('')
    setActivePreset(null)
    loadCustomers({})
  }

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    try {
      const result = await campaignService.aiSegment(aiQuery.trim())
      setCustomers(result.customers || [])
      setTotalCount(result.customer_count)
      setActivePreset(null)
      toast.success(`Found ${result.customer_count} customers`)
    } catch {
      toast.error('AI query failed. Try manual filters.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5d0de' }}>
            Audience Explorer
          </h1>
          <p className="text-sm mt-1" style={{ color: '#7a3550' }}>
            Segment your customers intelligently
          </p>
        </div>
        <div className="flex items-center gap-2" style={{ color: '#c8899e' }}>
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {totalCount.toLocaleString('en-IN')} customers
          </span>
        </div>
      </div>

      {/* AI Query */}
      <div className="rounded-xl p-4" style={{ background: '#0f0810', border: '1px solid #c0185a30' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" style={{ color: '#c0185a' }} />
          <span className="text-sm font-medium" style={{ color: '#c0185a' }}>
            AI Segment Builder
          </span>
        </div>
        <div className="flex gap-3">
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
            placeholder='Try: "sneaker buyers from Chennai" or "inactive customers"'
            className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: '#1a0810',
              border: '1px solid #2a1520',
              color: '#f5d0de',
            }}
          />
          <button
            onClick={handleAiQuery}
            disabled={!aiQuery.trim() || aiLoading}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: '#c0185a' }}
          >
            {aiLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            Search
          </button>
        </div>
      </div>

      {/* Preset Segments */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SEGMENT_PRESETS.map((preset) => {
          const Icon = preset.icon
          const isActive = activePreset === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                isActive
                  ? `border-current/30 ${preset.color}`
                  : 'hover:border-gray-700'
              }`}
              style={!isActive ? { background: '#0f0810', borderColor: '#2a1520' } : {}}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? '' : 'text-gray-500'}`} />
              <p className={`font-medium text-sm ${isActive ? '' : ''}`}
                style={!isActive ? { color: '#c8899e' } : {}}>
                {preset.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#5a2535' }}>
                {preset.description}
              </p>
              {presetCounts[preset.id] !== undefined && (
                <p className={`text-xs font-semibold mt-2 ${isActive ? '' : ''}`}
                  style={!isActive ? { color: '#7a3550' } : {}}>
                  {presetCounts[preset.id].toLocaleString('en-IN')} customers
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* Manual Filters */}
      <div className="rounded-xl" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#c8899e' }} />
            <span className="text-sm font-medium" style={{ color: '#c8899e' }}>
              Manual Filters
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            style={{ color: '#7a3550' }} />
        </button>

        {showFilters && (
          <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid #2a1520' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide block mb-2" style={{ color: '#7a3550' }}>
                  Min. Total Spend (Rs)
                </label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: '#1a0810', border: '1px solid #2a1520', color: '#f5d0de' }}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide block mb-2" style={{ color: '#7a3550' }}>
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: '#1a0810', border: '1px solid #2a1520', color: '#f5d0de' }}
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c || 'All Cities'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide block mb-2" style={{ color: '#7a3550' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: '#1a0810', border: '1px solid #2a1520', color: '#f5d0de' }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c || 'All Categories'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={applyManualFilters}
                className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ background: '#c0185a' }}
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: '#7a3550' }}
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0f0810', border: '1px solid #2a1520' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a1520' }}>
          <h2 className="text-sm font-medium" style={{ color: '#f5d0de' }}>
            {totalCount.toLocaleString('en-IN')} Customers
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#c0185a' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a1520' }}>
                  {['Name', 'City', 'Total Spent', 'Orders', 'Last Purchase', 'Status'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs uppercase tracking-wide font-medium"
                      style={{ color: '#7a3550' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 50).map((customer) => {
                  const days = customer.last_purchase_date
                    ? Math.floor(
                        (Date.now() - new Date(customer.last_purchase_date).getTime())
                        / 86400000
                      )
                    : null

                  const status =
                    days === null
                      ? { label: 'Never', color: 'bg-gray-800 text-gray-500' }
                      : days <= 30
                      ? { label: 'Active', color: 'bg-emerald-400/10 text-emerald-400' }
                      : days <= 60
                      ? { label: 'At Risk', color: 'bg-yellow-400/10 text-yellow-400' }
                      : { label: 'Inactive', color: 'bg-red-400/10 text-red-400' }

                  return (
                    <tr
                      key={customer.customer_id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid #1a0810' }}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium" style={{ color: '#f5d0de' }}>
                          {customer.name}
                        </p>
                        <p className="text-xs" style={{ color: '#7a3550' }}>
                          {customer.email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#c8899e' }}>
                        {customer.city}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-sm" style={{ color: '#f5d0de' }}>
                          Rs {customer.total_spent.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#c8899e' }}>
                        {customer.total_orders}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#c8899e' }}>
                        {days !== null ? `${days}d ago` : 'Never'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}