import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <main className="min-w-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-10">
        <div key={pathname} className="mx-auto w-full max-w-3xl animate-fade-up lg:max-w-5xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
