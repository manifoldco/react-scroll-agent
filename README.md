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

```jsx
import ScrollAgent from 'react-scroll-agent';

<ScrollAgent
  nav={({ current, positions }) => (
    <menu>
      <a href="#section-1" className={current === 0 ? 'is-active' : ''}>
        Section 1
      </a>
      <a href="#section-2" className={current === 1 ? 'is-active' : ''}>
        Section 2
      </a>
      <a
        onClick={() => window.scrollTo(0, positions[2])}
        className={current === 2 ? 'is-active' : ''}
      >
        Section 3
      </a>
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
</ScrollAgent>;
```

### Props

| Name        | Type       | Required | Default | Description                                                                                                                                                                                     |
| :---------- | :--------- | :------: | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`  | `String`   |    ✅    |         | Any CSS selector to specify which elements in `children` to attach the scrollspy to.                                                                                                            |
| `children`  | React Node |          |         | Standard child passthrough. This is where it watches for scroll events.                                                                                                                         |
| `detectEnd` | `Boolean`  |          | `true`  | If `true`, the last index will be highlighted when scrolled to the bottom. If `false`, then when scrolled to the bottom, `current` will return whichever container is currently at `threshold`. |
| `nav`       | React Node |          |         | Render prop that returns `current` index in view and all `positions` of items.                                                                                                                  |
| `threshold` | `String`   |          | `"top"` | Trigger point at which `current` watches. Accepts `"top"`, `"center"`, or `"bottom"` (if a specific threshold is needed, simply add `padding` to the top or bottom of a container).             |

### Nav

The `nav` render prop returns the following items:

```jsx
<ScrollAgent
  nav={({ current, positions }) => (
    <menu>
      <a href="#section-1" className={current === 0 ? 'is-active' : ''}>Section 1</a>
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          window.scrollTo(0, positions[1]);
        }}
        className={current === 1 ? 'is-active' : ''}
      >
        Section 2
      </a>
    </menu>
  )}
```

| Name        | Type       | Description                                                                                                               |
| :---------- | :--------- | :------------------------------------------------------------------------------------------------------------------------ |
| `current`   | `Number`   | The index of the current item in view, in visual descending order on the page (may not necessarily be DOM order).         |
| `positions` | `[Number]` | An array of all absolute Y values on the page, ordered from top to bottom. Useful for animating scroll to a certain item. |

### IIFE & ESM

This module ships with ESM and IIFE versions! To load it just request:

#### ESM (9 KB unminified)

```js
import ScrollAgent from 'react-scroll-agent/esm';
```

#### IIFE (4 KB, for use in <script> tag)

```
<script src="//unpkg.com/react-scroll-agent/dist/iife.js"></script>
```

### Notes

- If the first item isn’t in view, then `current` will return `-1`. This is expected, and allows more flexibility in styling. If you always want the first item to be highlighted, then check that `current === 0 || current === -1`.
- This component achieves performance by letting you handle all animations. If you need smooth scrolling from your nav, you can easily add another library to handle that using `positions`.
- `requestAnimationFrame` won’t fire more than 60FPS, so it’s a perfect native debouncing function for managing scroll events and reflows.
- This component won’t update `current` or `positions` unless it actually changes, preventing unnecessary re-renders in React.
