import { calcTotalProgress, calcRadius, calcMaxFillLength, calcReleasedRadius } from './drawFrame'

const random = () => Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER) + Number.MIN_SAFE_INTEGER

describe('calcTotalProgress', () => {

  test.each([0, -2929831, Number.MIN_SAFE_INTEGER])('与えられたフレームが0以下の場合、進捗は常に0を返すこと', (i) => {
    expect(i).toBeLessThanOrEqual(0)
    expect(calcTotalProgress(i, random())).toEqual(0)
  })

  test.each([1, 114514, 2929831, Number.MAX_SAFE_INTEGER])('与えられたフレームと現在のフレームが一致する場合、進捗は常に100%になること', (i) => {
    expect(i).toBeGreaterThan(0)
    expect(calcTotalProgress(i, i)).toEqual(1)
  })

})

describe('calcRadius', () => {

  test.each([1, 2929831, Number.MAX_SAFE_INTEGER])('与えられた進捗が100%以上の場合、常に最大半径を返すこと', (progress) => {
    expect(progress).toBeGreaterThanOrEqual(1)

    const max = random()
    expect(calcRadius(max, progress)).toEqual(max)
  })

})

describe('calcMaxFillLength', () => {

  test.each([150, 114514, Number.MAX_SAFE_INTEGER])('releasedFrameがタップ時間の最大長以上の場合、残fill時間は常に0となること', (releasedFrame) => {
    const lengthInMillis = 150
    expect(releasedFrame).toBeGreaterThanOrEqual(lengthInMillis)

    expect(
      calcMaxFillLength(lengthInMillis, releasedFrame, Math.abs(random()), Math.abs(random()))
    ).toEqual(0)
  })

  test.each([Number.MIN_SAFE_INTEGER, 0, 1000])('残fill時間が最長よりも長くなる場合、常に最長までに丸められること', (releasedFrame) => {
    const lengthInMillis = 2000
    const releaseAcceleration = 1
    const maxReleasedFillLengthInMillis = 500

    expect((lengthInMillis - releasedFrame) / releaseAcceleration).toBeGreaterThan(maxReleasedFillLengthInMillis)

    expect(calcMaxFillLength(lengthInMillis, releasedFrame, releaseAcceleration, maxReleasedFillLengthInMillis)).toEqual(maxReleasedFillLengthInMillis)
  })

})

describe('calcReleasedRadius', () => {

  test.each([114514, 2929831, Number.MAX_SAFE_INTEGER])('ロングタップ中に最大サイズ以上となっていた場合、常に最大サイズを返すこと', (lastIncreaseRadius) => {
    const max = 114514
    expect(lastIncreaseRadius).toBeGreaterThanOrEqual(max)

    expect(calcReleasedRadius(max, lastIncreaseRadius, random())).toEqual(max)
  })

})
