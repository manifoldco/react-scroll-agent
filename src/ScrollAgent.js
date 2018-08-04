import React from 'react';
import PropTypes from 'prop-types';
import observeRect from '@reach/observe-rect';

const TOP = 'top';
const CENTER = 'center';
const BOTTOM = 'bottom';

class ScrollAgent extends React.PureComponent {
  // Memoized scroll position, to prevent unnecessary scroll firings
  _lastY = 0;

  // Memoized container height, to prevent unnecessary recalcs
  _lastH = 0;

  // Ref for scrollspy
  wrapper = React.createRef();

  // Reference of observed element
  observer = undefined;

  // Array of scrollspy Y values, calculated from top of window
  observedHeights = [];

  state = { current: 0 };

  componentDidMount() {
    this.observe();
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
    if (top !== this._lastY)
      window.requestAnimationFrame(() => this.handleScroll(top));
    if (!this.wrapper.current) return;
    if (height > 0 && height !== this._lastH)
      window.requestAnimationFrame(() => this.handleRecalc(height));
  };

  // Handle height recalculation, limited by requestAnimationFrame().
  handleRecalc = height => {
    this.observedHeights = [
      ...this.wrapper.current.querySelectorAll(this.props.selector),
    ]
      .map(node => node.getBoundingClientRect().top + window.scrollY)
      .sort((a, b) => a - b);
    this._lastH = height;
  };

  // Handle scroll event, limited by requestAnimationFrame().
  handleScroll = top => {
    // By default, highlight last item even if it doesn’t reach the top.
    if (
      this.props.detectEnd === true &&
      this._lastH - window.scrollY - window.innerHeight <= 1
    ) {
      this.setState({ current: this.observedHeights.length - 1 });
    } else {
      // Find first section that is “too far,” then step back one
      const threshold = top + window.scrollY + this.threshold;
      let current = this.observedHeights.findIndex(
        (y, index) => Math.floor(y - window.scrollY) > threshold
      );
      if (current < 0) current = this.observedHeights.length - 1;
      else current = Math.max(current - 1, 0);
      this.setState({ current });
    }
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
        {nav({ current: this.state.current })}
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
