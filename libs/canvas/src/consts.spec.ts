import { DefaultColor, DefaultTheme } from './consts'

describe('DefaultColor', () => {

  test.each(Object.keys(DefaultColor))('%sに何かしら値が設定されていること', (key) => {
    expect(DefaultColor[key]).toBeDefined()
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

describe('DefaultTheme', () => {

  test.each(Object.keys(DefaultTheme))('%sに何かしら値が設定されていること', (key) => {
    expect(DefaultTheme[key]).toBeDefined()
  })

  test('rippleColorがDefaultColorであること', () => {
    expect(DefaultTheme.rippleColor).toEqual(DefaultColor)
  })

  test('各値が0を上回ること', () => {
    expect(DefaultTheme.lengthInMillis).toBeGreaterThan(0)
    expect(DefaultTheme.opacityLengthInMillis).toBeGreaterThan(0)
    expect(DefaultTheme.releaseAcceleration).toBeGreaterThan(0)
    expect(DefaultTheme.maxReleasedFillLengthInMillis).toBeGreaterThan(0)
  })

  test('lengthInMillisをreleaseAccelerationで割った秒数よりmaxReleasedFillLengthInMillisのほうが短いこと', () => {
    expect(DefaultTheme.lengthInMillis / DefaultTheme.releaseAcceleration)
      .toBeGreaterThanOrEqual(DefaultTheme.maxReleasedFillLengthInMillis)
  })

})
