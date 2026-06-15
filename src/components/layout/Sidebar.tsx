import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react'

const navItems = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Overview & metrics',
    isAI: false,
  },
  {
    path: '/copilot',
    icon: Bot,
    label: 'AI Copilot',
    description: 'Campaign intelligence',
    isAI: true,
  },
  {
    path: '/audience',
    icon: Users,
    label: 'Audience',
    description: 'Segments & customers',
    isAI: false,
  },
  {
    path: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Campaign performance',
    isAI: false,
  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r z-40 flex flex-col"
      style={{ background: '#0f0810', borderColor: '#2a1520' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#2a1520' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#c0185a' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f5d0de' }}>Xeno CRM</p>
            <p className="text-xs" style={{ color: '#7a3550' }}>AI-Native</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
              style={{
                background: isActive ? '#c0185a18' : 'transparent',
                borderLeft: isActive ? '2px solid #c0185a' : '2px solid transparent',
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? '#f0507a' : '#7a3550' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium"
                    style={{ color: isActive ? '#f5d0de' : '#c8899e' }}>
                    {item.label}
                  </span>
                  {item.isAI && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: '#d4a01720',
                        color: '#d4a017',
                        border: '1px solid #d4a01730'
                      }}>
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: '#5a2535' }}>
                  {item.description}
                </p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: '#2a1520' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#c0185a' }}>
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#f5d0de' }}>
              Marketing Team
            </p>
            <p className="text-xs" style={{ color: '#7a3550' }}>D2C Brand</p>
          </div>
        </div>
      </div>

    </aside>
  )
}