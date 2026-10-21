import { useEffect, useRef, useState } from 'react'
import {
  addScrap,
  attachMediaToScrap,
  deleteAudio,
  deletePhoto,
  deleteVideo,
  recordAudio,
  recordPhoto,
  recordVideo,
  saveAudio,
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
import { presentSettings } from './presenters/settingsPresenter.js'
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
import { SettingsView } from './views/SettingsView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { SummaryView } from './views/SummaryView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([LUCAS_DEMO])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')
  const [theme, setTheme] = useState('light')
  // how the next screen arrives: 'tab' fades up, 'forward' slides in from the right,
  // 'back' slides in from the left, 'none' is for a screen that arrives with its stage
  const [motion, setMotion] = useState('tab')
  const [stageMotion, setStageMotion] = useState('none')
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

  // the stylesheet restyles everything from this attribute
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function goTo(route, kind = 'forward') {
    setMotion(kind)
    setActiveRoute(route)
  }

  function goToStage(next, kind) {
    setStageMotion(kind)
    setStage(next)
  }

  function saveChildProfile(fields) {
    setChildren((current) =>
      current.map((child) => (child.id === activeChildId ? { ...child, ...fields } : child)),
    )
  }

  async function addMedia(file, kind) {
    if (!file || !activeChildId) return
    // each upload becomes a scrap on today's page for this child
    const scrap = await addScrap({ childId: activeChildId, date: toDayKey(), kind: 'memory' })
    const save = { photo: savePhoto, video: saveVideo, audio: saveAudio }[kind]
    const media = await save({ scrapId: scrap.id, file })
    await attachMediaToScrap(scrap.id, media.id)
    setScraps((current) => [...current, { ...media, url: URL.createObjectURL(file) }])
    setStatus(`${kind[0].toUpperCase()}${kind.slice(1)} added.`)
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
        onRecordAudio={() => {
          if (recording) {
            videoStopRef.current?.()
          } else {
            runMediaAction(() => addRecordedMedia('audio'))
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
          goTo('summary')
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
    goTo('scrapbook')
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
        onAddMemory={() => goTo('newMemory')}
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

    if (kind === 'audio') {
      let file
      try {
        file = await recordAudio({
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
    else if (scrap.kind === 'video') await deleteVideo(scrap.id)
    else await deleteAudio(scrap.id)
    URL.revokeObjectURL(scrap.url)
    setScraps((current) => current.filter((item) => item.id !== scrap.id))
  }

  if (stage === 'welcome') {
    return (
      <div className={`screen screen--${stageMotion}`} key="welcome">
        <WelcomeView model={presentWelcome()} onContinue={() => goToStage('folders', 'forward')} />
      </div>
    )
  }

  if (stage === 'folders') {
    return (
      <div className={`screen screen--${stageMotion}`} key="folders">
        <FolderPickerView
          model={presentFolderPicker({ children })}
          onSelectFolder={(id) => {
            setActiveChildId(id)
            setActiveRoute('home')
            setMotion('none')
            goToStage('app', 'forward')
          }}
          onAddFolder={(name) =>
            setChildren((current) => [
              ...current,
              { id: crypto.randomUUID(), name, birthday: null, photo: null, milestones: [], scrapbook: createScrapbook() },
            ])
          }
          onBack={() => goToStage('welcome', 'back')}
        />
      </div>
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
  } else if (activeRoute === 'settings') {
    page = (
      <SettingsView
        key={activeChildId}
        model={presentSettings({ child: activeChild, theme })}
        onSave={saveChildProfile}
        onThemeChange={setTheme}
      />
    )
  } else if (activeRoute === 'summary') {
    page = (
      <SummaryView
        model={presentSummary({
          child: activeChild,
          summary: summaryData.summary,
          mediaUrls: summaryData.mediaUrls,
        })}
        onBack={() => goTo('calendar', 'back')}
        onShuffle={() => setSummaryShuffle((count) => count + 1)}
      />
    )
  }

  return (
    <div className={`screen screen--${stageMotion}`} key="app">
      <AppShell
        activeRoute={activeRoute === 'summary' ? 'calendar' : activeRoute}
        motion={motion}
        navigationItems={navigationItems}
        navigationModel={presentSideNavigation({ child: activeChild })}
        onNavigate={(route) => {
          if (route === 'scrapbook') {
            setTurn(null)
            setScrapbookInitiallyOpen(false)
            setEntryDate(toDayKey())
            setHighlightScrapId(null)
          }
          goTo(route, 'tab')
        }}
        onNewMemory={() => goTo('newMemory')}
        onSwitchFolder={() => goToStage('folders', 'back')}
        pageKey={activeRoute}
      >
        {page}
      </AppShell>
    </div>
  )
}

export default App
