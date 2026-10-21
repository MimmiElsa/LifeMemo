import blocksImage from '../../assets/stickers/blocks@3x 1.png'
import footballImage from '../../assets/stickers/football@3x 1.png'
import friendsImage from '../../assets/stickers/friends@3x 1.png'
import lilacOImage from '../../assets/icons/lilac-o 1.png'
import napImage from '../../assets/stickers/nap@3x 1.png'
import paintingImage from '../../assets/stickers/painting@3x 1.png'
import readingImage from '../../assets/stickers/reading@3x 1.png'
import singingImage from '../../assets/stickers/singing@3x 1.png'
import swingImage from '../../assets/stickers/swing@3x 1.png'
import yellowGrinImage from '../../assets/icons/yellow-grin 1.png'

// Demo ideas for the exhibition: daily challenges and the prompts a child answers with pictures.
// The start page cards and the memory screens draw on these. Replace with a real source later.

// One challenge for each day, going round in a circle
export const DAILY_CHALLENGES = [
  'Find three red things on the way home',
  'Count every dog you see today',
  'Make a funny face together and take a photo',
  'Find something soft, something rough and something smooth',
  'Tell a story with three silly voices',
  'Spot a cloud that looks like an animal',
  'Collect five different leaves',
  'Sing a song while you tidy up',
  'Build the tallest tower you can',
  'Find something that starts with the letter B',
]

// Today's challenge. The same day always gives the same challenge.
export function getDailyChallenge(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  return DAILY_CHALLENGES[dayNumber % DAILY_CHALLENGES.length]
}

// Pictures a child can tap to answer without writing. A picture has an `image` (an illustration)
// or, until there is one, just an `emoji` that stands in for it. Every picture has one id, so a
// scrap can keep the ids and the page shows the pictures again.
const picture = (id, label, emoji, image = null) => ({ id, label, emoji, image })

const football = picture('ball', 'Ball', '⚽', footballImage)
const painting = picture('paint', 'Painting', '🎨', paintingImage)
const blocks = picture('blocks', 'Blocks', '🧱', blocksImage)
const reading = picture('book', 'Book', '📚', readingImage)
const singing = picture('music', 'Music', '🎵', singingImage)
const swing = picture('park', 'Playground', '🛝', swingImage)
const friends = picture('friend', 'A friend', '🧒', friendsImage)
const nap = picture('tired', 'Tired', '😴', napImage)

const PLAY_PICTURES = [football, painting, blocks, reading, singing, swing]

const FOOD_PICTURES = [
  picture('toast', 'Toast', '🍞'),
  picture('pasta', 'Pasta', '🍝'),
  picture('apple', 'Apple', '🍎'),
  picture('cheese', 'Cheese', '🧀'),
  picture('donut', 'Donut', '🍩'),
]

const PLACE_PICTURES = [
  picture('outdoors', 'The park', '🌳'),
  picture('home', 'Home', '🏠'),
  picture('garden', 'The garden', '🌻'),
  picture('beach', 'The beach', '🏖️'),
  picture('shop', 'The shop', '🛒'),
]

const MAKING_PICTURES = [
  painting,
  picture('crayons', 'Crayons', '🖍️'),
  picture('paper', 'Paper', '✂️'),
  blocks,
  picture('dough', 'Play dough', '🥧'),
]

const PEOPLE_PICTURES = [
  picture('mum', 'Mum', '👩'),
  picture('dad', 'Dad', '👨'),
  picture('grandma', 'Grandma', '👵'),
  picture('grandpa', 'Grandpa', '👴'),
  friends,
]

const FEELING_PICTURES = [
  picture('happy', 'Happy', '😄', yellowGrinImage),
  picture('surprised', 'Surprised', '😮', lilacOImage),
  nap,
  picture('sad', 'Sad', '😢'),
  picture('cross', 'Cross', '😠'),
]

const THING_PICTURES = [
  picture('dog', 'A dog', '🐶'),
  picture('dragon', 'A dragon', '🐉'),
  picture('rocket', 'A rocket', '🚀'),
  picture('castle', 'A castle', '🏰'),
  picture('rainbow', 'A rainbow', '🌈'),
]

// Each category has a few prompt sets, and one is picked when the screen opens. A set is a
// heading and a few questions; every question is answered with a picture, a note or a voice.
//   questions: [{ id, label, pictures }]
export const ACTIVITY_PROMPTS = [
  {
    id: 'kindergarten',
    title: 'How was the day at kindergarten?',
    questions: [
      { id: 'did', label: 'What did you do?', pictures: PLAY_PICTURES },
      { id: 'ate', label: 'What did you eat?', pictures: FOOD_PICTURES },
    ],
  },
  {
    id: 'playing',
    title: 'What did you play today?',
    questions: [
      { id: 'where', label: 'Where were you?', pictures: PLACE_PICTURES },
      { id: 'played', label: 'What did you play?', pictures: PLAY_PICTURES },
    ],
  },
  {
    id: 'making',
    title: 'What did you make today?',
    questions: [
      { id: 'used', label: 'What did you use?', pictures: MAKING_PICTURES },
      { id: 'helped', label: 'Who helped?', pictures: PEOPLE_PICTURES },
    ],
  },
]

export const CONVERSATION_PROMPTS = [
  {
    id: 'laugh',
    title: 'What made you laugh today?',
    questions: [
      { id: 'who', label: 'Who was funny?', pictures: PEOPLE_PICTURES },
      { id: 'what', label: 'What happened?', pictures: THING_PICTURES },
    ],
  },
  {
    id: 'feelings',
    title: 'How did today feel?',
    questions: [
      { id: 'feel', label: 'How did you feel?', pictures: FEELING_PICTURES },
      { id: 'with', label: 'Who was there?', pictures: PEOPLE_PICTURES },
    ],
  },
  {
    id: 'dream',
    title: 'Tell me about a dream',
    questions: [
      { id: 'in', label: 'What was in it?', pictures: THING_PICTURES },
      { id: 'felt', label: 'How did it feel?', pictures: FEELING_PICTURES },
    ],
  },
]

// Every picture by its id, so a scrap that kept the ids can show its pictures again
const PICTURES_BY_ID = new Map(
  [...ACTIVITY_PROMPTS, ...CONVERSATION_PROMPTS]
    .flatMap((set) => set.questions.flatMap((question) => question.pictures))
    .map((item) => [item.id, item]),
)

export function getPicture(id) {
  return PICTURES_BY_ID.get(id) ?? null
}

// The picture library behind the "Use Illustrations" card: pictures for talking together, in
// groups a toddler can tell apart. Each picture has its word under it. Give a picture an `image`
// to replace its emoji.
const category = (id, label, cover, items) => ({ id, label, cover, items })

export const ILLUSTRATION_LIBRARY = [
  category('animals', 'Animals', '🐶', [
    picture('dog', 'Dog', '🐶'),
    picture('cat', 'Cat', '🐱'),
    picture('cow', 'Cow', '🐮'),
    picture('duck', 'Duck', '🦆'),
    picture('fish', 'Fish', '🐟'),
    picture('horse', 'Horse', '🐴'),
    picture('rabbit', 'Rabbit', '🐰'),
    picture('bird', 'Bird', '🐦'),
  ]),
  category('food', 'Food', '🍎', [
    picture('apple', 'Apple', '🍎'),
    picture('banana', 'Banana', '🍌'),
    picture('bread', 'Bread', '🍞'),
    picture('cheese', 'Cheese', '🧀'),
    picture('carrot', 'Carrot', '🥕'),
    picture('milk', 'Milk', '🥛'),
    picture('cookie', 'Cookie', '🍪'),
    picture('water', 'Water', '💧'),
  ]),
  category('feelings', 'Feelings', '😄', [
    picture('happy', 'Happy', '😄', yellowGrinImage),
    picture('sad', 'Sad', '😢'),
    picture('cross', 'Cross', '😠'),
    picture('surprised', 'Surprised', '😮', lilacOImage),
    picture('tired', 'Tired', '😴', napImage),
    picture('scared', 'Scared', '😨'),
  ]),
  category('playing', 'Playing', '⚽', [
    picture('ball', 'Ball', '⚽', footballImage),
    picture('paint', 'Painting', '🎨', paintingImage),
    picture('blocks', 'Blocks', '🧱', blocksImage),
    picture('book', 'Book', '📚', readingImage),
    picture('music', 'Singing', '🎵', singingImage),
    picture('park', 'Swing', '🛝', swingImage),
  ]),
  category('people', 'People', '👪', [
    picture('mum', 'Mum', '👩'),
    picture('dad', 'Dad', '👨'),
    picture('baby', 'Baby', '👶'),
    picture('grandma', 'Grandma', '👵'),
    picture('grandpa', 'Grandpa', '👴'),
    picture('friend', 'Friend', '🧒', friendsImage),
  ]),
  category('home', 'Home', '🏠', [
    picture('bed', 'Bed', '🛏️'),
    picture('bath', 'Bath', '🛁'),
    picture('teeth', 'Brush teeth', '🪥'),
    picture('chair', 'Chair', '🪑'),
    picture('door', 'Door', '🚪'),
    picture('cup', 'Cup', '🥤'),
  ]),
  category('outside', 'Outside', '🌳', [
    picture('sun', 'Sun', '☀️'),
    picture('rain', 'Rain', '🌧️'),
    picture('tree', 'Tree', '🌳'),
    picture('flower', 'Flower', '🌻'),
    picture('car', 'Car', '🚗'),
    picture('bus', 'Bus', '🚌'),
  ]),
]
