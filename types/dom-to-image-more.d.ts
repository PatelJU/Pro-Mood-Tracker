declare module 'dom-to-image-more' {
  export interface DomToImageOptions {
    /** Width in pixels to be applied to node before rendering */
    width?: number
    /** Height in pixels to be applied to node before rendering */
    height?: number
    /** A string value for the background color, any valid CSS color value */
    bgcolor?: string
    /** Quality of the image, a number between 0 and 1 */
    quality?: number
    /** Pixel ratio of the device */
    scale?: number
    /** Whether to render each node on a new canvas */
    cacheBust?: boolean
    /** Whether to allow cross-origin images */
    useCORS?: boolean
    /** CSS styles to be applied to the cloned node */
    style?: Partial<CSSStyleDeclaration>
  }

  export function toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>
  export function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>
  export function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>
  export function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>
  export function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>
} 