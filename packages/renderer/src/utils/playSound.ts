import Sound from '../../assets/mp3/notification-sound.mp3?url'

let canPlaySound = true

export const playSound = (): void => {
  if (canPlaySound) {
    canPlaySound = false
    setTimeout(() => {
      canPlaySound = true
    }, 1000)
    const audio = new Audio(Sound)
    audio.play()
  }
}
