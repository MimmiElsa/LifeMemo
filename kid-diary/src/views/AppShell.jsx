import { SideNavigation } from './SideNavigation.jsx'

export function AppShell({
  activeRoute,
  children,
  motion = 'tab',
  navigationItems,
  navigationModel,
  onNavigate,
  onNewMemory,
  onSwitchFolder,
  pageKey,
}) {
  return (
    <div className="app-shell">
      <SideNavigation
        activeRoute={activeRoute}
        items={navigationItems}
        model={navigationModel}
        onNavigate={onNavigate}
        onNewMemory={onNewMemory}
        onSwitchFolder={onSwitchFolder}
      />

      {/* a new key remounts the page, which replays its arrival animation */}
      <main className={`app-content app-content--${motion}`} key={pageKey}>{children}</main>
    </div>
  )
}
