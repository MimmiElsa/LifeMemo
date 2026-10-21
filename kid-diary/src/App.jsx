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
import { useEntryDay } from './hooks/useEntryDay.js'
import { useMonthlySummary } from './hooks/useMonthlySummary.js'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentCalendar } from './presenters/calendarPresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentMilestones } from './presenters/milestonesPresenter.js'
import { presentNewMemory } from './presenters/newMemoryPresenter.js'
import { presentEntry } from './presenters/entryPresenter.js'
import { presentScrapbook } from './presenters/scrapbookPresenter.js'
import { presentSummary } from './presenters/summaryPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { createScrapbook } from './backend/models.js'
import { AppShell } from './views/AppShell.jsx'
import { CalendarView } from './views/CalendarView.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { MilestonesView } from './views/MilestonesView.jsx'
import { NewMemoryView } from './views/NewMemoryView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { ScrapbookView } from './views/ScrapbookView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { SummaryView } from './views/SummaryView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([LUCAS_DEMO])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')
  const [scraps, setScraps] = useState([])
  const [scrapbookInitiallyOpen, setScrapbookInitiallyOpen] = useState(false)
  // which day's entry the scrapbook shows, and the scrap to point out on it
  const [entryDate, setEntryDate] = useState(() => toDayKey())
  const [highlightScrapId, setHighlightScrapId] = useState(null)
  // a page turn in progress: { date, direction: 'next' | 'previous', details, neighbours }
  const [turn, setTurn] = useState(null)
  // the month the summary page looks back at, and a counter that picks new random scraps
  const [summaryMonth, setSummaryMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  }))
  const [summaryShuffle, setSummaryShuffle] = useState(0)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const videoStopRef = useRef(null)
  const calendar = useCalendar(activeChildId, activeRoute === 'calendar')
  const summaryData = useMonthlySummary(
    activeChildId,
    summaryMonth.year,
    summaryMonth.month,
    activeRoute === 'summary',
    children.find((c) => c.id === activeChildId)?.milestones,
    summaryShuffle,
  )
  const entryDay = useEntryDay(activeChildId, entryDate, activeRoute === 'scrapbook', scraps.length)

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
    setScraps((current) => [...current, { ...media, url: URL.createObjectURL(file) }])
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
        onOpenSummary={() => {
          setSummaryMonth({ year: calendar.year, month: calendar.month })
          setSummaryShuffle((count) => count + 1)
          setActiveRoute('summary')
        }}
        onPreviousMonth={calendar.showPreviousMonth}
        onSelectDate={calendar.selectDate}
        onViewEntry={(date, scrapId = null) => openEntry(date, scrapId)}
      />
    )
  }

  // Show a day's entry in the scrapbook, with the book already open (and a scrap pointed out)
  function openEntry(date, scrapId = null) {
    setTurn(null)
    setEntryDate(date)
    setHighlightScrapId(scrapId)
    setScrapbookInitiallyOpen(true)
    setActiveRoute('scrapbook')
  }

  // The scrapbook opens on its cover. Opening the book shows the day's entry as facing pages,
  // on the same screen, so browsing never loads another page.
  // The model for one day's entry (the two facing pages)
  function buildEntryModel(date, page, loaded) {
    return presentEntry({
      date,
      storedScraps: page.details?.scraps ?? [],
      neighbours: page.neighbours,
      uploads: scraps,
      milestoneScrapIds: (activeChild?.milestones ?? []).map((m) => m.scrapId).filter(Boolean),
      highlightScrapId,
      loaded,
    })
  }

  // Turning a page: read the page we are turning to first, then show the leaf turning
  async function turnPage(date) {
    if (turn) return
    const page = await entryDay.load(date)
    setTurn({
      date,
      direction: date > entryDate ? 'next' : 'previous',
      details: page.details,
      neighbours: page.neighbours,
    })
  }

  function completeTurn() {
    if (!turn) return
    setEntryDate(turn.date)
    setHighlightScrapId(null)
    setTurn(null)
  }

  function renderScrapbook() {
    return (
      <ScrapbookView
        entryModel={buildEntryModel(entryDate, entryDay, entryDay.loaded)}
        initiallyOpen={scrapbookInitiallyOpen}
        model={presentScrapbook({ child: activeChild })}
        onAddMemory={() => setActiveRoute('newMemory')}
        onDeleteScrap={deleteScrap}
        onTurnComplete={completeTurn}
        onTurnPage={turnPage}
        turn={turn && { direction: turn.direction, model: buildEntryModel(turn.date, turn, true) }}
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

  async function deleteScrap(scrap) {
    if (scrap.kind === 'photo') await deletePhoto(scrap.id)
    else await deleteVideo(scrap.id)
    URL.revokeObjectURL(scrap.url)
    setScraps((current) => current.filter((item) => item.id !== scrap.id))
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
    page = (
      <MilestonesView
        model={presentMilestones({ child: activeChild })}
        onOpenMilestone={(block) => openEntry(block.date, block.scrapId)}
      />
    )
  } else if (activeRoute === 'newMemory') {
    page = renderNewMemory()
  } else if (activeRoute === 'scrapbook') {
    page = renderScrapbook()
  } else if (activeRoute === 'calendar') {
    page = renderCalendar()
  } else if (activeRoute === 'summary') {
    page = (
      <SummaryView
        model={presentSummary({
          child: activeChild,
          summary: summaryData.summary,
          mediaUrls: summaryData.mediaUrls,
        })}
        onBack={() => setActiveRoute('calendar')}
        onShuffle={() => setSummaryShuffle((count) => count + 1)}
      />
    )
  }

  return (
    <AppShell
      activeRoute={activeRoute === 'summary' ? 'calendar' : activeRoute}
      navigationItems={navigationItems}
      navigationModel={presentSideNavigation({ child: activeChild })}
      onNavigate={(route) => {
        if (route === 'scrapbook') {
          setTurn(null)
          setScrapbookInitiallyOpen(false)
          setEntryDate(toDayKey())
          setHighlightScrapId(null)
        }
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
