import { useEffect, useRef, useState } from 'react'
import {
  addScrap,
  addSticker,
  attachMediaToScrap,
  deleteScrap,
  moveScrap,
  moveSticker,
  recordPhoto,
  recordVideo,
  removeSticker,
  savePhoto,
  saveVideo,
  updateScrap,
} from './backend/index.js'
import { createMilestone } from './backend/models.js'
import { LUCAS_DEMO, seedDemoData } from './backend/demoData.js'
import { toDayKey } from './backend/utils/dates.js'
import { useCalendar } from './hooks/useCalendar.js'
import { useEntryPage, usePageDates } from './hooks/useEntryPage.js'
import { useMonthlySummary } from './hooks/useMonthlySummary.js'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentCalendar } from './presenters/calendarPresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentMilestones } from './presenters/milestonesPresenter.js'
import { presentNewMemory } from './presenters/newMemoryPresenter.js'
import { presentEntry, presentSpread } from './presenters/entryPresenter.js'
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

// The book shows two entries (pages of days) side by side. The pages come one after the other
// in time, and the spread that holds `date` is shown: pages 1+2, pages 3+4, and so on.
// `pageDates` are the days that have a page, oldest first.
function spreadAround(date, pageDates) {
  const index = pageDates.indexOf(date)
  if (index === -1) return { leftDate: date, rightDate: null, previousDate: null, nextDate: null }

  const leftIndex = index - (index % 2)
  return {
    leftDate: pageDates[leftIndex],
    rightDate: pageDates[leftIndex + 1] ?? null,
    previousDate: pageDates[leftIndex - 2] ?? null,
    nextDate: pageDates[leftIndex + 2] ?? null,
  }
}

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([LUCAS_DEMO])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')
  // a number that goes up whenever something in the store changed, so the pages are read again
  const [dataVersion, setDataVersion] = useState(0)
  const [scrapbookInitiallyOpen, setScrapbookInitiallyOpen] = useState(false)
  // which day's entry the scrapbook shows, and the scrap to point out on it
  const [entryDate, setEntryDate] = useState(() => toDayKey())
  const [highlightScrapId, setHighlightScrapId] = useState(null)
  // a page turn in progress: { direction: 'next' | 'previous', leftDate, rightDate, leftResult, rightResult }
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
  const scrapbookShowing = activeRoute === 'scrapbook'
  const pageDates = usePageDates(activeChildId, scrapbookShowing, dataVersion)
  const spread = spreadAround(entryDate, pageDates)
  const leftPage = useEntryPage(activeChildId, spread.leftDate, scrapbookShowing, dataVersion)
  const rightPage = useEntryPage(activeChildId, spread.rightDate, scrapbookShowing, dataVersion)

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
    refreshData()
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

  // The model of one entry (one page of the book)
  function buildPage(date, result, loaded) {
    return presentEntry({
      date,
      page: result.page,
      media: result.media,
      milestones: activeChild?.milestones ?? [],
      highlightScrapId,
      loaded,
    })
  }

  // Turning the page: read the two entries we are turning to first, then show the leaf turning
  async function turnPage(newLeftDate) {
    if (turn) return
    const next = spreadAround(newLeftDate, pageDates)
    const [leftResult, rightResult] = await Promise.all([
      leftPage.load(next.leftDate),
      next.rightDate ? rightPage.load(next.rightDate) : Promise.resolve({ page: null, media: {} }),
    ])
    setTurn({
      direction: newLeftDate > spread.leftDate ? 'next' : 'previous',
      leftDate: next.leftDate,
      rightDate: next.rightDate,
      leftResult,
      rightResult,
    })
  }

  function refreshData() {
    setDataVersion((version) => version + 1)
  }

  // Add a scrap (and its photo or video, if one was picked) to an entry
  async function addScrapToPage(date, { kind, text, file }) {
    const scrap = await addScrap({ childId: activeChildId, date, kind, text })
    if (file) {
      const media = file.type.startsWith('video/')
        ? await saveVideo({ scrapId: scrap.id, file })
        : await savePhoto({ scrapId: scrap.id, file })
      await attachMediaToScrap(scrap.id, media.id)
    }
    refreshData()
  }

  async function changeScrap(scrapId, fields) {
    await updateScrap(scrapId, fields)
    refreshData()
  }

  async function shiftScrap(scrapId, direction) {
    await moveScrap(scrapId, direction)
    refreshData()
  }

  // The milestones are kept with the child for now, so they are changed here
  function changeActiveChildMilestones(change) {
    setChildren((current) =>
      current.map((child) =>
        child.id === activeChildId ? { ...child, milestones: change(child.milestones) } : child,
      ),
    )
  }

  function markScrapAsMilestone(date, scrap, { title, color }) {
    changeActiveChildMilestones((milestones) => [
      ...milestones,
      createMilestone({
        childId: activeChildId,
        title,
        date,
        scrapId: scrap.id,
        source: 'user',
        color,
      }),
    ])
  }

  // A milestone the family made is removed; a suggested one only loses its scrap
  function unmarkScrapAsMilestone(scrap) {
    changeActiveChildMilestones((milestones) =>
      milestones.flatMap((milestone) => {
        if (milestone.scrapId !== scrap.id) return [milestone]
        return milestone.source === 'user' ? [] : [{ ...milestone, scrapId: null }]
      }),
    )
  }

  async function removeScrap(scrap) {
    await deleteScrap(scrap.id)
    unmarkScrapAsMilestone(scrap)
    refreshData()
  }

  async function stickOnPage(date, stickerId) {
    // lands near the middle of the page, a little crooked
    await addSticker({
      childId: activeChildId,
      date,
      sticker: stickerId,
      x: 30 + Math.random() * 40,
      y: 35 + Math.random() * 30,
      rotation: Math.round(Math.random() * 30 - 15),
    })
    refreshData()
  }

  async function shiftSticker(entryId, stickerId, x, y) {
    await moveSticker(entryId, stickerId, { x, y })
    refreshData()
  }

  async function takeStickerOff(entryId, stickerId) {
    await removeSticker(entryId, stickerId)
    refreshData()
  }

  function completeTurn() {
    if (!turn) return
    setEntryDate(turn.leftDate)
    setHighlightScrapId(null)
    setTurn(null)
  }

  // The scrapbook opens on its cover. Opening the book shows two entries side by side,
  // on the same screen, so browsing never loads another page.
  function renderScrapbook() {
    const bookSpread = presentSpread({
      left: buildPage(spread.leftDate, leftPage, leftPage.loaded),
      right: spread.rightDate ? buildPage(spread.rightDate, rightPage, rightPage.loaded) : null,
      previousDate: spread.previousDate,
      nextDate: spread.nextDate,
    })

    return (
      <ScrapbookView
        initiallyOpen={scrapbookInitiallyOpen}
        model={presentScrapbook({ child: activeChild })}
        onAddScrap={addScrapToPage}
        onAddSticker={stickOnPage}
        onDeleteScrap={removeScrap}
        onMarkMilestone={markScrapAsMilestone}
        onMoveScrap={shiftScrap}
        onMoveSticker={shiftSticker}
        onRemoveSticker={takeStickerOff}
        onTurnComplete={completeTurn}
        onTurnPage={turnPage}
        onUnmarkMilestone={unmarkScrapAsMilestone}
        onUpdateScrap={changeScrap}
        spread={bookSpread}
        turn={
          turn && {
            direction: turn.direction,
            leftDate: turn.leftDate,
            left: buildPage(turn.leftDate, turn.leftResult, true),
            right: turn.rightDate ? buildPage(turn.rightDate, turn.rightResult, true) : null,
          }
        }
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
