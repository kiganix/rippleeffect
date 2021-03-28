import { calcTotalProgress } from './drawFrame'

describe('calcTotalProgress', () => {
  const random = () => Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER) + Number.MIN_SAFE_INTEGER

  test.each([0, -2929831, Number.MIN_SAFE_INTEGER])('与えられたフレームが0以下の場合、進捗は常に0を返すこと', (i) => {
    expect(i).toBeLessThanOrEqual(0)
    expect(calcTotalProgress(i, random())).toEqual(0)
  })

  test.each([1, 114514, 2929831, Number.MAX_SAFE_INTEGER])('与えられたフレームと現在のフレームが一致する場合、進捗は常に100%になること', (i) => {
    expect(i).toBeGreaterThan(0)
    expect(calcTotalProgress(i, i)).toEqual(1)
  })

})
