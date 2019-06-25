import React, { useEffect, useState, useRef } from 'react';
import observeRect from '@reach/observe-rect';

// Settings
const REFIRE = 500; // Time in ms to refire calc (takes care of reflow that happens after final animationFrame firing)

// Values
const TOP = 'top';
const CENTER = 'center';
const BOTTOM = 'bottom';

interface NavParams {
  current: number;
  positions: number[];
}

interface ScrollAgentProps {
  detectEnd?: boolean;
  nav?: (params: NavParams) => void;
  selector: string;
  threshold?: 'top' | 'center' | 'bottom';
}

const windowThreshold = (position: string) => {
  switch (position) {
    case CENTER:
      return Math.floor(window.innerHeight / 2);
    case BOTTOM:
      return window.innerHeight;
    case TOP:
    default:
      return 0;
  }
};

// setTimeout placeholder
let lastRecalc: number;

const ScrollAgent: React.FunctionComponent<ScrollAgentProps> = ({
  children,
  detectEnd = true,
  nav = (): void => {},
  selector,
  threshold = TOP,
  ...rest
}) => {
  // Memoized container height, to prevent unnecessary recalcs
  const [lastHeight, setLastHeight] = useState(-1);

  // Ref for scrollspy
  const wrapper = useRef<HTMLDivElement>(null);

  // Reference of observed element
  const [observer, setObserver] = useState();

  // State
  const [current, setCurrent] = useState(-1);
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    function handleChange({ height }: ClientRect) {
      if (typeof window === 'undefined') {
        return;
      }

      if (detectEnd && Math.floor(lastHeight - window.scrollY - window.innerHeight) <= 1) {
        setCurrent(positions.length - 1);
        return;
      }

      // Find first section that is “too far,” then step back one.
      // Infinity is added at the end so you can step back to the last index.
      setCurrent(
        [...positions, Infinity].findIndex(
          y => y - window.scrollY - windowThreshold(threshold) > 0
        ) - 1
      );

      if (height > 0 && height !== lastHeight) {
        handleRecalc();
        setLastHeight(height);

        // After last recalculation, wait 500ms and re-fire.
        // This fixes calc issues on longer pages when animationFrame skips.
        clearTimeout(lastRecalc);
        lastRecalc = setTimeout(handleRecalc, REFIRE);
      }
    }

    function handleRecalc() {
      if (!wrapper.current) {
        return;
      }
      let positions: number[] = [];
      wrapper.current.querySelectorAll(selector).forEach(node => {
        positions.push(node.getBoundingClientRect().top + window.scrollY);
      });
      setPositions(positions.sort((a, b) => a - b));
    }

    if (!observer && wrapper.current) {
      setObserver(observeRect(wrapper.current, handleChange));
    }
  }, [current, lastHeight]);

  return (
    <div {...rest}>
      {nav({ current, positions })}
      <div ref={wrapper}>{children}</div>
    </div>
  );
};

export default ScrollAgent;
