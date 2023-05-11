import { ASoul } from '@/content/class'
import { IMAGE_WIDTH } from '@/common'

const actor = new ASoul({
  x: 100,
  y: 100,
  name: 'diana'
})

actor.container.addEventListener('click', () => {
  actor.setStatus('happy')
})

document.addEventListener('click', (e) => {
  const offset = IMAGE_WIDTH / 2
  actor.goto(e.clientX - offset, e.clientY - offset)
})
