import { SideNavigation } from './SideNavigation.jsx'

export function AppShell({
  activeRoute,
  children,
  navigationItems,
  navigationModel,
  onNavigate,
  onSwitchFolder,
  quick,
}) {
  return (
    <div className="app-shell">
      {/* dims the page behind the open Quick memory menu; a tap on it closes the menu */}
      {quick.open && <div className="quick-overlay" onClick={quick.onToggle} />}

      <SideNavigation
        activeRoute={activeRoute}
        items={navigationItems}
        model={navigationModel}
        onNavigate={onNavigate}
        onSwitchFolder={onSwitchFolder}
        quick={quick}
      />

      <main className="app-content">{children}</main>
    </div>
  )
}
