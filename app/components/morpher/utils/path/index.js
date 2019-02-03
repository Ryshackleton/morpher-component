import { noop } from 'lodash';
import { chartShape } from '../../constants';
import { bubbleInterpolator, bubbleGenerator } from './bubble';
import { rectangleGenerator, rectangleInterpolator } from './rectangle';
import { mapGenerator, mapInterpolator } from './map';
import { hexagonGenerator, hexagonInterpolator } from './hexagon';

const generators = {
  [chartShape.BUBBLE_SCATTER]: bubbleGenerator,
  [chartShape.BAR_HORIZONTAL]: rectangleGenerator,
  [chartShape.BAR_VERTICAL]: rectangleGenerator,
  [chartShape.MAP]: mapGenerator,
  [chartShape.BUBBLE_CARTOGRAM]: bubbleGenerator,
  [chartShape.BUBBLE_PACKED_CARTOGRAM]: bubbleGenerator,
  [chartShape.HEXAGONAL_CARTOGRAM]: hexagonGenerator,
  [chartShape.NONE]: noop,
};

const interpolators = {
  [chartShape.BUBBLE_SCATTER]: bubbleInterpolator,
  [chartShape.BAR_HORIZONTAL]: rectangleInterpolator,
  [chartShape.BAR_VERTICAL]: rectangleInterpolator,
  [chartShape.MAP]: mapInterpolator,
  [chartShape.BUBBLE_CARTOGRAM]: bubbleInterpolator,
  [chartShape.BUBBLE_PACKED_CARTOGRAM]: bubbleInterpolator,
  [chartShape.HEXAGONAL_CARTOGRAM]: hexagonInterpolator,
  [chartShape.NONE]: noop,
};

export function pathGenerator(shape, chartModel) {
  return generators[shape]
    ? generators[shape](chartModel)
    : noop;
}

export function pathInterpolator(shape, chartModel) {
  return interpolators[shape]
    ? interpolators[shape](chartModel)
    : noop;
}

