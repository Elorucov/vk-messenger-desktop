import { CapturerSourceData, MediaSharingEvents } from 'vkme-common'

export function getCapturerSourceData(): Promise<CapturerSourceData> {
  return new Promise<CapturerSourceData>((resolve) => {
    const handleSelectSourceId = ((event: CustomEvent<CapturerSourceData>) => {
      resolve(event.detail)
    }) as EventListenerOrEventListenerObject

    window.addEventListener(
      MediaSharingEvents.SELECTED_CAPTURER_SOURCE,
      handleSelectSourceId,
      {
        once: true,
      },
    )

    window.dispatchEvent(
      new Event(MediaSharingEvents.OPEN_SELECT_CAPTURER_SOURCE_MODAL),
    )
  })
}
