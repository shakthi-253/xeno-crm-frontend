export interface Customer {
  customer_id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  city: string
  signup_date: string
  total_orders: number
  total_spent: number
  last_purchase_date: string | null
}

export interface FilterRules {
  inactive_days?: number
  active_days?: number
  min_spend?: number
  max_spend?: number
  city?: string
  category?: string
  min_orders?: number
  high_value?: boolean
  churn_risk?: boolean
  gender?: string
}

export interface Segment {
  segment_id: string
  name: string
  description: string
  filter_type: string
  filter_rules: FilterRules
  customer_count: number
  ai_query?: string
  created_at: string
}

export type Channel = 'whatsapp' | 'sms' | 'email'
export type CampaignStatus = 'draft' | 'running' | 'completed' | 'failed'

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  delivery_rate: number
  open_rate: number
  ctr: number
}

export interface Campaign {
  campaign_id: string
  name: string
  segment_name?: string
  channel: Channel
  status: CampaignStatus
  ai_generated: boolean
  predicted_reach?: number
  predicted_conversion?: number
  created_at: string
  launched_at?: string
  stats: CampaignStats
}

export interface CopilotAgents {
  strategist: {
    strategy: string
    campaign_type: string
    reasoning: string
    status: string
  }
  audience: {
    segment_name: string
    estimated_reach: number
    filter_rules: FilterRules
    reasoning: string
    characteristics: string[]
    status: string
  }
  copywriter: {
    subject_line: string
    message: string
    cta: string
    reasoning: string
    status: string
  }
  channel: {
    recommended_channel: Channel
    reasoning: string
    open_rate_estimate: number
    status: string
  }
  insights: {
    expected_conversion_rate: number
    expected_revenue: number
    confidence: string
    risk_factors: string[]
    status: string
  }
}

export interface CopilotResponse {
  goal: string
  powered_by: string
  agents: CopilotAgents
  campaign: {
    name: string
    goal: string
    channel: Channel
    message_template: string
    filter_rules: FilterRules
    predicted_reach: number
    predicted_conversion: number
    ai_reasoning: Record<string, unknown>
  }
}

export interface AnalyticsOverview {
  total_revenue: number
  revenue_this_month: number
  total_campaigns: number
  active_campaigns: number
  revenue_trend: Array<{
    month: string
    revenue: number
    orders: number
  }>
  category_breakdown: Array<{
    category: string
    revenue: number
    orders: number
  }>
  campaign_performance: Array<{
    name: string
    channel: string
    status: string
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }>
}