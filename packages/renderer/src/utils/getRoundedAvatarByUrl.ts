const scope = 'getRoundedAvatarByUrl'

const getRoundedAvatarByUrl = (
  imageURL: string,
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    const errorListenerCallback = () => {
      window._log.error('renderer', scope, 'Avatar loading is unsuccessed')
      resolve(undefined)
    }
    const loadListenerCallback = (e: Event) => {
      const image = e.target as HTMLImageElement
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0)
        context.fillStyle = '#fff'
        context.globalCompositeOperation = 'destination-in'
        context.beginPath()
        context.arc(
          image.width / 2,
          image.height / 2,
          image.width / 2,
          0,
          2 * Math.PI,
          true,
        )
        context.closePath()
        context.fill()
        resolve(canvas.toDataURL('image/jpg'))
        image.removeEventListener('error', errorListenerCallback)
      }
    }
    image.addEventListener('load', loadListenerCallback, { once: true })
    image.addEventListener('error', errorListenerCallback)
    image.src = imageURL
  })
}

export { getRoundedAvatarByUrl }
