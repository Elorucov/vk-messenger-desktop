export async function getMacMediaDevice(): Promise<
  MediaDeviceInfo | undefined
> {
  const mediaDevices = await navigator.mediaDevices.enumerateDevices()

  return mediaDevices.find(
    (device) =>
      device.kind === 'audioinput' && device.label.includes('BlackHole'),
  )
}
