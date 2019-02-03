import { combine, splitPathString } from 'flubber';
import { select } from 'd3';
import { removeNodeIfPathIsInvalid, validateArguments } from './util';
import { defaults } from '../../constants';

// modified from flubber's src: https://github.com/veltman/flubber/blob/master/src/shape.js
export function rectPath(x, y, width, height) {
  const r = x + width;
  const b = y + height;

  /* eslint-disable-next-line prefer-template */
  return 'M' + x + ',' + y + 'L' + r + ',' + y + 'L' + r + ',' + b + 'L' + x + ',' + b + 'Z';
}

export function rectangleGenerator(chartModel) {
  const {
    xFromId,
    yFromId,
    widthFromId,
    heightFromId,
  } = chartModel;

  return function rectFromId(id) {
    const [isValid, result] = validateArguments(id, [xFromId, yFromId, widthFromId, heightFromId]);
    return isValid ? rectPath(...result) : '';
  };
}

export function rectangleInterpolator(chartModel) {
  const {
    xFromId,
    yFromId,
    widthFromId,
    heightFromId,
  } = chartModel;

  return function interpolator(id) {
    const [isValid, result] = validateArguments(id, [xFromId, yFromId, widthFromId, heightFromId]);
    const domNode = select(this);
    const dAttr = domNode.attr('d');
    const paths = splitPathString(dAttr).slice(0, defaults.MAX_NUMBER_OF_PIECES_IN_PATH);
    const path = rectPath(...result);
    return removeNodeIfPathIsInvalid(domNode, dAttr, isValid)
      ? combine(paths, path, defaults.FLUBBER_INTERPOLATE_OPTIONS)
      : '';
  };
}
