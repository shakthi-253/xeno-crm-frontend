import { api } from './api'
import type { CopilotResponse, FilterRules } from '../types'

export const campaignService = {

  getCampaigns: async () => {
    const { data } = await api.get('/campaigns')
    return data
  },

  createCampaign: async (payload: {
    name: string
    segment_id: string
    channel: string
    message_template: string
    ai_generated?: boolean
    ai_reasoning?: Record<string, unknown>
    predicted_reach?: number
    predicted_conversion?: number
  }) => {
    const { data } = await api.post('/campaigns', payload)
    return data
  },

  launchCampaign: async (campaignId: string) => {
    const { data } = await api.post(`/campaigns/${campaignId}/launch`)
    return data
  },

  aiCopilot: async (goal: string): Promise<CopilotResponse> => {
    const { data } = await api.post('/ai/copilot', { goal })
    return data
  },

  aiSegment: async (query: string) => {
    const { data } = await api.post('/ai/segment', { query })
    return data
  },

  createSegment: async (payload: {
    name: string
    filter_type: string
    filter_rules: FilterRules
    ai_query?: string
    description?: string
  }) => {
    const { data } = await api.post('/segments', payload)
    return data
  },

  previewSegment: async (filterRules: FilterRules) => {
    const { data } = await api.post('/segments/preview', {
      filter_rules: filterRules,
    })
    return data
  },
}