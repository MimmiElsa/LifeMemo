import { useRef, useState } from 'react'
import {
  addEntry,
  attachMediaToEntry,
  deletePhoto,
  deleteVideo,
  recordPhoto,
  recordVideo,
  savePhoto,
  saveVideo,
} from './backend/index.js'
import { getNavigationItems, presentSideNavigation } from './presenters/appPresenter.js'
import { presentStartPage } from './presenters/startPagePresenter.js'
import { presentFolderPicker } from './presenters/folderPickerPresenter.js'
import { presentNewMemory } from './presenters/newMemoryPresenter.js'
import { presentScrapbook } from './presenters/scrapbookPresenter.js'
import { presentWelcome } from './presenters/welcomePresenter.js'
import { AppShell } from './views/AppShell.jsx'
import { FolderPickerView } from './views/FolderPickerView.jsx'
import { NewMemoryView } from './views/NewMemoryView.jsx'
import { ScrapbookView } from './views/ScrapbookView.jsx'
import { StartPageView } from './views/StartPageView.jsx'
import { WelcomeView } from './views/WelcomeView.jsx'

function App() {
  const navigationItems = getNavigationItems()
  const [stage, setStage] = useState('welcome')
  const [children, setChildren] = useState([{ id: 'child-lucas', name: 'Lucas' }])
  const [activeChildId, setActiveChildId] = useState(null)
  const [activeRoute, setActiveRoute] = useState('home')
  const [memories, setMemories] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const videoStopRef = useRef(null)

  async function addMedia(file, kind) {
    if (!file || !activeChildId) return
    const entry = await addEntry({ childId: activeChildId })
    const media = kind === 'photo'
      ? await savePhoto({ entryId: entry.id, file })
      : await saveVideo({ entryId: entry.id, file })
    await attachMediaToEntry(entry.id, media.id)
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

  function renderScrapbook() {
    return <ScrapbookView model={presentScrapbook({ memories })} onDelete={deleteMedia} />
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
          setChildren((current) => [...current, { id: crypto.randomUUID(), name }])
        }
        onBack={() => setStage('welcome')}
      />
    )
  }

  const activeChild = children.find((c) => c.id === activeChildId)
  const activeItem = navigationItems.find((item) => item.id === activeRoute)
  const pageTitle = activeRoute === 'newMemory' ? 'New Memory' : activeItem?.label ?? 'Page'
  const page = activeRoute === 'home'
    ? <StartPageView model={presentStartPage({ child: activeChild })} />
    : activeRoute === 'newMemory'
      ? renderNewMemory()
      : activeRoute === 'scrapbook'
        ? renderScrapbook()
        : <section><h1>{pageTitle}</h1></section>

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
