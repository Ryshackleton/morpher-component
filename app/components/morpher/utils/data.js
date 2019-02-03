import { groupBy } from 'lodash';

export const groupedDataProps = (filtered, seriesField) => {
  const bySeries = seriesField
    ? groupBy(filtered, seriesField)
    : { all_data: filtered };

  return {
    bySeries,
    seriesKeys: Object.keys(bySeries),
  };
};

export const createMorphableIds = (data = []) => {
  return data.map((datum, index) => {
    return {
      ...datum,
      morphableId: index,
    };
  });
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
