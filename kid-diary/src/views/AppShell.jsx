import { SideNavigation } from './SideNavigation.jsx'

export function AppShell({
  activeRoute,
  children,
  navigationItems,
  navigationModel,
  onNavigate,
  onNewMemory,
  onSwitchFolder,
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

      <main className="app-content">{children}</main>
    </div>
  )
}
