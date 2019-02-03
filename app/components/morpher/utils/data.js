import { groupBy } from 'lodash';
import { colorScaleProps } from './color';

export const groupedDataProps = (filtered, seriesField) => {
  const bySeries = seriesField
    ? groupBy(filtered, seriesField)
    : { all_data: filtered };

  return {
    bySeries,
    seriesKeys: Object.keys(bySeries),
  };
};

export const values = (array, field) => {
  return array.map((datum) => { return datum[field]; });
};

export const filteredDataProps = (data, filterFunction) => {
  const filter = filterFunction || function filterNone() { return true; };
  const filteredDataIds = [];
  const dataFilteredById = {};
  const dataFiltered = data.reduce((acc, datum) => {
    if (filter(datum)) {
      acc.push(datum);
      filteredDataIds.push(datum.morphableId);
      dataFilteredById[datum.morphableId] = datum;
    }
    return acc;
  }, []);

  return {
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
  };
};

export const updatedStateFromChartRequest = (dom, chartState) => {
  const {
    chartRequest: {
      seriesField,
      filterFunction,
    },
    chartRequest,
    morphableRawData,
  } = chartState;

  /** filter according to data request */
  const {
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
  } = filteredDataProps(morphableRawData, filterFunction);

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
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
    morphablesDomGroup: dom.morphablesGroup, // needed by map component for projection transform
    seriesKeys,
  };
};
