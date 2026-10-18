const navigationItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'diary', label: 'Diary', icon: 'book' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'milestones', label: 'Milestones', icon: 'star' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export function getNavigationItems() {
  return navigationItems.map((item) => ({ ...item }))
}