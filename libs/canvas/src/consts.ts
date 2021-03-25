/**
 * Ripple Effect表示位置（= クリック位置）を示す
 */
export type Position = {
  centerX: number,
  centerY: number,
}

/**
 * 描画領域
 */
export type AreaSize = {
  width: number,
  height: number,
}

/**
 * Ripple Effectの色
 */
export type Rgba = {
  r: number,
  g: number,
  b: number,
  a: number,
}

export const DefaultColor: Rgba = {
  r: 0,
  g: 0,
  b: 0,
  a: 0.3,
}

export type Theme = {
  /**
   * ロングタップ時の色
   */
  rippleColor: Rgba,
  /**
   * ロングタップにより領域全体がカバーされるまでの時間
   */
  lengthInMillis: number,
  /**
   * リリース後のフェードアウト時間
   */
  opacityLengthInMillis: number,
  /**
   * リリース後に領域全体がカバーされるまでの最大時間
   */
  maxReleasedFillLengthInMillis: number,
  /**
   * リリース後のエフェクト所要時間の最低倍率
   */
  releaseAcceleration: number,
}

export const DefaultTheme: Theme = {
  rippleColor: DefaultColor,
  lengthInMillis: 1500,
  opacityLengthInMillis: 800,
  releaseAcceleration: 2,
  maxReleasedFillLengthInMillis: 300,
}

export type Configuration = {
  /**
   * 対象とするCanvasのContext
   */
  context: CanvasRenderingContext2D,
  /**
   * 描画領域サイズ
   */
  areaSize: AreaSize,
  /**
   * Ripple表示位置
   */
  position: Position,
  theme: Theme,
}

/**
 * 描画終了時コールバック
 */
export type OnCompleted = () => void

export type State = {
  /**
   * 既にリリース済の場合にtrueを返す
   */
  released: boolean,
}

export type StateResolver = () => State
