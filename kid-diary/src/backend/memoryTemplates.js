// The ready-made starting points for a new memory ("Activity", "Moment", ...). Each one asks a few
// set questions and turns the answers into a scrap on today's page. They are the same ideas as
// the interaction cards on the start page.
//
// A field has a type:
//   'short'  one line of words        'long'   a few lines of words
//   'topic'  a topic: pick a suggestion or write your own
//   'photo'  a photo or video (a file)
//   'audio'  an audio recording (a file)
//
// Activity and Conversation have no fields: they have prompt sets (see below), answered with pictures.
//
// Answers are kept in an object by field id: { what: 'Built a pillow fort', photo: File, ... }

import { ACTIVITY_PROMPTS, CONVERSATION_PROMPTS, getDailyChallenge } from './demoIdeas.js'

export const MEMORY_TEMPLATES = [
  {
    id: 'activity',
    title: 'Activity',
    hint: 'Something you did together',
    kind: 'activity',
    // answered on the picture screen: one of these prompt sets is picked each time
    promptSets: ACTIVITY_PROMPTS,
  },
  {
    id: 'moment',
    title: 'Moment',
    hint: 'A photo and a short story',
    kind: 'memory',
    fields: [
      { id: 'photo', type: 'photo', label: 'A photo or video' },
      { id: 'story', type: 'long', label: 'The story', placeholder: 'What happened?' },
      { id: 'audio', type: 'audio', label: 'A recording' },
    ],
    // a photo, a story or a recording is enough
    needsOneOf: ['photo', 'story', 'audio'],
  },
  {
    id: 'conversation',
    title: 'Conversation',
    hint: 'Not sure what to talk about? Get inspired',
    kind: 'interaction',
    promptSets: CONVERSATION_PROMPTS,
  },
  {
    id: 'challenge',
    title: 'Daily challenge',
    hint: 'Do it together, then show the result',
    kind: 'activity',
    // the scrap is tagged, so the page shows it came from the challenge
    tag: 'challenge',
    // not in the "What do you want to add?" choices: it opens from the start page card
    hidden: true,
    // a new one each day
    get prompt() {
      return getDailyChallenge()
    },
    fields: [
      { id: 'photo', type: 'photo', label: 'Show the result: a photo or video' },
      { id: 'audio', type: 'audio', label: 'Or tell us about it' },
      { id: 'how', type: 'long', label: 'How did it go?', placeholder: 'What did you find?' },
    ],
    // a photo, a recording or a few words is enough
    needsOneOf: ['photo', 'audio', 'how'],
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
//   { kind, tag, pictures, text, files, milestoneTitle }  (files is a list that can be empty; milestoneTitle can be null)
// The words of each answer go on their own line, so the scrap reads like the questions did.
export function buildScrapFromAnswers(template, answers) {
  const say = (fieldId) => (answers[fieldId] ?? '').trim()
  let lines = []

  if (template.id === 'moment') {
    lines = [say('story')]
  } else if (template.id === 'challenge') {
    lines = [template.prompt, say('how')]
  } else if (template.id === 'milestone') {
    lines = [say('story') || say('title')]
  }

  return {
    kind: template.kind,
    tag: template.tag ?? null,
    pictures: [],
    text: lines.filter(Boolean).join('\n'),
    files: [answers.photo, answers.audio].filter(Boolean),
    milestoneTitle: template.isMilestone ? say('title') : null,
  }
}

// ---- Prompt screens (Activity and Conversation) ----
// A prompt set is a heading with a few questions. The answers are kept by question id:
//   { did: { picture: 'ball', note: 'We scored!', audio: File }, ate: { picture: 'toast' } }

// A prompt set of the template, picked at random
export function pickPromptSet(template) {
  const sets = template?.promptSets
  return sets ? sets[Math.floor(Math.random() * sets.length)] : null
}

function promptAnswer(question, answer = {}) {
  const picture = question.pictures.find((item) => item.id === answer.picture)
  return { picture, note: (answer.note ?? '').trim(), audio: answer.audio ?? null }
}

// Whether anything is answered yet
export function canSavePrompt(set, answers) {
  return set.questions.some((question) => {
    const { picture, note, audio } = promptAnswer(question, answers[question.id])
    return Boolean(picture || note || audio)
  })
}

// The answers as a scrap: the same shape buildScrapFromAnswers gives.
// Each answered question is a line (its note, or the picture's name), the pictures go on the scrap.
export function buildScrapFromPrompt(template, set, answers) {
  const lines = []
  const pictures = []
  const files = []
  for (const question of set.questions) {
    const { picture, note, audio } = promptAnswer(question, answers[question.id])
    if (picture) pictures.push(picture.id)
    if (audio) files.push(audio)
    if (note || picture) lines.push(`${question.label} ${note || picture.label}`)
  }
  return { kind: template.kind, tag: null, pictures, text: lines.join('\n'), files, milestoneTitle: null }
}
