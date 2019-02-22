import { csv } from 'd3';
import config from '../../app.config';
import { convertStringsToNumbersFunction } from '../utils';

const { PATH_TO_DIST_DATA } = config;

export default async function () {
  const data = await csv(`${PATH_TO_DIST_DATA}/police_shooting_data.csv`);

  const numericKeyNames = ['age', 'loc_id', 'location_parent_id'];
  return data.map(convertStringsToNumbersFunction(numericKeyNames))
    .map((datum) => {
      return {
        ...datum,
        date: new Date(datum.date),
      };
    });
}
