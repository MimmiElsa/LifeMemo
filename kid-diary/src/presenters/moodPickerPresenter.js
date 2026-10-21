// The colours that stand for how the child feels. `color` is the same colour the calendar tints
// the day with. The faces are in views/moodFaces.js.
const MOOD_OPTIONS = [
  { id: 'cosy', label: 'Cosy', color: '#ffd9d0' },
  { id: 'happy', label: 'Happy', color: '#fff1c4' },
  { id: 'zippy', label: 'Zippy', color: '#dff3d2' },
  { id: 'calm', label: 'Calm', color: '#e3f0ff' },
  { id: 'dreamy', label: 'Dreamy', color: '#ece6ff' },
  { id: 'playful', label: 'Playful', color: '#ffe0f2' },
]

// The first step of a new memory: pick the colour of today's feeling.
export function presentMoodStep({ child = null } = {}) {
  return {
    closeLabel: 'Close',
    step: 1,
    stepCount: 2,
    title: child ? `How is ${child.name} feeling today?` : 'How are you feeling today?',
    subtitle: 'Pick the one that fits best. You can change it later.',
    options: MOOD_OPTIONS.map((option) => ({ ...option })),
    skipLabel: 'Skip for today',
    continueLabel: 'Continue',
  }
}
