// Issue #10 - Upload picture/media
//
// A photo or video belongs to a scrap (one item on a day's page).

import { createId } from '../utils/ids.js'
import { get, put, remove } from '../store.js'

function createMedia({ scrapId, kind, file }) {
	if (!scrapId) throw new Error('Media needs a scrapId')
	if (!file) throw new Error('Media needs a file')

	return {
		id: createId(),
		scrapId,
		kind,
		file,
		name: file.name ?? `${kind}-${Date.now()}`,
		mimeType: file.type ?? '',
		createdAt: new Date().toISOString(),
	}
}

export async function savePhoto({ scrapId, file }) {
	const photo = createMedia({ scrapId, kind: 'photo', file })
	await put('media', photo)
	return photo
}

export async function saveVideo({ scrapId, file }) {
	const video = createMedia({ scrapId, kind: 'video', file })
	await put('media', video)
	return video
}

export async function saveAudio({ scrapId, file }) {
	const audio = createMedia({ scrapId, kind: 'audio', file })
	await put('media', audio)
	return audio
}

export async function loadPhoto(id) {
	const photo = await get('media', id)
	return photo?.kind === 'photo' ? photo : undefined
}

export async function loadVideo(id) {
	const video = await get('media', id)
	return video?.kind === 'video' ? video : undefined
}

export async function loadAudio(id) {
	const audio = await get('media', id)
	return audio?.kind === 'audio' ? audio : undefined
}

export async function deletePhoto(id) {
	const photo = await loadPhoto(id)
	if (photo) await remove('media', id)
}

export async function deleteVideo(id) {
	const video = await loadVideo(id)
	if (video) await remove('media', id)
}

export async function deleteAudio(id) {
	const audio = await loadAudio(id)
	if (audio) await remove('media', id)
}
