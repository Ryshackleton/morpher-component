import { presimplify } from 'topojson';
import { json } from 'd3';
import processTopojson from '../processTopojson';

import config from '../../app.config';

const { PATH_TO_DIST_DATA } = config;

export default async function () {
  const topojson = await json(`${PATH_TO_DIST_DATA}/world-topo-no-disputes.json`);

  const includeLayers = ['admin0'];
  const topology = presimplify(topojson);
  processTopojson(topology, includeLayers); // mutates topology
  return topology;
}
