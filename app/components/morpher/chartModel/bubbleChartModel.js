import {
  get, isNil, isEmpty, reduce,
} from 'lodash';
import {
  axisBottom,
  axisLeft,
  extent,
  scaleLinear,
  scaleLog,
  scaleTime,
  scaleSqrt,
  scaleUtc,
} from 'd3';
import { chartShape } from '../constants';
import { values } from '../utils';

const scaleMap = {
  scaleLinear,
  scaleLog,
  scaleSqrt,
  scaleTime,
  scaleUtc,
};

const paddedDomain = (domain, range, rangePadding) => {
  const inverse = scaleLinear()
    .domain([0, Math.abs(range[1] - range[0])])
    .range([0, Math.abs(domain[1] - domain[0])]);
  const domainPadding = inverse(rangePadding);
  return [domain[0] - domainPadding, domain[1] + domainPadding];
};

export default function bubbleChartModel(chartState) {
  const {
    chartRequest: {
      xField,
      yField,
      radiusField,
      defaultRadius = 3,
      radiusRange = [2, 20],
      xAxisTicks = 5,
      yAxisTicks = 5,
      xAxisTickFormat = '',
      yAxisTickFormat = '',
      xAxisScaleType = 'scaleLinear',
      yAxisScaleType = 'scaleLinear',
    },
    colorValueFromId,
    colorScale,
    colorFromId,
    dataFiltered,
    dataFilteredById,
    seriesKeys,
    xScaleRange,
    yScaleRange,
  } = chartState;

  /** morphableId -> x, x value */
  const xScale = scaleMap[xAxisScaleType]()
    .domain(
      // pad the domain with enough space so bubbles don't overlap the axes
      paddedDomain(
        extent(values(dataFiltered, xField)), // extent of the filtered data
        xScaleRange, // chart x space
        radiusRange[1] + radiusRange[0], // max bubble radius with a padding of the min radius
      ),
    )
    .range(xScaleRange);
  const xValueFromId = (id) => {
    return get(dataFilteredById, [id, xField]);
  };
  const xFromId = (id) => {
    const val = xValueFromId(id);
    return isNil(val) ? undefined : xScale(val);
  };

  /** morphableId -> y, y value */
  const yScale = scaleMap[yAxisScaleType]()
    .domain(
      // pad the domain with enough space so bubbles don't overlap the axes
      paddedDomain(
        extent(values(dataFiltered, yField)),
        yScaleRange, // chart y space
        radiusRange[1] + radiusRange[0], // max bubble radius with a padding of the min radius
      ),
    )
    .range(yScaleRange);
  const yValueFromId = (id) => {
    return get(dataFilteredById, [id, yField]);
  };
  const yFromId = (id) => {
    const val = yValueFromId(id);
    return isNil(val) ? undefined : yScale(val);
  };

  /** morphableId -> radius, radius value */
  const radiusUndefined = isEmpty(radiusField) || isNil(radiusField);
  const radiusScale = scaleLinear()
    .domain(extent(values(dataFiltered, radiusField)))
    .range(radiusRange);
  const radiusValueFromId = (id) => {
    return get(dataFilteredById, [id, radiusField]);
  };
  const idRadiusMap = reduce(dataFiltered, (acc, datum) => {
    acc[datum.morphableId] = radiusUndefined
      ? defaultRadius
      : radiusScale(radiusValueFromId(datum.morphableId));
    return acc;
  }, {});

  const radiusFromId = (id) => { return idRadiusMap[id]; };

  return {
    shape: chartShape.BUBBLE_SCATTER,
    colorValueFromId,
    colorScale,
    colorFromId,
    dataFilteredById,
    seriesKeys,
    xValueFromId,
    xFromId,
    yValueFromId,
    yFromId,
    radiusValueFromId,
    radiusFromId,
    xAxis: axisBottom(xScale)
      .ticks(xAxisTicks, xAxisTickFormat),
    yAxis: axisLeft(yScale)
      .ticks(yAxisTicks, yAxisTickFormat),
  };
}
