export function iconOf(host: Element) {
  const icon = host.querySelector('ion-icon')

  if (!icon || !('icon' in icon) || typeof icon.icon !== 'string') {
    throw new Error('no ion-icon with an icon')
  }

  return icon.icon
}
