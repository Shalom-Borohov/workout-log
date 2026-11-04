const REST_SOUND_URL = `${import.meta.env.BASE_URL}rest-done.wav`

let sound: HTMLAudioElement | undefined
let unlocked = false

function restSound(): HTMLAudioElement {
  sound ??= new Audio(REST_SOUND_URL)

  return sound
}

// iOS only lets an <audio> element play later if it was first played inside a tap.
export function unlockRestSound() {
  if (navigator.audioSession) {
    navigator.audioSession.type = 'transient'
  }
  const audio = restSound()

  if (unlocked || !audio.paused) {
    return
  }
  audio.muted = true
  void audio
    .play()
    .then(() => {
      audio.pause()
      unlocked = true
    })
    .catch(() => {})
}

export function relockRestSound() {
  unlocked = false
}

export function playRestSound() {
  const audio = restSound()

  audio.muted = false
  audio.currentTime = 0
  void audio.play().catch(() => {})
}
