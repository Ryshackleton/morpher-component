import {
  colorScaleProps,
  createIdTopoJsonFeatureMap,
  createMorphableIds,
  filteredDataProps,
  groupedDataProps,
} from '../utils';

export function newChartState(props) {
  const {
    axesMargin,
    margin,
  } = props;
  const data = createMorphableIds(props.data);
  return {
    axesMargin,
    data,
    idFeatureMap: createIdTopoJsonFeatureMap(
      data,
      props.topology,
      props.locationIdField || 'location_id',
    ),
    margin,
  };
}

export function updatedDataState(dom, chartState) {
  const {
    dataRequest,
    dataRequest: {
      seriesField,
      filterFunction,
    },
    chartRequest,
    data,
  } = chartState;

  /** filter according to data request */
  const {
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
  } = filteredDataProps(data, filterFunction);

  /** figure out the series */
  const { seriesKeys } = groupedDataProps(dataFiltered, seriesField);

  /** METHODS TO CONVERT MORPHABLE ID -> some value */
  /** morphableId -> color, color value */
  const {
    colorScale,
    colorValueFromId,
    colorFromId,
  } = colorScaleProps(chartState, seriesKeys, dataFiltered, dataFilteredById);

  return {
    ...chartState,
    chartRequest,
    colorScale,
    colorValueFromId,
    colorFromId,
    dataRequest,
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
    morphablesDomGroup: dom.morphablesGroup, // needed by map component for projection transform
    seriesKeys,
  };
}

export function updatedChartXYState(dom, chartState) {
  const {
    margin,
    axesMargin,
  } = chartState;
  const { height, width } = dom.svg.node().getBoundingClientRect();
  return {
    ...chartState,
    margin,
    axesMargin,
    /** figure out pixel x/y space from the dom, chart space is transformed to within the axes
     * bounds so it can have [0,0] as its starting coordinates */
    xScaleRange: [0, width - margin.left - margin.right - axesMargin.left - axesMargin.right],
    yScaleRange: [height - margin.top - margin.bottom - axesMargin.top - axesMargin.bottom, 0],
  };
}
