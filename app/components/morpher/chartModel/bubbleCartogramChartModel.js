import { chartShape } from '../constants';
import mapChartModel from './mapChartModel';

export default function bubbleCartogramChartModel(chartState) {
  return {
    ...mapChartModel(chartState),
    shape: chartShape.BUBBLE_CARTOGRAM,
  };
}
