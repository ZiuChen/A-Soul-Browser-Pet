/**
 * loop with requestAnimationFrame
 * @returns cancel function
 */
export function loopWithRAF(callback: () => void) {
  let requestIds: number[] = [] // store requestAnimationFrame ids
  const f = () => {
    callback && callback()
    // after requestIds destoried, .push will throw Error, catch here
    try {
      requestIds.push(requestAnimationFrame(f))
    } catch {}
  }
  requestIds.push(requestAnimationFrame(f))

  return () => {
    requestIds.forEach((id) => cancelAnimationFrame(id))
    callback = null!
    requestIds = null!
  }
}
/**
 * generate a random number between min and max
 */
export function randNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
