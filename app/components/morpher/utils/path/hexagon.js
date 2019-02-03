import { combine, splitPathString } from 'flubber';
import { select } from 'd3';
import { removeNodeIfPathIsInvalid, validateArguments } from './util';
import { defaults } from '../../constants';

const cosPiOver6 = Math.cos(Math.PI / 6);
const sinPiOver6 = Math.sin(Math.PI / 6);
function hexagon(x, y, r) {
  const cosPiOver6TimesR = cosPiOver6 * r;
  const sinPiOver6TimesR = sinPiOver6 * r;
  const x1 = x;
  const y1 = y - r;
  const x2 = x + cosPiOver6TimesR;
  const y2 = y - sinPiOver6TimesR;
  const x3 = x + cosPiOver6TimesR;
  const y3 = y + sinPiOver6TimesR;
  const x4 = x;
  const y4 = y + r;
  const x5 = x - cosPiOver6TimesR;
  const y5 = y + sinPiOver6TimesR;
  const x6 = x - cosPiOver6TimesR;
  const y6 = y - sinPiOver6TimesR;

  return `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} L${x4} ${y4} L${x5} ${y5} L${x6} ${y6}z`;
}

export function hexagonGenerator(chartModel) {
  const {
    xFromId,
    yFromId,
    radiusFromId,
  } = chartModel;

  return function bubbleFromId(id) {
    const [isValid, result] = validateArguments(id, [xFromId, yFromId, radiusFromId]);
    return isValid ? hexagon(...result) : '';
  };
}

export function hexagonInterpolator(chartModel) {
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
    const path = hexagon(...result);
    return removeNodeIfPathIsInvalid(domNode, dAttr, isValid)
      ? combine(
        paths,
        path,
        defaults.FLUBBER_INTERPOLATE_OPTIONS,
      )
      : '';
  };
}
