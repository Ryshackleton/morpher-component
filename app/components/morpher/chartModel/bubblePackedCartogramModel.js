import { get, keyBy } from 'lodash';
import { chartShape } from '../constants';
import bubbleCartogramModel from './bubbleCartogramChartModel';
import { forcePackNodesToRadii } from '../utils';

export default function bubblePackedCartogramChartModel(chartState) {
  const {
    radiusFromId,
    dataFiltered: nodes,
    xFromId: xUnpacked,
    yFromId: yUnpacked,
    ...rest
  } = bubbleCartogramModel(chartState);

  const packedNodesMap = keyBy(forcePackNodesToRadii({
    maxTicks: 300,
    nodes,
    radiusAccessor: (datum) => { return radiusFromId(datum.morphableId); },
    xAccessor: (datum) => { return xUnpacked(datum.morphableId); },
    yAccessor: (datum) => { return yUnpacked(datum.morphableId); },
  }), 'morphableId');

  const xFromId = (id) => {
    return get(packedNodesMap, [id, 'x']);
  };

  const yFromId = (id) => {
    return get(packedNodesMap, [id, 'y']);
  };

  return {
    ...rest,
    dataFiltered: nodes,
    shape: chartShape.BUBBLE_PACKED_CARTOGRAM,
    xFromId,
    yFromId,
    radiusFromId,
  };
}
