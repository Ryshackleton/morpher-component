import {
  get, isEmpty, isNil, keyBy, reduce,
} from 'lodash';
import { extent, scaleLinear } from 'd3';
import { chartShape } from '../constants';
import { dataWithValidGetterFunctions, values } from '../utils';

export default function bubbleCartogramChartModel(chartState, computeRadii = true) {
  const {
    chartRequest: {
      radiusRange = [2, 20],
      radiusField,
    },
    dataFiltered,
    dataFilteredById,
    xFromId,
    yFromId,
    ...rest
  } = chartState;

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
