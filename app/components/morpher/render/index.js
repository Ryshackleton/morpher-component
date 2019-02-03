import { identity } from 'lodash';
import {
  axisBottom, format, scaleLinear, scaleThreshold, select,
} from 'd3';
import { pathGenerator, pathInterpolator } from '../utils/path';
import { css, defaults } from '../constants';
import * as styles from './styles';
import * as selections from './selections';

const {
  ANIMATE_ALL,
  ANIMATE_IN_SEQUENCE,
  FLUBBER_INTERPOLATE_OPTIONS,
  TRANSITION_DELAY,
  TRANSITION_DURATION,
} = defaults;

export function initialSVG(parentNode) {
  const svg = select(parentNode).append('svg');
  return {
    parent: parentNode,
    svg,
    axesGroup: svg.append('g').attr('class', css.AXES),
    xAxis: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.X_AXIS),
    yAxis: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.Y_AXIS),
    legendGroup: svg.append('g').attr('class', css.LEGEND_GROUP),
    bubbleLegend: svg.select(`g.${css.LEGEND_GROUP}`)
      .append('g').attr('class', css.BUBBLE_LEGEND),
    colorLegend: svg.select(`g.${css.LEGEND_GROUP}`)
      .append('g').attr('class', css.COLOR_LEGEND),
    chartGroup: svg.append('g').attr('class', css.CHART_SPACE),
    morphablesGroup: svg.select(`g.${css.CHART_SPACE}`).append('g').attr('class', css.MORPHABLES),
  };
}

export function axes(dom, chartState) {
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
      selections.fadeOutTransition(dom.xAxis.selectAll('*'), transitionDuration);
    }
    if (!yAxis) {
      selections.fadeOutTransition(dom.yAxis.selectAll('*'), transitionDuration);
    }
  }
}

export function chart(dom, chartState) {
  const {
    chartModel,
    chartModel: {
      shape,
    },
    chartRequest,
    chartRequest: {
      animationOrder = ANIMATE_ALL,
      transitionDuration = TRANSITION_DURATION,
      transitionDelay = TRANSITION_DELAY,
      animationSortField,
      animationSortAscending = true,
      morphableOpacityFunction = 1,
    },
    filteredDataIds = [],
  } = chartState;
  const { morphablesGroup } = dom;

  let delayCount = 0; // need an external counter because d3 selection indices aren't always from 0
  const isAnimatingInSequence = animationOrder === ANIMATE_IN_SEQUENCE;
  const delayFunction = isAnimatingInSequence
    ? () => {
      delayCount += 1;
      return delayCount * transitionDelay;
    }
    : transitionDelay;

  const join = morphablesGroup.selectAll('path')
    .data(filteredDataIds, identity);

  join.exit()
    .transition()
    .duration(transitionDuration)
    .style('opacity', 0)
    .remove();

  // interpolate paths on update
  const interpolator = pathInterpolator(shape, chartModel, FLUBBER_INTERPOLATE_OPTIONS);
  (isAnimatingInSequence
    ? selections.sortedSelection(join, { chartModel, animationSortField, animationSortAscending })
    : join)
    .attr('class', css[shape])
    .transition()
    .duration(transitionDuration)
    .delay(delayFunction)
    .call(styles.morphables, chartModel, chartRequest)
    .style('opacity', morphableOpacityFunction)
    .attrTween('d', interpolator);

  // generate paths on enter
  const pathGen = pathGenerator(shape, chartModel);
  join.enter()
    .append('path')
    .attr('class', css[shape])
    .call(styles.morphables, chartModel, chartRequest)
    .style('opacity', 0)
    .attr('d', pathGen)
    .transition()
    .duration(join.empty() ? 0 : transitionDuration)
    .delay(join.empty() ? 0 : transitionDuration / 2)
    .style('opacity', morphableOpacityFunction);
}

export function legends(dom, chartState) {
  const {
    chartModel: {
      colorScale,
    },
    chartRequest: {
      legendTitle = 'Legend Title',
      legendWidthScale = scaleLinear(),
      legendRange = [0, 50],
    },
  } = chartState;
  const {
    colorLegend,
  } = dom;
  if (!colorScale || !legendTitle) {
    return;
  }

  colorLegend.selectAll('*')
    .remove();

  const x = legendWidthScale
    .domain(colorScale.domain())
    .range(legendRange);

  const thresh = scaleThreshold()
    .domain(colorScale.domain())
    .range(colorScale.range());

  colorLegend
    .selectAll('rect')
    .data(thresh.range().map((d) => {
      const dInv = thresh.invertExtent(d);
      return [
        dInv[0] == null ? x.domain()[0] : dInv[0],
        dInv[1] == null ? x.domain()[1] : dInv[1],
      ];
    }))
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', (d) => { return x(d[0]); })
    .attr('width', (d) => { return (x(d[1]) - x(d[0])); })
    .attr('fill', (d) => { return thresh(d[0]); });

  colorLegend.call(axisBottom(x)
    .tickSize(13)
    .tickFormat(format('.1f'))
    .tickValues(thresh.domain()))
    .select('.domain')
    .remove();

  colorLegend
    .append('text')
    .attr('class', 'caption')
    .attr('x', x.range()[0])
    .attr('y', -8)
    .attr('fill', '#000')
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold')
    .text(legendTitle);
}

export function updateSVGTransforms(dom, margin, axesMargin) {
  const {
    axesGroup,
    chartGroup,
    legendGroup,
    parent,
    svg,
    xAxis,
    yAxis,
  } = dom;
  const [width, height] = [parent.offsetWidth, parent.offsetHeight];
  svg
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`);

  axesGroup.attr('transform', `translate(${margin.left},${margin.top})`);

  legendGroup.attr(
    'transform',
    `translate(${margin.left + axesMargin.left},${margin.top})`,
  );

  xAxis.attr(
    'transform',
    `translate(${axesMargin.left},${height - margin.bottom - axesMargin.bottom - margin.top})`,
  );

  yAxis.attr('transform', `translate(${axesMargin.left}, ${axesMargin.top})`);

  chartGroup.attr(
    'transform',
    `translate(${margin.left + axesMargin.left},${margin.top + axesMargin.top})`,
  );
}

export function getXYPixelRangesFromSVG(svg, margin, axesMargin) {
  const { height, width } = svg.node().getBoundingClientRect();

  return {
    /** figure out pixel x/y space from the dom, chart space is transformed to within the axes
     * bounds so it can have [0,0] as its starting coordinates */
    xScaleRange: [0, width - margin.left - margin.right - axesMargin.left - axesMargin.right],
    yScaleRange: [height - margin.top - margin.bottom - axesMargin.top - axesMargin.bottom, 0],
  };
}
