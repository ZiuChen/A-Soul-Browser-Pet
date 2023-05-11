import { createActor, getActorImage } from '@/content/utils'
import { IMAGE_WIDTH, ACTOR_SPEED } from '@/common'
import type { ASoulOptions, ASoulStatus, ActorName } from '@/content/types'

console.log('content script')

class ASoul {
  position: { x: number; y: number }
  status: ASoulStatus
  container: HTMLDivElement
  actor: HTMLImageElement

  constructor({ x, y, name }: ASoulOptions) {
    this.position = { x, y }
    this.status = 'thinking'
    this.container = createActor({ x, y, name })
    this.actor = this.container.querySelector('img')!
    document.body.appendChild(this.container)
  }

  goto(x: number, y: number) {
    if (x === this.position.x && y === this.position.y) return

    // calculate the distance between current position and target position
    // translate the distance to transition duration
    const distance = Math.sqrt((x - this.position.x) ** 2 + (y - this.position.y) ** 2)
    const duration = distance / ACTOR_SPEED

    const shouldTurnLeft = x < this.position.x
    const shouldTurnRight = x > this.position.x

    if (shouldTurnLeft) {
      this.actor.style.transition = 'transform 0.1s linear'
      this.actor.style.transform = 'scaleX(1)'
    }
    if (shouldTurnRight) {
      this.actor.style.transition = 'transform 0.1s linear'
      this.actor.style.transform = 'scaleX(-1)'
    }

    // trigger animation
    this.container.style.transition = `left ${duration}s linear, top ${duration}s linear`
    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`

    // update position
    const requestIds: number[] = [] // store requestAnimationFrame ids

    // use requestAnimationFrame to get the real position
    const f = () => {
      const { left, top } = getComputedStyle(this.container)
      ;[this.position.x, this.position.y] = [parseInt(left, 10), parseInt(top, 10)]
      requestIds.push(requestAnimationFrame(f))
    }

    requestIds.push(requestAnimationFrame(f))

    const handleTransitionEnd = () => {
      ;[this.position.x, this.position.y] = [x, y]
      requestIds.forEach((id) => cancelAnimationFrame(id))
      requestIds.length = 0
    }

    // keep the last transitionend event listener
    this.container.removeEventListener('transitionend', handleTransitionEnd)
    this.container.addEventListener('transitionend', handleTransitionEnd)
  }

  async setStatus(status: ASoulStatus) {
    if (status === this.status) return

    this.container.querySelector('img')!.src = await getActorImage(
      this.container.dataset.name as ActorName,
      status
    )
  }
}

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
