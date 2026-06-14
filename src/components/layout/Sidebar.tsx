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
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 border-r border-gray-800 z-40 flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Xeno CRM</p>
            <p className="text-gray-500 text-xs">AI-Native</p>
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
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }
              `}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-violet-400' : 'text-gray-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                  {item.isAI && (
                    <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {item.description}
                </p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <p className="text-gray-300 text-xs font-medium">
              Marketing Team
            </p>
            <p className="text-gray-600 text-xs">D2C Brand</p>
          </div>
        </div>
      </div>

    </aside>
  )
}