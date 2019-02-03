import { isNil } from 'lodash';
import { csv } from 'd3';
import config from '../../app.config';
import { convertStringsToNumbersFunction } from '../utils';

const { PATH_TO_DIST_DATA } = config;

export default async function () {
  const data = await csv(`${PATH_TO_DIST_DATA}/world-happiness-by-year-with-loc-id.csv`);

  const numericKeyNames = Object.keys(data[0]).filter((name) => {
    return name !== 'country';
  });
  return data.map(convertStringsToNumbersFunction(numericKeyNames))
    .filter((datum) => { return !isNil(datum.loc_id) && datum.year > 2015; });
}
