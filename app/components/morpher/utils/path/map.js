import {
  combine,
  interpolate,
  separate,
  splitPathString,
} from 'flubber';
import { select } from 'd3';
import { isNil } from 'lodash';
import { removeNodeIfPathIsInvalid } from './util';
import { defaults } from '../../constants';

export function mapGenerator(chartModel) {
  return function mapPathGenerator(id) {
    const path = chartModel.pathFromId(id);
    return isNil(path) ? '' : path;
  };
}

export function mapInterpolator({ pathFromId }) {
  return function interpolator(id) {
    const path = pathFromId(id);
    const domNode = select(this);
    const dAttr = domNode.attr('d');
    if (!removeNodeIfPathIsInvalid(domNode, dAttr, !isNil(path))) {
      return '';
    }
    try {
      const oldPaths = splitPathString(dAttr);
      const newPaths = splitPathString(path);
      if (oldPaths.length === 1 && newPaths.length < defaults.MAX_NUMBER_OF_PIECES_IN_PATH) {
        return separate(
          dAttr,
          newPaths,
          defaults.FLUBBER_INTERPOLATE_OPTIONS,
        );
      }
      if (newPaths.length === 1) {
        return combine(
          oldPaths.slice(0, defaults.MAX_NUMBER_OF_PIECES_IN_PATH),
          path,
          defaults.FLUBBER_INTERPOLATE_OPTIONS,
        );
      }
    } catch (e) {
      return interpolate(dAttr, path, defaults.FLUBBER_INTERPOLATE_OPTIONS);
    }
    return interpolate(dAttr, path, defaults.FLUBBER_INTERPOLATE_OPTIONS);
  };
}
