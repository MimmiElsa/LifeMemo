import { useState } from 'react'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentScrapbook } from './presenters/scrapbookPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { createScrapbook } from './backend/models.js'
import { ScrapbookView } from './views/ScrapbookView.jsx'
import { AppShell } from './views/AppShell.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([{ id: 'child-lucas', name: 'Lucas', scrapbook: createScrapbook() }])
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
          setChildren((current) => [...current, { id: crypto.randomUUID(), name, scrapbook: createScrapbook() }])
        }
        onBack={() => setStage('welcome')}
      />
    )
  }

  const activeChild = children.find((c) => c.id === activeChildId)
  const activeItem = navigationItems.find((item) => item.id === activeRoute)
  const pageTitle = activeRoute === 'newMemory' ? 'New Memory' : activeItem?.label ?? 'Page'
  let page = <PlaceholderPageView title={pageTitle} />
  if (activeRoute === 'home') {
    page = <StartPageView model={presentStartPage({ child: activeChild })} />
  } else if (activeRoute === 'scrapbook') {
    page = <ScrapbookView model={presentScrapbook({ child: activeChild })} />
  }

  return (
    <AppShell
      activeRoute={activeRoute}
      navigationItems={navigationItems}
      navigationModel={presentSideNavigation({ child: activeChild })}
      onNavigate={setActiveRoute}
      onNewMemory={() => setActiveRoute('newMemory')}
      onSwitchFolder={() => setStage('folders')}
    >
      {page}
    </AppShell>
  )
}

export default App
