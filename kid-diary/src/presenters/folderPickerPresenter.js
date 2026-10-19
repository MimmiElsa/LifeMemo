export function presentFolderPicker({ children = [] } = {}) {
  return {
    appName: 'LifeMemo',
    title: 'Whose memories do you want to create today?',
    subtitle: 'Pick a folder. You can switch any time.',
    folders: children.map((child) => ({ id: child.id, name: child.name })),
    addFolderLabel: 'Add Folder',
    addFolderHint: 'Each child gets their own folder',
    nameLabel: 'Child\'s name',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    backLabel: 'Back',
  }
}
