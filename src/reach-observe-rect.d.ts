declare module '@reach/observe-rect' {
  export default function observeRect(el: Element, cb?: (rect: ClientRect) => void): void;
}
