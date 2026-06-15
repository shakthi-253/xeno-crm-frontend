import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0608' }}>
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}