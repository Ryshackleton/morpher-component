import { defaults } from '../constants';
import { fadeOutTransition } from './util';
import { textwrap } from 'd3-textwrap';

const { TRANSITION_DURATION } = defaults;

export default function axes(dom, chartState) {
  const {
    axesMargin,
    chartModel: {
      xAxis,
      yAxis,
    },
    chartRequest: {
      transitionDuration = TRANSITION_DURATION,
      xAxisLabel,
      yAxisLabel,
      xField,
      yField,
    },
    xScaleRange,
    yScaleRange,
  } = chartState;

  if (xAxis || yAxis) {
    /* wrap functions to wrap text to boundaries */
    const wrapX = textwrap()
      .bounds({ height: axesMargin.bottom, width: xScaleRange[1] })
      .padding(10)
      .method('tspans');

    const wrapY = textwrap()
      .bounds({ height: axesMargin.left, width: yScaleRange[0] })
      .padding(10)
      .method('tspans');

    /* select all text nodes */
    dom.xAxis.select('g.text')
      .call(wrapX);
    /* fade axes group out, update axes if possible, fade axes group in again */
    dom.axesGroup
      .transition()
      .duration(transitionDuration / 2)
      .style('opacity', 0)
      .on('end', () => {
        /* rebuild axes */
        dom.xAxis.call(xAxis);
        dom.yAxis.call(yAxis);

        /* remove previous axis labels */
        dom.xAxisLabel.selectAll('text').remove();
        dom.yAxisLabel.selectAll('text').remove();

        /* add new axis labels */
        dom.xAxisLabel
          .attr('width', xScaleRange[1])
          .attr('height', axesMargin.bottom)
          .append('text')
          .attr('transform', `translate(0,${axesMargin.bottom * 0.75})`)
          .style('text-anchor', 'start')
          .style('alignment-baseline', 'baseline')
          .text(xAxisLabel || xField)
          .call(wrapX);
        dom.yAxisLabel
          .attr('width', axesMargin.left)
          .attr('height', yScaleRange[0])
          .append('text')
          .style('text-anchor', 'start')
          .style('alignment-baseline', 'hanging')
          .attr('transform', `translate(${-axesMargin.left},${yScaleRange[0]})rotate(-90)`)
          .text(yAxisLabel || yField)
          .call(wrapY);

        /* transition opacity back to showing axes */
        dom.axesGroup
          .transition()
          .duration(transitionDuration / 2)
          .style('opacity', 1);
      });
  } else {
    if (!xAxis) {
      fadeOutTransition(dom.xAxis.selectAll('*'), transitionDuration);
      fadeOutTransition(dom.xAxisLabel.selectAll('text'), transitionDuration);
    }
    if (!yAxis) {
      fadeOutTransition(dom.yAxis.selectAll('*'), transitionDuration);
      fadeOutTransition(dom.yAxisLabel.selectAll('text'), transitionDuration);
    }
  }
};
