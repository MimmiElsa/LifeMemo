// Issue #10 - Upload picture/media

import { createId } from '../utils/ids.js'
import { get, put, remove } from '../store.js'

function createMedia({ entryId, kind, file }) {
	if (!entryId) throw new Error('Media needs an entryId')
	if (!file) throw new Error('Media needs a file')

	return {
		id: createId(),
		entryId,
		kind,
		file,
		name: file.name ?? `${kind}-${Date.now()}`,
		mimeType: file.type ?? '',
		createdAt: new Date().toISOString(),
	}
}

export async function savePhoto({ entryId, file }) {
	const photo = createMedia({ entryId, kind: 'photo', file })
	await put('media', photo)
	return photo
}

export async function saveVideo({ entryId, file }) {
	const video = createMedia({ entryId, kind: 'video', file })
	await put('media', video)
	return video
}

export async function loadPhoto(id) {
	const photo = await get('media', id)
	return photo?.kind === 'photo' ? photo : undefined
}

export async function loadVideo(id) {
	const video = await get('media', id)
	return video?.kind === 'video' ? video : undefined
}

export async function deletePhoto(id) {
	const photo = await loadPhoto(id)
	if (photo) await remove('media', id)
}

export async function deleteVideo(id) {
	const video = await loadVideo(id)
	if (video) await remove('media', id)
}
