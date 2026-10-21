import { toDayKey } from '../backend/utils/dates.js'

export function presentSettings({ child = null, theme = 'light' } = {}) {
  return {
    title: 'Settings',
    subtitle: child ? `Make ${child.name}'s folder your own.` : 'Pick a folder first.',
    hasChild: Boolean(child),
    childId: child?.id ?? null,
    profileTitle: 'Child',
    nameLabel: "Child's name",
    birthdayLabel: 'Date of birth',
    latestBirthday: toDayKey(),
    photoLabel: 'Folder picture',
    photoHint: 'Shown on the folder and in the side menu.',
    choosePhotoLabel: 'Choose picture',
    changePhotoLabel: 'Change picture',
    removePhotoLabel: 'Remove',
    saveLabel: 'Save changes',
    savedLabel: 'Saved',
    values: {
      name: child?.name ?? '',
      birthday: child?.birthday ?? '',
      photo: child?.photo ?? null,
    },
    initial: (child?.name ?? '?').charAt(0).toUpperCase(),
    appearanceTitle: 'Appearance',
    themeLabel: 'Mode',
    theme,
    themeOptions: [
      { id: 'light', label: 'Light' },
      { id: 'dark', label: 'Dark' },
    ],
  }
}
