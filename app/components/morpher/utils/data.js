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

const filterNone = () => { return true; };

const filteredDataProps = ({
  chartRequest: {
    filterDataFunction = filterNone,
  },
  morphableRawData,
}) => {
  return morphableRawData.reduce((acc, datum) => {
    if (filterDataFunction(datum)) {
      acc.dataFiltered.push(datum);
      acc.filteredDataIds.push(datum.morphableId);
      acc.dataFilteredById[datum.morphableId] = datum;
    }
    return acc;
  },
  { // acc
    filteredDataIds: [],
    dataFilteredById: [],
    dataFiltered: [],
  });
};

export const updatedStateFromChartRequest = (dom, chartState) => {
  /** filter according to data request */
  const {
    dataFiltered,
    dataFilteredById,
    filteredDataIds,
  } = filteredDataProps(chartState);

  /** figure out the series */
  const {
    chartRequest: {
      seriesField,
    },
    chartRequest,
  } = chartState;
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
