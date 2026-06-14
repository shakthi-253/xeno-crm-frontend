import { useState } from 'react'
import {
  Bot, Send, Sparkles, Users, MessageSquare,
  Radio, TrendingUp, CheckCircle2, Loader2,
  RotateCcw, Rocket, AlertCircle, ChevronRight
} from 'lucide-react'
import { campaignService } from '../services/campaignService'
import { useAppStore } from '../store/appStore'
import { toast } from 'sonner'
import type { CopilotResponse } from '../types'

const SUGGESTIONS = [
  "Bring back customers who haven't purchased in 45 days",
  "Increase repeat purchases this month",
  "Re-engage high-value customers who are at churn risk",
  "Drive sales from Chennai customers who buy sneakers",
  "Convert first-time buyers into loyal customers",
  "Recover customers lost in the last 90 days",
]

function ChannelBadge({ channel }: { channel: string }) {
  const config: Record<string, { label: string; color: string }> = {
    whatsapp: {
      label: 'WhatsApp',
      color: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
    },
    sms: {
      label: 'SMS',
      color: 'text-blue-400 bg-blue-400/10 border border-blue-400/20'
    },
    email: {
      label: 'Email',
      color: 'text-orange-400 bg-orange-400/10 border border-orange-400/20'
    },
  }
  const { label, color } = config[channel] ?? config.whatsapp
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>
      <Radio className="w-3 h-3" />
      {label}
    </span>
  )
}

function AgentCard({
  icon,
  name,
  children
}: {
  icon: string
  name: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-700 bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-gray-200 font-medium text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 text-xs">Done</span>
        </div>
      </div>
      {children}
    </div>
  )
}

function CampaignResult({
  response,
  onLaunch,
  launching
}: {
  response: CopilotResponse
  onLaunch: () => void
  launching: boolean
}) {
  const { agents, campaign } = response

  return (
    <div className="space-y-4">

      {/* Strategist */}
      <AgentCard icon="🎯" name="Campaign Strategist">
        <div className="space-y-2">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Strategy
            </p>
            <p className="text-gray-200 text-sm">{agents.strategist.strategy}</p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {agents.strategist.reasoning}
          </p>
        </div>
      </AgentCard>

      {/* Audience */}
      <AgentCard icon="👥" name="Audience Agent">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                Target Segment
              </p>
              <p className="text-gray-200 text-sm font-medium">
                {agents.audience.segment_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-400">
                {agents.audience.estimated_reach.toLocaleString('en-IN')}
              </p>
              <p className="text-gray-500 text-xs">customers</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agents.audience.characteristics.map((c, i) => (
              <span
                key={i}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-xs">{agents.audience.reasoning}</p>
        </div>
      </AgentCard>

      {/* Copywriter */}
      <AgentCard icon="✍️" name="Copywriter Agent">
        <div className="space-y-3">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
              Message
            </p>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                {agents.copywriter.message}
              </pre>
            </div>
          </div>
          <p className="text-gray-500 text-xs">{agents.copywriter.reasoning}</p>
        </div>
      </AgentCard>

      {/* Channel */}
      <AgentCard icon="📡" name="Channel Agent">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ChannelBadge channel={agents.channel.recommended_channel} />
            <span className="text-gray-400 text-xs">
              ~{agents.channel.open_rate_estimate}% avg open rate
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {agents.channel.reasoning}
          </p>
        </div>
      </AgentCard>

      {/* Insights */}
      <AgentCard icon="📊" name="Insights Agent">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-violet-400" />
                <p className="text-gray-500 text-xs">Est. Conversion</p>
              </div>
              <p className="text-xl font-bold text-violet-400">
                {agents.insights.expected_conversion_rate}%
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <p className="text-gray-500 text-xs">Est. Revenue</p>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                Rs {(agents.insights.expected_revenue / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              agents.insights.confidence === 'high'
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-yellow-400/10 text-yellow-400'
            }`}>
              {agents.insights.confidence.toUpperCase()} CONFIDENCE
            </span>
          </div>
          {agents.insights.risk_factors.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1.5">
                Risk Factors
              </p>
              <ul className="space-y-1">
                {agents.insights.risk_factors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                    <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AgentCard>

      {/* Launch Card */}
      <div className="border border-violet-500/30 bg-violet-500/5 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Ready to Launch
            </p>
            <h3 className="text-white font-semibold">{campaign.name}</h3>
          </div>
          <ChannelBadge channel={campaign.channel} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Reach</p>
            <p className="text-white font-semibold text-sm">
              {campaign.predicted_reach.toLocaleString('en-IN')} people
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Conversion</p>
            <p className="text-white font-semibold text-sm">
              {campaign.predicted_conversion}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Est. Revenue</p>
            <p className="text-white font-semibold text-sm">
              Rs {(agents.insights.expected_revenue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <button
          onClick={onLaunch}
          disabled={launching}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {launching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Launching Campaign...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Launch Campaign
            </>
          )}
        </button>

        <p className="text-gray-600 text-xs text-center mt-2">
          AI-generated · {response.powered_by === 'gemini' ? 'Powered by Gemini' : 'Smart simulation'}
        </p>
      </div>

    </div>
  )
}

export function CopilotPage() {
  const [goal, setGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [launching, setLaunching] = useState(false)

  const {
    currentCopilotResponse,
    setCopilotResponse,
    setCopilotLoading,
    clearCopilotResponse
  } = useAppStore()

  const handleSubmit = async () => {
    if (!goal.trim() || isLoading) return

    setIsLoading(true)
    setCopilotLoading(true)

    try {
      const response = await campaignService.aiCopilot(goal.trim())
      setCopilotResponse(response)
    } catch (error) {
      toast.error('Failed to process goal. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
      setCopilotLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleLaunch = async () => {
    if (!currentCopilotResponse) return
    setLaunching(true)

    try {
      const { campaign } = currentCopilotResponse

      const segmentResult = await campaignService.createSegment({
        name: currentCopilotResponse.agents.audience.segment_name,
        filter_type: 'ai',
        filter_rules: campaign.filter_rules,
        ai_query: campaign.goal,
        description: `AI-generated for: ${campaign.goal}`
      })

      const campaignResult = await campaignService.createCampaign({
        name: campaign.name,
        segment_id: segmentResult.segment_id,
        channel: campaign.channel,
        message_template: campaign.message_template,
        ai_generated: true,
        ai_reasoning: campaign.ai_reasoning,
        predicted_reach: campaign.predicted_reach,
        predicted_conversion: campaign.predicted_conversion
      })

      await campaignService.launchCampaign(campaignResult.campaign_id)

      toast.success('Campaign launched! Check Analytics for live updates.')
      clearCopilotResponse()
      setGoal('')

    } catch (error) {
      toast.error('Failed to launch campaign. Please try again.')
      console.error(error)
    } finally {
      setLaunching(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">

      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold flex items-center gap-2">
              AI Campaign Copilot
              <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
                BETA
              </span>
            </h1>
            <p className="text-gray-500 text-xs">
              Describe your goal in plain English — AI does the rest
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!currentCopilotResponse ? (

          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-full px-8 py-16">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2 text-center">
              What's your marketing goal today?
            </h2>
            <p className="text-gray-500 text-sm text-center max-w-md mb-10">
              Tell me what you want to achieve. I'll find your audience,
              craft the message, pick the best channel, and predict
              performance — then you launch with one click.
            </p>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl w-full">
              {[
                { icon: Users, label: 'Finds Audience', color: 'text-violet-400' },
                { icon: MessageSquare, label: 'Writes Message', color: 'text-cyan-400' },
                { icon: TrendingUp, label: 'Predicts Results', color: 'text-emerald-400' },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-4"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-gray-400 text-xs text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-xl">
              <p className="text-gray-600 text-xs uppercase tracking-wide mb-3 text-center">
                Try one of these
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setGoal(suggestion)}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-400 group-hover:text-gray-200 text-sm transition-colors">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        ) : (

          /* Agent Outputs */
          <div className="max-w-2xl mx-auto px-8 py-6">

            {/* User Goal */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-300 text-xs font-bold">M</span>
              </div>
              <div className="bg-gray-800 rounded-xl rounded-tl-none px-4 py-3 flex-1">
                <p className="text-gray-200 text-sm">
                  {currentCopilotResponse.goal}
                </p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-violet-400 text-sm font-medium mb-3">
                  Xeno AI · Campaign Copilot
                </p>
                <CampaignResult
                  response={currentCopilotResponse}
                  onLaunch={handleLaunch}
                  launching={launching}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 px-8 py-5 flex-shrink-0">
        {currentCopilotResponse && (
          <button
            onClick={clearCopilotResponse}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-3 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Start a new campaign
          </button>
        )}

        <div className="flex gap-3 items-end max-w-2xl mx-auto">
          <div className="flex-1">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Bring back customers who haven't purchased in 45 days..."
              rows={2}
              disabled={isLoading}
              className="w-full bg-gray-900 border border-gray-700 focus:border-violet-500 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!goal.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-gray-700 text-xs text-center mt-2">
          Press Enter to submit · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}