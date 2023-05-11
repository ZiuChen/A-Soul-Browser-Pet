/**
 * loop with requestAnimationFrame
 * @returns cancel function
 */
export function loopWithRAF(callback: () => void) {
  const requestIds: number[] = [] // store requestAnimationFrame ids
  const f = () => {
    callback && callback()
    requestIds.push(requestAnimationFrame(f))
  }
  requestIds.push(requestAnimationFrame(f))

  return () => {
    requestIds.forEach((id) => cancelAnimationFrame(id))
    requestIds.length = 0
  }
}
