import {
  get, isEmpty, isNil, keyBy, reduce,
} from 'lodash';
import { extent, scaleLinear } from 'd3';
import { chartShape } from '../constants';
import mapChartModel from './mapChartModel';
import { dataWithValidGetterFunctions, values } from '../utils';

export default function bubbleCartogramChartModel(chartState, computeRadii = true) {
  const {
    chartRequest: {
      radiusRange = [2, 20],
      radiusField,
    },
    dataFiltered,
    dataFilteredById,
    projection,
    idFeatureMap,
    ...rest
  } = mapChartModel(chartState);

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

  let radiusFromId;
  const functionsThatShouldReturnNumbers = [xFromId, yFromId];
  if (computeRadii) {
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

    radiusFromId = (id) => { return idRadiusMap[id]; };

    functionsThatShouldReturnNumbers.push(radiusFromId);
  }

  const validData = dataWithValidGetterFunctions(dataFiltered, functionsThatShouldReturnNumbers);

  return {
    ...rest,
    shape: chartShape.BUBBLE_CARTOGRAM,
    xFromId,
    yFromId,
    radiusFromId,
    dataFiltered: validData,
    dataFilteredById: keyBy(validData, 'morphableId'),
  };
}
