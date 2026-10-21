import { MEMORY_TEMPLATES } from '../backend/memoryTemplates.js'
import { toDayKey } from '../backend/utils/dates.js'
import { MEDIA_LABELS } from './mediaLabels.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// the colour of each template's card
const TEMPLATE_COLORS = {
  activity: '#ffe9dc',
  moment: '#ffe3f2',
  conversation: '#e6f1ff',
  milestone: '#fff1c8',
}

// "2026-10-04" -> "For Sunday, 4 October". The memory goes on that day's page: today, or a day
// that was picked on the calendar (the year is added when it is not this year).
function forDayLabel(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const yearPart = year === new Date().getFullYear() ? '' : ` ${year}`
  return `For ${WEEKDAYS[date.getDay()]}, ${day} ${MONTHS[month - 1]}${yearPart}`
}

// The first screen of a new memory: start on a blank page, or pick a ready-made template.
// `date` is the day it is for (a day key).
export function presentNewMemory({ date = toDayKey() } = {}) {
  return {
    headerTitle: 'New memory',
    closeLabel: 'Close',
    title: 'What do you want to add?',
    subtitle: forDayLabel(date),
    blank: {
      title: 'Blank page',
      hint: 'Mix photos, words and stickers freely',
      startLabel: 'Start blank',
    },
    templates: MEMORY_TEMPLATES.filter((template) => !template.hidden).map((template) => ({
      id: template.id,
      title: template.title,
      hint: template.hint,
      color: TEMPLATE_COLORS[template.id],
    })),
  }
}

// The questions of one template, with the words around them.
export function presentTemplateForm({ template, date = toDayKey() }) {
  return {
    headerTitle: template.title,
    backLabel: 'Back',
    title: template.title,
    subtitle: `${template.hint} · ${forDayLabel(date).replace('For ', '')}`,
    // a challenge shows its tag and what to do
    tag: template.tag ? 'Challenge' : null,
    prompt: template.prompt ?? null,
    color: TEMPLATE_COLORS[template.id],
    fields: template.fields,
    saveLabel: 'Add to the page',
    mediaLabels: MEDIA_LABELS,
  }
}

// The picture screen of an interaction card (Activity, Conversation): the questions of a prompt
// set that was picked for the category. `stepCount` is 2 when the mood step came first.
export function presentPromptMemory({ template, set, showSteps = false }) {
  return {
    closeLabel: 'Close',
    headerTitle: template.title,
    step: 2,
    stepCount: showSteps ? 2 : null,
    title: set.title,
    subtitle: 'Tap a picture, or add a note or your voice.',
    color: TEMPLATE_COLORS[template.id],
    backLabel: 'Back',
    saveLabel: 'Save to scrapbook',
    labels: {
      pickOne: 'Pick one below',
      note: 'Note',
      voice: 'Voice',
      notePlaceholder: 'Write a few words...',
      media: MEDIA_LABELS,
    },
  }
}

// The "Quick memory" menu in the side bar: add something to today's page in a few taps.
// Each choice opens the small form of that kind (the `variant`).
export function presentQuickMemory() {
  return {
    closeLabel: 'Close',
    title: 'Add to today',
    options: [
      { id: 'photo', label: 'Photo', icon: 'camera', variant: 'photo' },
      { id: 'voice', label: 'Voice note', icon: 'mic', variant: 'audio' },
      { id: 'video', label: 'Video', icon: 'video', variant: 'video' },
      { id: 'write', label: 'Write', icon: 'text', variant: 'text' },
    ],
    kinds: [
      { id: 'memory', label: 'Memory' },
      { id: 'activity', label: 'Activity' },
      { id: 'interaction', label: 'Interaction' },
    ],
    mediaLabels: MEDIA_LABELS,
  }
}
