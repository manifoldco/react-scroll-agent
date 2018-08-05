# React Scroll Agent

Tiny, 6 KB (pre-gzip) scrollspy component that performantly runs at 60 FPS thanks to
`requestAnimationFrame` and
[@reach/observe-rect](https://github.com/reach/observe-rect).

<p align="center"><img src="./example.gif" alt="react-scroll-agent example" /></p>

### Install

```
npm i --save react-scroll-agent @reach/observe-rect
```

### Example

```js
import ScrollAgent from 'react-scroll-agent';

<ScrollAgent
  nav={({ current }) => (
    <menu>
      <a href="#section-1" className={current === 0 ? 'is-active' : ''}>Section 1</a>
      <a href="#section-2" className={current === 1 ? 'is-active' : ''}>Section 2</a>
      <a href="#section-3" className={current === 2 ? 'is-active' : ''}>Section 3</a>
    </menu>
  )}
  selector="section[data-scrollspy]"
  threshold="center"
>
  <section id="section-1" data-scrollspy>
    <h1>Section 1</h1>
  </section>
  <section id="section-2" data-scrollspy>
    <h1>Section 2</h1>
  </section>
  <section id="section-3" data-scrollspy>
    <h1>Section 3</h1>
  </section>
</ScrollAgent>
```


### Props

| Name        | Type       | Required | Default | Description                                                                                                                                                                                                                                    |
| :---------- | :--------- | :------: | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`  | `String`   | ✅        |         | Any CSS selector to specify which elements in `React.Children` to attach the scrollspy to.                                                                                                                                                     |
| `children`  | React Node |          |         | Standard passthrough for `React.Children`. This is where it watches for scroll events.                                                                                                                                                         |
| `detectEnd` | `Boolean`  |          | `true`  | If `true`, then `current` will always return `0` when scrolled to the top, and the last index at the bottom. If `false`, then `current` will return whichever container is at `threshold`, even if the first or last container is unreachable. |
| `nav`       | React Node |          |         | Render prop that returns `current` with the current index in view.                                                                                                                                                                             |
| `threshold` | `String`   |          | `"top"` | Trigger point at which `current` watches. Accepts `"top"`, `"center"`, or `"bottom"` (if a specific threshold is needed, simply add `padding` to the top or bottom of a container).                                                            |

### Notes

- This component achieves performance by letting you handle updates, animations, and scroll transitions yourself. If you need smooth scrolling from your nav, you can easily add another library to handle that. And react-scroll-agent will keep up!
- `requestAnimationFrame` won’t fire more than 60FPS, so it’s a perfect native debouncing function for managing scroll events and reflows.
- This component won’t update `current` unless it actually changes, preventing unnecessary re-renders in React.
