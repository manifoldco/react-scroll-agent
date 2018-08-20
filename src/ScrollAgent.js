import React from 'react';
import PropTypes from 'prop-types';
import observeRect from '@reach/observe-rect';

// Settings
const REFIRE = 200; // Time in ms to refire calc (takes care of reflow that happens after final animationFrame firing)

// Values
const TOP = 'top';
const CENTER = 'center';
const BOTTOM = 'bottom';

class ScrollAgent extends React.PureComponent {
  // Memoized container height, to prevent unnecessary recalcs
  _lastH = -1;

  // setTimeout placeholder
  _lastRecalc = undefined;

  // Ref for scrollspy
  wrapper = React.createRef();

  // Reference of observed element
  observer = undefined;

  state = {
    current: -1,
    positions: [],
  };

  componentDidMount() {
    this.observe();
    // Initialize (observer won’t fire on mount)
    this.handleRecalc();
    this.handleScroll(window.scrollY);
  }

  componentDidUpdate() {
    this.observe();
  }

  componentWillUnmount() {
    if (this.observer) this.observer.unobserve();
  }

  get threshold() {
    switch (this.props.threshold) {
      case CENTER:
        return Math.floor(window.innerHeight / 2);
      case BOTTOM:
        return window.innerHeight;
      case TOP:
      default:
        return 0;
    }
  }

  // Fires on window scroll, and reflow (images loading, resize, etc.)
  observe = () => {
    if (this.observer || !this.wrapper.current) return;
    this.observer = observeRect(this.wrapper.current, this.handleChange);
    this.observer.observe();
  };

  // Fires on every observation change. Determines what should update.
  handleChange = ({ top, height }) => {
    if (typeof window === 'undefined') return;
    this.handleScroll(top);
    if (!this.wrapper.current) return;
    if (height > 0 && height !== this._lastH) {
      this.handleRecalc();
      this._lastH = height;

      // After last recalculation, wait 500ms and re-fire.
      // This fixes calc issues on longer pages when animationFrame skips.
      clearTimeout(this._lastRecalc);
      this._lastRecalc = setTimeout(() => this.handleRecalc(), REFIRE);
    }
  };

  // Handle height recalculation
  handleRecalc = () => {
    let elements = [];

    try {
      elements = this.wrapper.current.querySelectorAll(this.props.selector);
    } catch (err) {
      console.error(
        `⚠️ ReactScrollAgent: failed prop \`selector="${
          this.props.selector
        }"\`. Must be a valid param for document.querySelectorAll(): https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll`
      );
      console.error(err);
    }
    this.setState({
      positions: [...elements]
        .map(node => node.getBoundingClientRect().top + window.scrollY)
        .sort((a, b) => a - b),
    });
  };

  // Handle scroll event
  handleScroll = top => {
    // If detectEnd, highlight last item even if it doesn’t reach the top.
    if (
      this.props.detectEnd &&
      Math.floor(this._lastH - window.scrollY - window.innerHeight) <= 1
    ) {
      this.setState(({ positions }) => ({ current: positions.length - 1 }));
      return;
    }
    // Find first section that is “too far,” then step back one.
    // Infinity is added at the end so you can step back to the last index.
    this.setState(({ positions }) => ({
      current:
        [...positions, Infinity].findIndex(
          y => y - window.scrollY - this.threshold > 0
        ) - 1,
    }));
    this._lastY = top;
  };

  render() {
    const {
      children,
      detectEnd,
      nav,
      selector,
      threshold,
      ...props
    } = this.props;
    return (
      <div {...props}>
        {nav({
          current: this.state.current,
          positions: this.state.positions,
        })}
        <div ref={this.wrapper}>{children}</div>
      </div>
    );
  }
}

ScrollAgent.propTypes = {
  children: PropTypes.node,
  detectEnd: PropTypes.bool,
  nav: PropTypes.func,
  selector: PropTypes.string.isRequired,
  threshold: PropTypes.oneOf([TOP, CENTER, BOTTOM]),
};

ScrollAgent.defaultProps = {
  children: undefined,
  detectEnd: true,
  nav: () => null,
  threshold: TOP,
};

export default ScrollAgent;
