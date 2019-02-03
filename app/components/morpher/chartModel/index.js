import { chartShape } from '../constants';
import bubbleChartModel from './bubbleChartModel';
import barChartModel from './barChartModel';
import mapChartModel from './mapChartModel';
import bubbleCartogramModel from './bubbleCartogramChartModel';
import bubblePackedCartogramModel from './bubblePackedCartogramModel';
import hexagonalCartogramModel from './hexagonalCartogramModel';

const chartModelers = {
  [chartShape.BUBBLE_SCATTER]: bubbleChartModel,
  [chartShape.BAR_HORIZONTAL]: barChartModel,
  [chartShape.BAR_VERTICAL]: barChartModel,
  [chartShape.MAP]: mapChartModel,
  [chartShape.BUBBLE_CARTOGRAM]: bubbleCartogramModel,
  [chartShape.BUBBLE_PACKED_CARTOGRAM]: bubblePackedCartogramModel,
  [chartShape.HEXAGONAL_CARTOGRAM]: hexagonalCartogramModel,
  [chartShape.NONE]: () => { return { shape: chartShape.NONE }; },
};

export default function buildChartModel(chartState) {
  return chartModelers[chartState.chartRequest.shape](chartState);
}
