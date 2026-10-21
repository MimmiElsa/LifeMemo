// Issue #11 - Record
//
// Uses the browser camera. Only works over HTTPS (or localhost).

function requireCamera() {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error('Camera and microphone access needs Safari on HTTPS')
	}
}

const cameraConstraints = {
	video: { facingMode: { ideal: 'environment' } },
}

export async function recordPhoto() {
	requireCamera()
	const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints)
	const video = document.createElement('video')
	video.srcObject = stream
	video.muted = true
	video.playsInline = true

	try {
		await new Promise((resolve) => {
			video.addEventListener('loadedmetadata', resolve, { once: true })
		})
		await video.play()

		const canvas = document.createElement('canvas')
		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		canvas.getContext('2d').drawImage(video, 0, 0)

		return await new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) resolve(blob)
				else reject(new Error('Could not capture the photo'))
			}, 'image/jpeg')
		})
	} finally {
		stream.getTracks().forEach((track) => track.stop())
	}
}

export async function recordVideo({ onStart } = {}) {
	requireCamera()
	if (!window.MediaRecorder) throw new Error('Video recording is not supported in this browser')

	const stream = await navigator.mediaDevices.getUserMedia({
		...cameraConstraints,
		audio: true,
	})
	const mimeType = ['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm']
		.find((type) => MediaRecorder.isTypeSupported?.(type))
	const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
	const chunks = []

	return await new Promise((resolve, reject) => {
		recorder.ondataavailable = (event) => {
			if (event.data.size) chunks.push(event.data)
		}
		recorder.onerror = () => {
			stream.getTracks().forEach((track) => track.stop())
			reject(new Error('Could not record the video'))
		}
		recorder.onstop = () => {
			stream.getTracks().forEach((track) => track.stop())
			resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
		}
		recorder.start()
		onStart?.(() => {
			if (recorder.state === 'recording') recorder.stop()
		})
	})
}
