import { BottomNavigation } from './BottomNavigation.jsx'

export function AppShell({ activeRoute, navigationItems, onNavigate, children }) {
  return (
    <div className="app-shell">
      <main className="app-content">{children}</main>

      <BottomNavigation
        activeRoute={activeRoute}
        items={navigationItems}
        onNavigate={onNavigate}
      />
    </div>
  )
}