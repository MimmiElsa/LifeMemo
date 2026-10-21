import { useState } from 'react'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentMilestones } from './presenters/milestonesPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { createSampleMilestones, LUCAS_BIRTHDAY } from './backend/sampleMilestones.js'
import { AppShell } from './views/AppShell.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { MilestonesView } from './views/MilestonesView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([
    {
      id: 'child-lucas',
      name: 'Lucas',
      birthday: LUCAS_BIRTHDAY,
      milestones: createSampleMilestones('child-lucas').milestones,
    },
  ])
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
          setChildren((current) => [...current, { id: crypto.randomUUID(), name, birthday: null, milestones: [] }])
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
  } else if (activeRoute === 'milestones') {
    page = <MilestonesView model={presentMilestones({ child: activeChild })} />
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
