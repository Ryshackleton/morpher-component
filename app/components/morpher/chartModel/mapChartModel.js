import {
  get, isEmpty, isNil, keyBy, reduce,
} from 'lodash';
import {
  extent, scaleLinear,
} from 'd3';
import { values } from '../utils';
import { chartShape } from '../constants';

export default function mapChartModel(chartState) {
  const {
    chartRequest: {
      radiusRange = [2, 20],
      radiusField,
    },
    colorScale,
    colorValueFromId,
    colorFromId,
    dataFiltered,
    dataFilteredById,
    idFeatureMap,
    projection,
    seriesKeys,
  } = chartState;

  /** main function to get geo path from a given morphable id in the projection */
  const pathFromId = (id) => { return projection.path(idFeatureMap[id]); };

  /** pre compute id -> centroids for tweening efficiency */
  const idCentroidMap = reduce(dataFiltered, (acc, datum) => {
    acc[datum.morphableId] = projection.path.centroid(idFeatureMap[datum.morphableId]);
    return acc;
  }, {});
  const xFromId = (id) => {
    return idCentroidMap[id] ? idCentroidMap[id][0] : 0;
  };
  const yFromId = (id) => {
    return idCentroidMap[id] ? idCentroidMap[id][1] : 0;
  };

  /** pre-compute morphableId -> radius, radius value */
  const radiusUndefined = isEmpty(radiusField) || isNil(radiusField);
  const radiusScale = scaleLinear()
    .domain(extent(values(dataFiltered, radiusField)))
    .range(radiusRange);
  const radiusValueFromId = (id) => {
    return get(dataFilteredById, [id, radiusField], 0);
  };
  const idRadiusMap = reduce(dataFiltered, (acc, datum) => {
    if (!radiusUndefined) {
      acc[datum.morphableId] = radiusScale(radiusValueFromId(datum.morphableId));
    }
    return acc;
  }, {});

  const radiusFromId = (id) => { return idRadiusMap[id]; };

  /** return the maps that get paths, colors from morphable id's */
  return {
    shape: chartShape.MAP,
    pathFromId,
    xFromId,
    yFromId,
    radiusFromId,
    radiusValueFromId,
    colorScale,
    colorValueFromId,
    colorFromId,
    seriesKeys,
    dataFiltered,
    dataFilteredById: keyBy(dataFiltered, 'morphableId'),
  };
}
