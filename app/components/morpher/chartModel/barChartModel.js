import { reduce } from 'lodash';
import {
  axisBottom,
  axisLeft,
  max,
  scaleBand,
  scaleLinear,
  stack,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderNone,
  stackOrderReverse,
  stackOrderInsideOut,
} from 'd3';

import { chartShape } from '../constants';
import { getColorScale, groupedDataProps } from '../utils';

const stackOrderMap = {
  stackOrderAscending,
  stackOrderDescending,
  stackOrderNone,
  stackOrderReverse,
  stackOrderInsideOut,
};

export default function barChartModel(chartState) {
  const {
    chartRequest: {
      seriesField,
      xField,
      yField,
      shape,
      xAxisTicks = 5,
      yAxisTicks = 5,
      xAxisTickFormat = '',
      yAxisTickFormat = '',
      colorScaleD3Name,
      barStackOrder = 'stackOrderNone',
    },
    dataFiltered,
    seriesKeys,
    xScaleRange: normalX,
    yScaleRange: normalY,
  } = chartState;

  /** handle chart orientation */
  /** THE X AND Y NAMING CONVENTIONS ARE FLIPPED FOR A HORIZONTAL BAR CHART,
   *  WHEN THE BAR CHART IS HORIZONTAL, xField WILL PLOT ON THE Y AXIS */
  const isHorizontal = shape === chartShape.BAR_HORIZONTAL;
  const [xScaleRange, yScaleRange] = isHorizontal ? [normalY, normalX] : [normalX, normalY];

  /** METHODS TO CONVERT MORPHABLE ID -> some value */
  const {
    bySeries: barGroups,
    seriesKeys: barGroupKeys,
  } = groupedDataProps(dataFiltered, xField);

  const barDataModel = reduce(barGroups, (acc, barSeries) => {
    const layerObject = reduce(barSeries, (row, datum) => {
      return {
        ...row,
        total: row.total + datum[yField],
        [datum[seriesField]]: {
          morphableId: datum.morphableId,
          [yField]: datum[yField],
          [xField]: datum[xField],
        },
      };
    }, { total: 0 });
    acc.push(layerObject);
    return acc;
  }, []);

  const bandScale = scaleBand()
    .domain(barGroupKeys)
    .rangeRound(xScaleRange) // xScaleRange will refer to y direction for Horzontal bar Chart
    .paddingInner([0.2])
    .paddingOuter([0.2])
    .align([0.5]);

  const barDomain = [0, max(barDataModel, (datum) => { return datum.total; })];
  const linearScale = scaleLinear()
    .domain(barDomain).nice()
    .range(yScaleRange); // yScaleRange will refer to x direction for Horizontal Bar Chart

  /** pick the appropriate scale directions for horizontal or vertical bar charts */
  const xScale = isHorizontal ? linearScale : bandScale;
  const yScale = isHorizontal ? bandScale : linearScale;

  const colorLayerScale = getColorScale('scaleOrdinal', seriesKeys, colorScaleD3Name);

  /** stack model */
  const stackedDataKeyedById = stack()
    .order(stackOrderMap[barStackOrder])
    .value((datum, key) => {
      return datum[key][yField];
    })
    .keys(seriesKeys)(barDataModel)
    // flatten the stacked data to object by [id]: { x, y, h, w, xValue, yValue, color }
    .reduce((acc, eachBar) => {
      const color = colorLayerScale(eachBar.key);
      return {
        ...acc,
        ...eachBar.reduce((stackAccum, stackLayer) => {
          const unique = stackLayer.data[eachBar.key];
          return {
            ...stackAccum,
            [unique.morphableId]: {
              x: isHorizontal ? xScale(stackLayer[0]) : xScale(unique[xField]),
              y: isHorizontal ? yScale(unique[xField]) : yScale(stackLayer[1]),
              height: isHorizontal
                ? yScale.bandwidth()
                : yScale(stackLayer[0]) - yScale(stackLayer[1]),
              width: isHorizontal
                ? xScale(stackLayer[1]) - xScale(stackLayer[0])
                : xScale.bandwidth(),
              xValue: unique[xField],
              yValue: unique[yField],
              color,
            },
          };
        }, {}),
      };
    }, {});

  return {
    shape,
    seriesKeys,
    filteredDataIds: Object.keys(stackedDataKeyedById).map(Number),
    xValueFromId: (id) => { return stackedDataKeyedById[id].xValue; },
    xFromId: (id) => { return stackedDataKeyedById[id].x; },
    yValueFromId: (id) => { return stackedDataKeyedById[id].yValue; },
    yFromId: (id) => { return stackedDataKeyedById[id].y; },
    heightFromId: (id) => { return stackedDataKeyedById[id].height; },
    widthFromId: (id) => { return stackedDataKeyedById[id].width; },
    radiusFromId: (id) => {
      const rect = stackedDataKeyedById[id];
      return (rect.width + rect.height) * 0.5;
    },
    colorScale: colorLayerScale,
    colorValueFromId: (id) => { return stackedDataKeyedById[id].yValue; },
    colorFromId: (id) => { return stackedDataKeyedById[id].color; },
    xAxis: axisBottom(xScale)
      .ticks(xAxisTicks, xAxisTickFormat),
    yAxis: axisLeft(yScale)
      .ticks(yAxisTicks, yAxisTickFormat),
  };
}
