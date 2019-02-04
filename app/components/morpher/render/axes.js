import { defaults } from '../constants';
import { fadeOutTransition } from './util';

const { TRANSITION_DURATION } = defaults;

export default function axes(dom, chartState) {
  const {
    chartModel: {
      xAxis,
      yAxis,
    },
    chartRequest: {
      transitionDuration = TRANSITION_DURATION,
    },
  } = chartState;

  if (xAxis || yAxis) {
    // fade axes group out, update axes if possible, fade axes group in again
    dom.axesGroup
      .transition()
      .duration(transitionDuration / 2)
      .style('opacity', 0)
      .on('end', () => {
        dom.xAxis.call(xAxis);
        dom.yAxis.call(yAxis);

        dom.axesGroup
          .transition()
          .duration(transitionDuration / 2)
          .style('opacity', 1);
      });
  } else {
    if (!xAxis) {
      fadeOutTransition(dom.xAxis.selectAll('*'), transitionDuration);
    }
    if (!yAxis) {
      fadeOutTransition(dom.yAxis.selectAll('*'), transitionDuration);
    }
  }
};
