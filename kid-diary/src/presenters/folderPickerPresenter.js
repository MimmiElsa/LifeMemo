export function presentFolderPicker({ children = [] } = {}) {
  return {
    appName: 'LifeMemo',
    title: 'Whose memories do you want to create today?',
    subtitle: 'Pick a folder. You can switch any time.',
    folders: children.map((child) => ({ id: child.id, name: child.name, photo: child.photo ?? null })),
    addFolderLabel: 'Add Folder',
    addFolderHint: 'Each child gets their own folder',
    nameLabel: 'Child\'s name',
    namePlaceholder: 'e.g. Maya',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    backLabel: 'Back',
  }
}
