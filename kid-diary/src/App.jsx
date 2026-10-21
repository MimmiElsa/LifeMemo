import { useEffect, useState } from 'react'
import {
  addScrap,
  addSticker,
  attachMediaToScrap,
  deleteScrap,
  getOrCreateEntry,
  moveScrap,
  moveSticker,
  recordAudio,
  recordPhoto,
  recordVideo,
  removeSticker,
  saveAudio,
  savePhoto,
  saveVideo,
  updateScrap,
} from './backend/index.js'
import { buildScrapFromAnswers, getMemoryTemplate } from './backend/memoryTemplates.js'
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
import { presentNewMemory, presentQuickMemory, presentTemplateForm } from './presenters/newMemoryPresenter.js'
import { presentEntry, presentSpread } from './presenters/entryPresenter.js'
import { presentScrapbook } from './presenters/scrapbookPresenter.js'
import { presentSettings } from './presenters/settingsPresenter.js'
import { presentSummary } from './presenters/summaryPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { createScrapbook } from './backend/models.js'
import { AppShell } from './views/AppShell.jsx'
import { CalendarView } from './views/CalendarView.jsx'
import { ScrapFormModal } from './views/EntryModals.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { MilestonesView } from './views/MilestonesView.jsx'
import { NewMemoryView } from './views/NewMemoryView.jsx'
import { PlaceholderPageView } from './views/PlaceholderPageView.jsx'
import { ScrapbookView } from './views/ScrapbookView.jsx'
import { SettingsView } from './views/SettingsView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { SummaryView } from './views/SummaryView.jsx'
import { TemplateFormView } from './views/TemplateFormView.jsx'
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

// A place near the middle of a page, a little crooked, for a new sticker
function randomStickerSpot() {
  return {
    x: 30 + Math.random() * 40,
    y: 35 + Math.random() * 30,
    rotation: Math.round(Math.random() * 30 - 15),
  }
}

// The camera and microphone functions (they ask the person for permission when they are used)
const recorder = { takePhoto: recordPhoto, recordVideo, recordAudio }

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
  // a number that goes up whenever something in the store changed, so the pages are read again
  const [dataVersion, setDataVersion] = useState(0)
  const [scrapbookInitiallyOpen, setScrapbookInitiallyOpen] = useState(false)
  // the entry that is in edit mode when the book opens (a day just started from the calendar)
  const [scrapbookEditDate, setScrapbookEditDate] = useState(null)
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
  // the new memory screens: null when closed, else { templateId, date, from }
  // (date = the day it is for, from = the page to go back to)
  const [newMemory, setNewMemory] = useState(null)
  // the Quick memory menu in the side bar: whether it is open, and the form chosen from it
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickVariant, setQuickVariant] = useState(null)
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

  // Escape closes the Quick memory menu
  useEffect(() => {
    if (!quickOpen) return undefined
    const close = (event) => event.key === 'Escape' && setQuickOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [quickOpen])

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
        onStartEntry={(date) => openNewMemory(null, date)}
        onViewEntry={(date, scrapId = null) => openEntry(date, scrapId)}
      />
    )
  }

  // Show a day's entry in the scrapbook, with the book already open (and a scrap pointed out)
  function openEntry(date, scrapId = null, startEditing = false) {
    setTurn(null)
    setScrapbookEditDate(startEditing ? date : null)
    setEntryDate(date)
    setHighlightScrapId(scrapId)
    setScrapbookInitiallyOpen(true)
    goTo('scrapbook')
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

  // Quick memory: a form for one kind of scrap, saved on today's page, and the book opens on it
  async function saveQuickMemory(fields) {
    const date = toDayKey()
    const scrapId = await addScrapToPage(date, fields)
    setQuickVariant(null)
    openEntry(date, scrapId)
  }

  // New memory: first the choice (a blank page or a template), then the template's questions
  // `date` is the day the memory is for: today, or a day picked on the calendar or on a blank page
  function openNewMemory(templateId = null, date = toDayKey()) {
    setNewMemory({ templateId, date, from: activeRoute === 'newMemory' ? 'home' : activeRoute })
    goTo('newMemory')
  }

  function closeNewMemory() {
    const { from, date } = newMemory
    setNewMemory(null)
    // from the book, go back to the same page with the book open
    if (from === 'scrapbook') openEntry(date)
    else goTo(from ?? 'home', 'back')
  }

  // A template's answers become a scrap on the day's page (and a milestone for the Milestone template),
  // and the book opens on it
  async function saveTemplateMemory(template, answers) {
    const date = newMemory.date
    const { kind, text, files, milestoneTitle } = buildScrapFromAnswers(template, answers)

    const scrap = await addScrap({ childId: activeChildId, date, kind, text })
    for (const file of files) await attachFile(scrap.id, file)
    if (milestoneTitle) {
      markScrapAsMilestone(date, scrap, { title: milestoneTitle, color: '#FFD84D' })
    }

    refreshData()
    setNewMemory(null)
    openEntry(date, scrap.id)
  }

  // Start the entry of a day (from the calendar), also one that has passed: its page is made,
  // and the book opens on it, ready to add to
  async function startEntry(date) {
    await getOrCreateEntry(activeChildId, date)
    refreshData()
    openEntry(date, null, true)
  }

  // Add a scrap (and its photo or video, if one was picked) to an entry
  async function addScrapToPage(date, { kind, text, file }) {
    const scrap = await addScrap({ childId: activeChildId, date, kind, text })
    if (file) await attachFile(scrap.id, file)
    refreshData()
    return scrap.id
  }

  // Save a photo, a video or an audio recording on a scrap
  async function attachFile(scrapId, file) {
    const save = file.type.startsWith('video/') ? saveVideo : file.type.startsWith('audio/') ? saveAudio : savePhoto
    const media = await save({ scrapId, file })
    await attachMediaToScrap(scrapId, media.id)
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
      ...randomStickerSpot(),
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
        initialEditDate={scrapbookEditDate}
        initiallyOpen={scrapbookInitiallyOpen}
        model={presentScrapbook({ child: activeChild })}
        onAddScrap={addScrapToPage}
        onNewMemory={(date) => openNewMemory(null, date)}
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
        recorder={recorder}
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
    page = <StartPageView model={presentStartPage({ child: activeChild })} onOpenTemplate={openNewMemory} />
  } else if (activeRoute === 'milestones') {
    page = (
      <MilestonesView
        model={presentMilestones({ child: activeChild })}
        onOpenMilestone={(block) => openEntry(block.date, block.scrapId)}
      />
    )
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

  if (activeRoute === 'newMemory') {
    const template = getMemoryTemplate(newMemory?.templateId)
    if (template) {
      return (
        <TemplateFormView
          model={presentTemplateForm({ template, date: newMemory.date })}
          onBack={() => setNewMemory({ ...newMemory, templateId: null })}
          onSave={(answers) => saveTemplateMemory(template, answers)}
          recorder={recorder}
          template={template}
        />
      )
    }

    return (
      <NewMemoryView
        model={presentNewMemory({ date: newMemory?.date })}
        onClose={closeNewMemory}
        onPickTemplate={(templateId) => setNewMemory({ ...newMemory, templateId })}
        onStartBlank={() => {
          const date = newMemory.date
          setNewMemory(null)
          startEntry(date)
        }}
      />
    )
  }

  const quickModel = presentQuickMemory()

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
            setScrapbookEditDate(null)
            setScrapbookInitiallyOpen(false)
            setEntryDate(toDayKey())
            setHighlightScrapId(null)
          }
          goTo(route, 'tab')
        }}
        onSwitchFolder={() => goToStage('folders', 'back')}
        pageKey={activeRoute}
        quick={{
          model: quickModel,
          open: quickOpen,
          onToggle: () => setQuickOpen((open) => !open),
          onPick: (option) => {
            setQuickOpen(false)
            setQuickVariant(option.variant)
          },
        }}
      >
        {page}
      </AppShell>

      {/* Quick memory takes its media on the spot; choosing files is for the book's toolbar and the templates */}
      {quickVariant && (
        <ScrapFormModal
          captureOnly
          kinds={quickModel.kinds}
          mediaLabels={quickModel.mediaLabels}
          onClose={() => setQuickVariant(null)}
          onSave={saveQuickMemory}
          recorder={recorder}
          variant={quickVariant}
        />
      )}
    </div>
  )
}

export default App
