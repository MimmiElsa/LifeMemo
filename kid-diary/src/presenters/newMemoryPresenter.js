import { MEMORY_TEMPLATES } from '../backend/memoryTemplates.js'
import { toDayKey } from '../backend/utils/dates.js'

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
    templates: MEMORY_TEMPLATES.map((template) => ({
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
    color: TEMPLATE_COLORS[template.id],
    fields: template.fields,
    saveLabel: 'Add to the page',
    takePhotoLabel: 'Take a photo',
    choosePhotoLabel: 'Choose a photo or video',
    removePhotoLabel: 'Remove',
  }
}
