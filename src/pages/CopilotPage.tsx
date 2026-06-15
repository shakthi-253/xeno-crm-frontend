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
    <div className="rounded-xl p-4" style={{ border: '1px solid #2a1520', background: '#1a0810' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium" style={{ color: '#f5d0de' }}>{name}</span>
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
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a3550' }}>
              Strategy
            </p>
            <p className="text-sm" style={{ color: '#f5d0de' }}>{agents.strategist.strategy}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#c8899e' }}>
            {agents.strategist.reasoning}
          </p>
        </div>
      </AgentCard>

      {/* Audience */}
      <AgentCard icon="👥" name="Audience Agent">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a3550' }}>
                Target Segment
              </p>
              <p className="text-sm font-medium" style={{ color: '#f5d0de' }}>
                {agents.audience.segment_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: '#c0185a' }}>
                {agents.audience.estimated_reach.toLocaleString('en-IN')}
              </p>
              <p className="text-xs" style={{ color: '#7a3550' }}>customers</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agents.audience.characteristics.map((c, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#2a1520', color: '#c8899e' }}
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#7a3550' }}>{agents.audience.reasoning}</p>
        </div>
      </AgentCard>

      {/* Copywriter */}
      <AgentCard icon="✍️" name="Copywriter Agent">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a3550' }}>
              Message
            </p>
            <div className="rounded-lg p-3" style={{ background: '#0a0608', border: '1px solid #2a1520' }}>
              <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: '#f5d0de' }}>
                {agents.copywriter.message}
              </pre>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#7a3550' }}>{agents.copywriter.reasoning}</p>
        </div>
      </AgentCard>

      {/* Channel */}
      <AgentCard icon="📡" name="Channel Agent">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ChannelBadge channel={agents.channel.recommended_channel} />
            <span className="text-xs" style={{ color: '#c8899e' }}>
              ~{agents.channel.open_rate_estimate}% avg open rate
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#c8899e' }}>
            {agents.channel.reasoning}
          </p>
        </div>
      </AgentCard>

      {/* Insights */}
      <AgentCard icon="📊" name="Insights Agent">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: '#0a0608', border: '1px solid #2a1520' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3" style={{ color: '#c0185a' }} />
                <p className="text-xs" style={{ color: '#7a3550' }}>Est. Conversion</p>
              </div>
              <p className="text-xl font-bold" style={{ color: '#c0185a' }}>
                {agents.insights.expected_conversion_rate}%
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: '#0a0608', border: '1px solid #2a1520' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <p className="text-xs" style={{ color: '#7a3550' }}>Est. Revenue</p>
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
              <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: '#7a3550' }}>
                Risk Factors
              </p>
              <ul className="space-y-1">
                {agents.insights.risk_factors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: '#c8899e' }}>
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
      <div className="rounded-xl p-5" style={{ border: '1px solid #c0185a50', background: '#c0185a08' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a3550' }}>
              Ready to Launch
            </p>
            <h3 className="font-semibold" style={{ color: '#f5d0de' }}>{campaign.name}</h3>
          </div>
          <ChannelBadge channel={campaign.channel} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#7a3550' }}>Reach</p>
            <p className="font-semibold text-sm" style={{ color: '#f5d0de' }}>
              {campaign.predicted_reach.toLocaleString('en-IN')} people
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#7a3550' }}>Conversion</p>
            <p className="font-semibold text-sm" style={{ color: '#f5d0de' }}>
              {campaign.predicted_conversion}%
            </p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#7a3550' }}>Est. Revenue</p>
            <p className="font-semibold text-sm" style={{ color: '#f5d0de' }}>
              Rs {(agents.insights.expected_revenue / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <button
          onClick={onLaunch}
          disabled={launching}
          className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-colors"
          style={{ background: launching ? '#7a0d30' : '#c0185a' }}
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

        <p className="text-xs text-center mt-2" style={{ color: '#5a2535' }}>
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
    <div className="h-screen flex flex-col" style={{ background: '#0a0608' }}>

      {/* Header */}
      <div className="px-8 py-5 flex-shrink-0" style={{ borderBottom: '1px solid #2a1520' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#c0185a' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold flex items-center gap-2" style={{ color: '#f5d0de' }}>
              AI Campaign Copilot
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#d4a01720', color: '#d4a017', border: '1px solid #d4a01730' }}>
                BETA
              </span>
            </h1>
            <p className="text-xs" style={{ color: '#7a3550' }}>
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#c0185a10', border: '1px solid #c0185a30' }}>
              <Sparkles className="w-8 h-8" style={{ color: '#c0185a' }} />
            </div>

            <h2 className="text-xl font-semibold mb-2 text-center" style={{ color: '#f5d0de' }}>
              What's your marketing goal today?
            </h2>
            <p className="text-sm text-center max-w-md mb-10" style={{ color: '#7a3550' }}>
              Tell me what you want to achieve. I'll find your audience,
              craft the message, pick the best channel, and predict
              performance — then you launch with one click.
            </p>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl w-full">
              {[
                { icon: Users, label: 'Finds Audience', color: '#c0185a' },
                { icon: MessageSquare, label: 'Writes Message', color: '#d4a017' },
                { icon: TrendingUp, label: 'Predicts Results', color: '#7a3db0' },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl p-4"
                  style={{ background: '#0f0810', border: '1px solid #2a1520' }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                  <span className="text-xs text-center" style={{ color: '#c8899e' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-xl">
              <p className="text-xs uppercase tracking-wide mb-3 text-center" style={{ color: '#5a2535' }}>
                Try one of these
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setGoal(suggestion)}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all group"
                    style={{ background: '#0f0810', border: '1px solid #2a1520' }}
                  >
                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-colors" style={{ color: '#5a2535' }} />
                    <span className="text-sm transition-colors" style={{ color: '#c8899e' }}>
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#2a1520' }}>
                <span className="text-xs font-bold" style={{ color: '#c8899e' }}>M</span>
              </div>
              <div className="rounded-xl rounded-tl-none px-4 py-3 flex-1" style={{ background: '#1a0810' }}>
                <p className="text-sm" style={{ color: '#f5d0de' }}>
                  {currentCopilotResponse.goal}
                </p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#c0185a' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium mb-3" style={{ color: '#c0185a' }}>
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
      <div className="px-8 py-5 flex-shrink-0" style={{ borderTop: '1px solid #2a1520' }}>
        {currentCopilotResponse && (
          <button
            onClick={clearCopilotResponse}
            className="flex items-center gap-1.5 text-xs mb-3 transition-colors"
            style={{ color: '#7a3550' }}
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
              className="w-full text-sm resize-none outline-none transition-colors rounded-xl px-4 py-3"
              style={{
                background: '#0f0810',
                border: '1px solid #2a1520',
                color: '#f5d0de',
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!goal.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 text-white rounded-xl flex items-center justify-center transition-colors"
            style={{ background: !goal.trim() || isLoading ? '#2a1520' : '#c0185a' }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-center mt-2" style={{ color: '#3a1525' }}>
          Press Enter to submit · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}