import { SideNavigation } from './SideNavigation.jsx'

export function AppShell({
  activeRoute,
  children,
  motion = 'tab',
  navigationItems,
  navigationModel,
  onNavigate,
  onSwitchFolder,
  pageKey,
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

      {/* a new key remounts the page, which replays its arrival animation */}
      <main className={`app-content app-content--${motion}`} key={pageKey}>{children}</main>
    </div>
  )
}
