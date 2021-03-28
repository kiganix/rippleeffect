import { DefaultColor } from './consts'

describe('DefaultColor', () => {

  test('何かしら値が設定されていること', () => {
    expect(DefaultColor.r).toBeDefined()
    expect(DefaultColor.g).toBeDefined()
    expect(DefaultColor.b).toBeDefined()
    expect(DefaultColor.a).toBeDefined()
  })

  test('各値が0以上であること', () => {
    expect(DefaultColor.r).toBeGreaterThanOrEqual(0)
    expect(DefaultColor.g).toBeGreaterThanOrEqual(0)
    expect(DefaultColor.b).toBeGreaterThanOrEqual(0)
    expect(DefaultColor.a).toBeGreaterThanOrEqual(0)
  })

  test('各色値が255以下であることであること', () => {
    expect(DefaultColor.r).toBeLessThanOrEqual(255)
    expect(DefaultColor.g).toBeLessThanOrEqual(255)
    expect(DefaultColor.b).toBeLessThanOrEqual(255)
  })

  test('透明度が1以下であることであること', () => {
    expect(DefaultColor.a).toBeLessThanOrEqual(1)
  })

})
