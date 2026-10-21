// The ready-made starting points for a new memory ("Activity", "Moment", ...). Each one asks a few
// set questions and turns the answers into a scrap on today's page. They are the same ideas as
// the interaction cards on the start page.
//
// A field has a type:
//   'short'  one line of words        'long'   a few lines of words
//   'topic'  a topic: pick a suggestion or write your own
//   'photo'  a photo or video (a file)
//
// Answers are kept in an object by field id: { what: 'Built a pillow fort', photo: File, ... }

export const MEMORY_TEMPLATES = [
  {
    id: 'activity',
    title: 'Activity',
    hint: 'Something you did together',
    kind: 'activity',
    fields: [
      { id: 'what', type: 'short', label: 'What did you do?', placeholder: 'Built a pillow fort', required: true },
      { id: 'who', type: 'short', label: 'Who was there?', placeholder: 'Mum, Maya and Grandpa' },
      { id: 'how', type: 'long', label: 'How did it go?', placeholder: 'What was funny or fun?' },
      { id: 'photo', type: 'photo', label: 'A photo of it' },
    ],
  },
  {
    id: 'moment',
    title: 'Moment',
    hint: 'A photo and a short story',
    kind: 'memory',
    fields: [
      { id: 'photo', type: 'photo', label: 'A photo or video' },
      { id: 'story', type: 'long', label: 'The story', placeholder: 'What happened?' },
    ],
    // a photo or a story is enough
    needsOneOf: ['photo', 'story'],
  },
  {
    id: 'conversation',
    title: 'Conversation',
    hint: 'New words from a card',
    kind: 'interaction',
    fields: [
      {
        id: 'topic',
        type: 'topic',
        label: 'Topic',
        placeholder: 'Choose a topic',
        suggestions: ['A new word', 'A funny question', 'Something they asked', 'A song or a rhyme', 'What they think'],
      },
      { id: 'said', type: 'long', label: 'What was said?', placeholder: 'Write something', required: true },
    ],
  },
  {
    id: 'milestone',
    title: 'Milestone',
    hint: 'A first or a big day',
    kind: 'memory',
    // also puts a block in the milestone tower
    isMilestone: true,
    fields: [
      { id: 'title', type: 'short', label: 'What is the milestone?', placeholder: 'First steps', required: true },
      { id: 'story', type: 'long', label: 'The story', placeholder: 'What happened?' },
      { id: 'photo', type: 'photo', label: 'A photo or video' },
    ],
  },
]

export function getMemoryTemplate(id) {
  return MEMORY_TEMPLATES.find((template) => template.id === id)
}

function answered(answers, fieldId) {
  const value = answers[fieldId]
  return typeof value === 'string' ? value.trim() !== '' : Boolean(value)
}

// Whether enough is filled in to save
export function canSaveMemory(template, answers) {
  const requiredDone = template.fields
    .filter((field) => field.required)
    .every((field) => answered(answers, field.id))
  const oneOfDone = !template.needsOneOf || template.needsOneOf.some((fieldId) => answered(answers, fieldId))
  return requiredDone && oneOfDone
}

// Turns the answers into what a scrap is made of:
//   { kind, text, file, milestoneTitle }  (file and milestoneTitle can be null)
// The words of each answer go on their own line, so the scrap reads like the questions did.
export function buildScrapFromAnswers(template, answers) {
  const say = (fieldId) => (answers[fieldId] ?? '').trim()
  let lines = []

  if (template.id === 'activity') {
    lines = [say('what'), say('who') && `With ${say('who')}`, say('how')]
  } else if (template.id === 'moment') {
    lines = [say('story')]
  } else if (template.id === 'conversation') {
    lines = [say('topic') && `${say('topic')}:`, say('said')]
  } else if (template.id === 'milestone') {
    lines = [say('story') || say('title')]
  }

  return {
    kind: template.kind,
    text: lines.filter(Boolean).join('\n'),
    file: answers.photo ?? null,
    milestoneTitle: template.isMilestone ? say('title') : null,
  }
}
