import { screen, Rectangle } from 'electron'

export function isPositionWithinScreenBounds(bounds: Rectangle): boolean {
  const displays = screen.getAllDisplays()

  return displays.some((display) => {
    const { x, y, width, height } = display.workArea

    return (
      bounds.x >= x &&
      bounds.y >= y &&
      bounds.x + bounds.width <= x + width &&
      bounds.y + bounds.height <= y + height
    )
  })
}
