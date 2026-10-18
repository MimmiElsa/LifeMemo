import { useState } from 'react'
import { getNavigationItems } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { AppShell } from './views/AppShell.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { StartPageView } from './views/StartPageView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [activeRoute, setActiveRoute] = useState('home')

  const activeItem = navigationItems.find((item) => item.id === activeRoute)
  const page = activeRoute === 'home'
    ? <StartPageView model={presentStartPage()} />
    : <PlaceholderPageView title={activeItem?.label ?? 'Page'} />

  return (
    <AppShell
      activeRoute={activeRoute}
      navigationItems={navigationItems}
      onNavigate={setActiveRoute}
    >
      {page}
    </AppShell>
  )
}

export default App
