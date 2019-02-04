import { select } from 'd3';
import { css } from '../constants';

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
