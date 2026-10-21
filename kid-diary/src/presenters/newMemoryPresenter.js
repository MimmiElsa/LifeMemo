export function presentNewMemory({ busy = false, recording = false, status = '' } = {}) {
  return {
    title: 'New Memory',
    description: 'Add a photo, video, or audio recording to the scrapbook.',
    actions: {
      addPhoto: 'Add photo',
      addVideo: 'Add video',
      addAudio: 'Add audio',
      takePhoto: 'Take photo',
      recordVideo: recording ? 'Stop recording' : 'Record video',
      recordAudio: recording ? 'Stop recording' : 'Record audio',
    },
    busy,
    recording,
    status,
  }
}