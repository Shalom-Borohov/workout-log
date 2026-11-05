export const areaIconOf = (element: Element | null) =>
  element?.closest('ion-item')?.querySelector('.body-area-icon')?.getAttribute('data-area')
