import { keyBy } from 'lodash';
import { chartShape } from '../constants';
import mapChartModel from './mapChartModel';
import { dataWithValidGetterFunctions } from '../utils';

export default function bubbleCartogramChartModel(chartState) {
  const {
    xFromId,
    yFromId,
    radiusFromId,
    dataFiltered,
    ...rest
  } = mapChartModel(chartState);

  const validData = dataWithValidGetterFunctions(dataFiltered, [xFromId, yFromId, radiusFromId]);

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
