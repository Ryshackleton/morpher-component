import { select } from 'd3';
import { combine, splitPathString } from 'flubber';
import { removeNodeIfPathIsInvalid, validateArguments } from './util';
import { defaults } from '../../constants';

// modified from flubber's src: https://github.com/veltman/flubber/blob/master/src/shape.js
function circlePath(x, y, radius) {
  /* eslint-disable prefer-template */
  const l = x - radius + ',' + y;
  const r = x + radius + ',' + y;
  const pre = 'A' + radius + ',' + radius + ',0,1,1,';

  return 'M' + l + pre + r + pre + l + 'Z';
  /* eslint-enable prefer-template */
}

export function bubbleGenerator(chartModel) {
  const {
    xFromId,
    yFromId,
    radiusFromId,
  } = chartModel;

  return function bubbleFromId(id) {
    const [isValid, result] = validateArguments(id, [xFromId, yFromId, radiusFromId]);
    const domNode = select(this);
    const path = circlePath(...result);
    return removeNodeIfPathIsInvalid(domNode, path, isValid)
      ? path
      : '';
  };
}

export function bubbleInterpolator(chartModel) {
  const {
    xFromId,
    yFromId,
    radiusFromId,
  } = chartModel;

  return function interpolator(id) {
    const [isValid, result] = validateArguments(id, [xFromId, yFromId, radiusFromId]);
    const domNode = select(this);
    const dAttr = domNode.attr('d');
    const paths = splitPathString(dAttr).slice(0, defaults.MAX_NUMBER_OF_PIECES_IN_PATH);
    const path = circlePath(...result);
    return removeNodeIfPathIsInvalid(domNode, dAttr, isValid)
      ? combine(paths, path, defaults.FLUBBER_INTERPOLATE_OPTIONS)
      : '';
  };
}
