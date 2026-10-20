export function presentNewMemory({ busy = false, recording = false, status = '' } = {}) {
  return {
    title: 'New Memory',
    description: 'Add a photo or video to the scrapbook.',
    actions: {
      addPhoto: 'Add photo',
      addVideo: 'Add video',
      takePhoto: 'Take photo',
      recordVideo: recording ? 'Stop recording' : 'Record video',
    },
    busy,
    recording,
    status,
  }
}