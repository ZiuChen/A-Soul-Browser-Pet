import { createActor, getActorImage, loopWithRAF } from '@/content/utils'
import { ACTOR_SPEED } from '@/common'
import type { ASoulOptions, ASoulStatus, ActorName } from '@/content/types'

console.log('content script')

export class ASoul {
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

    // trigger animation
    this.actor.style.transition = 'transform 0.1s linear'
    this.actor.style.transform = shouldTurnLeft ? 'scaleX(1)' : 'scaleX(-1)'
    this.container.style.transition = `left ${duration}s linear, top ${duration}s linear`
    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`

    // update position
    // use requestAnimationFrame to get the real position
    const cancel = loopWithRAF(() => {
      const { left, top } = getComputedStyle(this.container)
      ;[this.position.x, this.position.y] = [parseInt(left, 10), parseInt(top, 10)]
    })

    const handleTransitionEnd = () => {
      ;[this.position.x, this.position.y] = [x, y]
      cancel()
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
