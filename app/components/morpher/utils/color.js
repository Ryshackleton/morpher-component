import { get } from 'lodash';
import * as chromatic from 'd3-scale-chromatic';
import { extent, scaleLinear, scaleOrdinal } from 'd3';
import { values } from './data';
import { linspace } from './math';

/**
 * 11 step diverging color scale from ihme-ui
 * take from colorbrewer (http://colorbrewer2.org/)
 */
const colorSteps = [
  '#a50026', // dark red
  '#d73027',
  '#f46d43',
  '#fdae61',
  '#fee090',
  '#ffffbf', // light yellow
  '#e0f3f8',
  '#abd9e9',
  '#74add1',
  '#4575b4',
  '#313695', // dark blue
];

const aVeryLongOrdinalScale = chromatic.schemePaired
  .concat(chromatic.schemeSet3)
  .concat(chromatic.schemePastel2);

/** (modified from IHME-IU)
 * Basic, clamped, linear color scale
 * @param {Array} domain -> [min, max]
 * @returns {*}
 */
export const baseColorScale = (colorArray, domain = [0, 1]) => {
  if (!domain.length) {
    throw Error('color.baseColorScale(): domain must be of length 2');
  }
  return scaleLinear()
    .domain(linspace(...domain, colorArray.length))
    .range(colorArray);
};

export const ordinalColorScale = (colorArray, domain) => {
  const optLengthColors = colorArray.concat(aVeryLongOrdinalScale).slice(0, domain.length);

  return scaleOrdinal()
    .domain(domain)
    .range(optLengthColors);
};

/**
 * returns a d3 color scale
 * @param domain - a 2 element array containing (min,max)
 * @param d3ColorScheme - the name of any d3-scale-chromatic color array:
 *  e.g. 'schemeCategory10' https://github.com/d3/d3-scale-chromatic#schemeCategory10
 *  and  for color scales with variable array lengths like ths one
 *  (https://github.com/d3/d3-scale-chromatic#schemeBrBG), you can refer to them like:
 *  'schemeBrBG[9]', where 9 is the number of color stops from 3-9
 * @return {function} linear d3 color scale
 */
export function getColorScale(colorScaleType, domain, d3ColorScheme) {
  switch (colorScaleType) {
    case ('scaleOrdinal'):
      return ordinalColorScale(
        get(chromatic, d3ColorScheme, aVeryLongOrdinalScale),
        domain,
      );
    case ('scaleLinear'):
    default:
      return baseColorScale(
        get(chromatic, d3ColorScheme, colorSteps),
        domain,
      );
  }
}

export const colorScaleProps = (props, seriesKeys, filtered, filteredById) => {
  const {
    dataRequest: {
      seriesField,
      colorField,
    },
    chartRequest: {
      colorScaleD3Name,
    },
  } = props;

  const colorScale = (colorField === seriesField)
    ? getColorScale('scaleOrdinal', seriesKeys, colorScaleD3Name)
    : getColorScale('scaleLinear', extent(values(filtered, colorField)), colorScaleD3Name);

  const colorValueFromId = (id) => {
    return get(filteredById, [id, colorField]);
  };

  const colorFromId = (id) => {
    return colorScale(colorValueFromId(id));
  };

  return {
    colorScale,
    colorValueFromId,
    colorFromId,
  };
};
