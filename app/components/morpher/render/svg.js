import { select } from 'd3';
import { css } from '../constants';

/**
 * Builds the basic structure of the svg as shown below
 * parendNode.svg {
 *   // axis group top,left is the top,left of the margins
 *   g.axesGroup { -> transform: { margin.left, margin.top }
 *    g.xAxis -> transform: { axesMargin.left, height - margin.bottom - axesMargin.bottom - margin.top }
 *    g.xAxisLabel -> transform: { axesMargin.left, height - margin.bottom - axesMargin.bottom - margin.top }
 *    g.yAxis  -> transform: { axesMargin.left, axesMargin.top }
 *    g.yAxisLabel  -> transform: { axesMargin.left, axesMargin.top }
 *   }
 *   // legend top, left is top, left of chart margin (not axis margin)
 *   // legends currently sit in the top axis space, horizontally
 *   // TODO: make this dynamic and customizable to allow for vertical legends
 *   g.legendGroup { -> transform: { margin.left + axesMargin.left, margin.top }
 *    g.bubbleLegend {}
 *    g.colorLegend {}
 *   }
 *   // top left position is the top,left of axis group space
 *   g.chartGroup { -> margin.left + axesMargin.left, margin.top + axesMargin.top
 *     g.morphablesGroup -> no transform
 *   }
 * }
 * @param parentNode {DOM node} - to append svg to
 * @return {{colorLegend: *, parent: *, axesGroup: *, yAxis: *, bubbleLegend: *, xAxis: *, svg: *, legendGroup: *, morphablesGroup: *, chartGroup: *}} - object with properties representing d3.selections containing the g elements for for each of the groups above
 */
export function initialSVG(parentNode) {
  const svg = select(parentNode).append('svg');
  return {
    parent: parentNode,
    svg,
    axesGroup: svg.append('g').attr('class', css.AXES),
    xAxis: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.X_AXIS),
    xAxisLabel: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.X_AXIS_LABEL),
    yAxis: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.Y_AXIS),
    yAxisLabel: svg.select(`g.${css.AXES}`)
      .append('g').attr('class', css.Y_AXIS_LABEL),
    legendGroup: svg.append('g').attr('class', css.LEGEND_GROUP),
    bubbleLegend: svg.select(`g.${css.LEGEND_GROUP}`)
      .append('g').attr('class', css.BUBBLE_LEGEND),
    colorLegend: svg.select(`g.${css.LEGEND_GROUP}`)
      .append('g').attr('class', css.COLOR_LEGEND),
    chartGroup: svg.append('g').attr('class', css.CHART_SPACE),
    morphablesGroup: svg.select(`g.${css.CHART_SPACE}`).append('g').attr('class', css.MORPHABLES),
  };
}

/**
 *
 * @param dom {object} - dom object returned by initialSVG()
 * @param margin {object} - outer margin object
 * @param axesMargin {object} - axes margin object
 */
export function updateSVGTransforms(dom, margin, axesMargin) {
  const {
    axesGroup,
    chartGroup,
    legendGroup,
    parent,
    svg,
    xAxis,
    xAxisLabel,
    yAxis,
    yAxisLabel,
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

  const xTrans = `translate(${axesMargin.left},\
                  ${height - margin.bottom - axesMargin.bottom - margin.top})`;
  xAxis.attr('transform', xTrans);
  xAxisLabel.attr('transform', xTrans);

  const yTrans = `translate(${axesMargin.left}, ${axesMargin.top})`;
  yAxis.attr('transform', yTrans);
  yAxisLabel.attr('transform', yTrans);

  chartGroup.attr(
    'transform',
    `translate(${margin.left + axesMargin.left},${margin.top + axesMargin.top})`,
  );
}

/**
 * Finds the x and y ranges of the available space in the morphables group, which is pre-transformed
 * inside the axes
 * @param svg {d3.selection} - representing the main svg for this component
 * @param margin {object} - outer margin object { top, left, bottom, right }
 * @param axesMargin {object} - axis margin object { top, left, bottom, right }
 * @return {{yScaleRange: number[], xScaleRange: number[]}} - x and y ranges representing
 *          the [0, inner chart width] and [inner chart height, 0] of the morphable space
 *          (y is inverted because of the inverted svg coordinte scale)
 */
export function getXYPixelRangesFromSVG(svg, margin, axesMargin) {
  const { height, width } = svg.node().getBoundingClientRect();

  /** figure out pixel x/y space from the dom, chart space is transformed to within the axes
   * bounds so it can have [0,0] as its starting coordinates */
  const chartWidth = width - margin.left - margin.right - axesMargin.left - axesMargin.right;
  const chartHeight = height - margin.top - margin.bottom - axesMargin.top - axesMargin.bottom;

  return {
    chartWidth,
    chartHeight,
    xScaleRange: [0, chartWidth],
    yScaleRange: [chartHeight, 0],
  };
}
