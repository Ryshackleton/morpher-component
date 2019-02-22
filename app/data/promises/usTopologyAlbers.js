import { json } from 'd3';

export default async function () {
  return json('https://gist.githubusercontent.com/Ryshackleton/b3c0f0fa229c5d32462c9897becdb5f1/raw/56b86a43f10af5382aaf1c2e30e5a338681a699c/usa-topo-fips.json');
}
