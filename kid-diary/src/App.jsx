import { useState } from 'react'
import { getNavigationItems } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { AppShell } from './views/AppShell.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([{ id: 'child-lucas', name: 'Lucas' }])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')

  if (stage === 'welcome') {
    return <WelcomeView model={presentWelcome()} onContinue={() => setStage('folders')} />
  }

  if (stage === 'folders') {
    return (
      <FolderPickerView
        model={presentFolderPicker({ children })}
        onSelectFolder={(id) => {
          setActiveChildId(id)
          setStage('app')
        }}
        onAddFolder={(name) =>
          setChildren((current) => [...current, { id: crypto.randomUUID(), name }])
        }
        onBack={() => setStage('welcome')}
      />
    )
  }

  const activeItem = navigationItems.find((item) => item.id === activeRoute)
  const page = activeRoute === 'home'
    ? <StartPageView model={presentStartPage({ child: children.find((c) => c.id === activeChildId) })} />
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
