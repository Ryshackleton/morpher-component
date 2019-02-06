import { keyBy } from 'lodash';
import { chartShape } from '../constants';

export default function mapChartModel(chartState) {
  const {
    dataFiltered,
    idFeatureMap,
    projection,
    ...rest
  } = chartState;

  /** main function to get geo path from a given morphable id in the projection */
  const pathFromId = (id) => { return projection.path(idFeatureMap[id]); };

  /** return the maps that get paths morphable id's */
  return {
    ...rest,
    shape: chartShape.MAP,
    dataFiltered,
    dataFilteredById: keyBy(dataFiltered, 'morphableId'),
    pathFromId,
    idFeatureMap,
    projection,
  };
}
