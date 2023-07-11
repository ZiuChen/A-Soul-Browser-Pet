import { createActor, getActorImage, loopWithRAF, randNumber } from '@/content/utils'
import { ACTOR_SPEED, IMAGE_WIDTH } from '@/common'
import type { ASoulOptions, ASoulStatus, ActorName } from '@/content/types'

console.log('content script')

export class ASoul {
  position: { x: number; y: number }
  status: ASoulStatus
  container: HTMLDivElement
  actor: HTMLImageElement
  towards: 'left' | 'right' = 'left'
  isDragging = false

  constructor({ x, y, name }: ASoulOptions) {
    this.position = { x, y }
    this.status = 'thinking'
    this.container = createActor({ x, y, name })
    this.actor = this.container.querySelector('img')!
    this.addClickHandler()
    this.addDragHandler()
    this.addDropHandler()
    document.body.appendChild(this.container)
  }

  goto(x: number, y: number) {
    if (x === this.position.x && y === this.position.y) return

    this.setStatus('chasing')

    // calculate the distance between current position and target position
    // translate the distance to transition duration
    const distance = Math.sqrt((x - this.position.x) ** 2 + (y - this.position.y) ** 2)
    const duration = distance / ACTOR_SPEED

    // trigger animation
    this.turnTo(x < this.position.x ? 'left' : 'right')
    this.container.style.transition = `left ${duration}s linear, top ${duration}s linear`
    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`

    // update position
    // use requestAnimationFrame to get the real position
    const cancel = loopWithRAF(() => {
      const { left, top } = getComputedStyle(this.container)
      ;[this.position.x, this.position.y] = [parseInt(left, 10), parseInt(top, 10)]

      // if current position equals target position, stop animation
      if (this.position.x === x && this.position.y === y) {
        cancel()
        this.setStatus('happy')
        this.container.style.transition = ''
      }
    })
  }

  async setStatus(status: ASoulStatus) {
    if (status === this.status) return

    this.container.querySelector('img')!.src = await getActorImage(
      this.container.dataset.name as ActorName,
      status
    )
  }

  setRandomStatus() {
    this.setStatus(`interact_${randNumber(1, 9)}` as ASoulStatus)
  }

  turnTo(target: 'left' | 'right') {
    if (this.towards === target) return

    this.towards = target
    this.actor.style.transition = 'transform 0.1s linear'
    this.actor.style.transform = target === 'left' ? 'scaleX(1)' : 'scaleX(-1)'
  }

  addClickHandler() {
    this.actor.addEventListener('click', (e) => {
      // determine the direction of the click, and turn to the direction
      // NOTE: offsetX is relative to the target element
      //       if the target element already has a transform, offsetX will be affected
      const { offsetX } = e
      this.turnTo(
        this.towards === 'left' && offsetX > IMAGE_WIDTH / 2
          ? 'right'
          : this.towards === 'right' && offsetX - IMAGE_WIDTH / 2 > 0
          ? 'left'
          : this.towards
      )

      // random choose a interact status
      this.setRandomStatus()

      e.preventDefault()
      e.stopPropagation()
    })
  }

  addDragHandler() {
    let offsetX: number,
      offsetY = 0

    this.actor.addEventListener('mousedown', (e) => {
      this.isDragging = true
      this.setStatus('unhappy')
      offsetX = e.offsetX
      offsetY = e.offsetY
    })

    this.actor.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const x = e.clientX - offsetX
        const y = e.clientY - offsetY
        this.container.style.left = `${x}px`
        this.container.style.top = `${y}px`
        this.position.x = x
        this.position.y = y
      }
    })

    this.actor.addEventListener('mouseup', (e) => {
      if (this.isDragging) this.setStatus('happy')
      this.isDragging = false
      this.position.x = e.clientX - offsetX
      this.position.y = e.clientY - offsetY
    })
  }

  addDropHandler() {
    this.actor.addEventListener('dragover', (e) => {
      e.preventDefault()
    })

    this.actor.addEventListener('drop', (e: DragEvent) => {
      console.log(e)
      // const data = e.dataTransfer?.getData('text/plain')
      // console.log(data)
    })

    document.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement | HTMLAnchorElement | HTMLImageElement
      const data = {} as {
        title: string
        type: 'link' | 'image' | 'text'
        content: string
      }
      // link | image | text
      if (target?.href) {
        // link
        data.title = target.innerText || target.textContent || 'Link'
        data.content = target.href
        data.type = 'link'
      } else if (target?.src) {
        // image
        data.title = target.alt || 'Image'
        data.content = target.src
        data.type = 'image'
      } else {
        // plain text
        // able to get text at
        data.title = 'Text'
        data.content = target.textContent || target.innerText || ''
        data.type = 'text'
      }
    })
  }
}
