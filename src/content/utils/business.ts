import type { ASoulOptions, ASoulStatus, ActorName } from '@/content/types'

export interface createActorOptions extends ASoulOptions {
  initialStatus?: ASoulStatus
}

export function createActor({ x, y, name, initialStatus = 'thinking' }: createActorOptions) {
  const div = document.createElement('div')
  const img = document.createElement('img')
  div.classList.add('asoul-pet__container')
  div.dataset.name = name
  div.dataset.status = initialStatus
  div.style.position = 'fixed'
  div.style.left = `${x}px`
  div.style.top = `${y}px`
  div.style.zIndex = String(2147483647)
  img.classList.add('asoul-pet__img')
  img.style.width = '80px'
  img.style.height = '80px'
  img.alt = 'asoul'
  img.draggable = false
  import(`../../assets/${name}/${initialStatus}.png`).then((res) => {
    img.src = res.default
  })
  div.appendChild(img)
  return div
}

export async function getActorImage(name: ActorName, status: ASoulStatus) {
  return import(`../../assets/${name}/${status}.png`).then((res) => res.default)
}
