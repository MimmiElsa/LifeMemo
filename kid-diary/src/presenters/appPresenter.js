const navigationItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'scrapbook', label: 'Scrapbook', icon: 'book' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'milestones', label: 'Milestones', icon: 'star' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export function getNavigationItems() {
  return navigationItems.map((item) => ({ ...item }))
}

export function presentSideNavigation({ child = null } = {}) {
  return {
    appName: 'LifeMemo',
    newMemoryLabel: 'New Memory',
    childName: child?.name ?? 'No folder',
    childInitial: (child?.name ?? '?').charAt(0).toUpperCase(),
    switchFolderLabel: 'Switch Folder',
  }
}
