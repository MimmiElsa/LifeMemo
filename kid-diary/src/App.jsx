import { useEffect, useRef, useState } from 'react'
import {
  addScrap,
  attachMediaToScrap,
  deletePhoto,
  deleteVideo,
  recordPhoto,
  recordVideo,
  savePhoto,
  saveVideo,
} from './backend/index.js'
import { LUCAS_DEMO, seedDemoData } from './backend/demoData.js'
import { toDayKey } from './backend/utils/dates.js'
import { useCalendar } from './hooks/useCalendar.js'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentCalendar } from './presenters/calendarPresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentMilestones } from './presenters/milestonesPresenter.js'
import { presentNewMemory } from './presenters/newMemoryPresenter.js'
import { presentMemories } from './presenters/memoriesPresenter.js'
import { presentScrapbook } from './presenters/scrapbookPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { createScrapbook } from './backend/models.js'
import { AppShell } from './views/AppShell.jsx'
import { CalendarView } from './views/CalendarView.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { MemoriesView } from './views/MemoriesView.jsx'
import { MilestonesView } from './views/MilestonesView.jsx'
import { NewMemoryView } from './views/NewMemoryView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { ScrapbookView } from './views/ScrapbookView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([LUCAS_DEMO])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')
  const [memories, setMemories] = useState([])
  const [scrapbookOpen, setScrapbookOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const videoStopRef = useRef(null)
  const calendar = useCalendar(activeChildId, activeRoute === 'calendar')

  // put Lucas's demo days in the store, so the calendar has something to show
  useEffect(() => {
    seedDemoData()
  }, [])

  async function addMedia(file, kind) {
    if (!file || !activeChildId) return
    // each upload becomes a scrap on today's page for this child
    const scrap = await addScrap({ childId: activeChildId, date: toDayKey(), kind: 'memory' })
    const media = kind === 'photo'
      ? await savePhoto({ scrapId: scrap.id, file })
      : await saveVideo({ scrapId: scrap.id, file })
    await attachMediaToScrap(scrap.id, media.id)
    setMemories((current) => [...current, { ...media, url: URL.createObjectURL(file) }])
    setStatus(`${kind === 'photo' ? 'Photo' : 'Video'} added.`)
  }

  async function runMediaAction(action) {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  function renderNewMemory() {
    return (
      <NewMemoryView
        model={presentNewMemory({ busy, recording, status })}
        onAddFile={(file, kind) => runMediaAction(() => addMedia(file, kind))}
        onRecordPhoto={() => runMediaAction(() => addRecordedMedia('photo'))}
        onRecordVideo={() => {
          if (recording) {
            videoStopRef.current?.()
          } else {
            runMediaAction(() => addRecordedMedia('video'))
          }
        }}
      />
    )
  }

  function renderCalendar() {
    const child = children.find((c) => c.id === activeChildId)
    const milestoneScrapIds = (child?.milestones ?? []).map((m) => m.scrapId).filter(Boolean)

    return (
      <CalendarView
        model={presentCalendar({
          child,
          year: calendar.year,
          month: calendar.month,
          days: calendar.days,
          selectedDate: calendar.selectedDate,
          details: calendar.details,
          milestoneScrapIds,
        })}
        onNextMonth={calendar.showNextMonth}
        onOpenSummary={() => {}}
        onPreviousMonth={calendar.showPreviousMonth}
        onSelectDate={calendar.selectDate}
        onViewEntry={() => {
          setScrapbookOpen(true)
          setActiveRoute('scrapbook')
        }}
      />
    )
  }

  // The scrapbook opens on its cover; "Open me!" turns to the pages (photos and videos)
  function renderScrapbook() {
    if (scrapbookOpen) {
      return (
        <MemoriesView
          model={presentMemories({ memories })}
          onBack={() => setScrapbookOpen(false)}
          onDelete={deleteMedia}
        />
      )
    }
    return (
      <ScrapbookView
        model={presentScrapbook({ child: activeChild })}
        onOpenBook={() => setScrapbookOpen(true)}
      />
    )
  }

  async function addRecordedMedia(kind) {
    if (kind === 'photo') {
      await addMedia(await recordPhoto(), kind)
      return
    }

    let file
    try {
      file = await recordVideo({
        onStart: (stop) => {
          videoStopRef.current = stop
          setRecording(true)
        },
      })
    } finally {
      videoStopRef.current = null
      setRecording(false)
    }
    await addMedia(file, kind)
  }

  async function deleteMedia(memory) {
    if (memory.kind === 'photo') await deletePhoto(memory.id)
    else await deleteVideo(memory.id)
    URL.revokeObjectURL(memory.url)
    setMemories((current) => current.filter((item) => item.id !== memory.id))
  }

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
          setChildren((current) => [
            ...current,
            { id: crypto.randomUUID(), name, birthday: null, milestones: [], scrapbook: createScrapbook() },
          ])
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
  } else if (activeRoute === 'newMemory') {
    page = renderNewMemory()
  } else if (activeRoute === 'scrapbook') {
    page = renderScrapbook()
  } else if (activeRoute === 'calendar') {
    page = renderCalendar()
  }

  return (
    <AppShell
      activeRoute={activeRoute}
      navigationItems={navigationItems}
      navigationModel={presentSideNavigation({ child: activeChild })}
      onNavigate={(route) => {
        if (route === 'scrapbook') setScrapbookOpen(false)
        setActiveRoute(route)
      }}
      onNewMemory={() => setActiveRoute('newMemory')}
      onSwitchFolder={() => setStage('folders')}
    >
      {page}
    </AppShell>
  )
}

export default App
