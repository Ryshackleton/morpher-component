import { get, isNaN, isNil, values } from 'lodash';
import { chartShape } from '../constants';
import mapChartModel from './mapChartModel';
import { Layout, Point } from '../lib/HexLib';

// basic distance function
function distanceBetweenTwoPoints(p0, p1) {
  return Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y));
}

// crude string hashing function for cubic hexagonal coordinate values
function cubicHexHash(hex) {
  return `${hex.q}_${hex.r}_${hex.s}`;
}

const hexagonSideIndices = [0, 1, 2, 3, 4, 5];

// uses a crude brute force algorithm to convert geographic centroids to hexagonal gridded centroids
// with much help from: https://www.redblobgames.com/grids/hexagons/implementation.html
export default function hexagonalPackedCartogramtModel(chartState) {
  const {
    chartRequest: {
      hexRadius: radius = 5,
    },
  } = chartState;
  const {
    dataFilteredById: oldDataById,
    dataFiltered: nodes,
    xFromId: xMapCentroid,
    yFromId: yMapCentroid,
    ...rest
  } = mapChartModel(chartState);

  // map of morphableId -> { morphableId, x, y } to construct xFromId() and yFromId()
  const idCentroidMap = {};

  // nodes to "hex", or place into uniquely into the hexagonal grid
  const unHexedNodes = nodes.reduce((acc, { morphableId }) => {
    const x = xMapCentroid(morphableId);
    const y = yMapCentroid(morphableId);
    if (!isNil(x) && !isNaN(x) && !isNil(y) && !isNaN(y)) {
      acc.push({ morphableId, x, y });
    }
    return acc;
  }, [])
    // sort by ascending x so we proceed in a consistent manner across the nodes
    .sort((a, b) => { return a.x - b.x; });

  // grid construct with origin with "size" (hexagon dimensions), and origin at (0,0)
  const hexagonalGrid = new Layout(Layout.pointy, new Point(radius, radius), new Point(0, 0));

  // hash of hexagonal coordinates (cubic) that have already been hexed
  // see https://www.redblobgames.com/grids/hexagons/implementation.html for description of cubic
  // coordinates
  const filledHexagonHashes = {};

  // shift off nodes as a hex cell is found
  // TODO: improve this algorithm to use the neighbor topology and directionality of neighbors to
  // TODO:   find the optimal side to place each hexagon on
  while (unHexedNodes.length) {
    const node = unHexedNodes.shift();
    let targetHex = hexagonalGrid.pixelToHex(node).round();

    // search for an un-filled node
    /* eslint-disable no-constant-condition */
    while (true) { /* eslint-enable no-constant-condition */
      const hash = cubicHexHash(targetHex);
      const targetHexPoint = hexagonalGrid.hexToPixel(targetHex);
      // if the target hexagon is un-filled, add it to idCentroidMap and break out
      if (!filledHexagonHashes[hash]) {
        filledHexagonHashes[hash] = 1;
        idCentroidMap[node.morphableId] = targetHexPoint;
        break;
      }
      // otherwise, make the target the next closest un filled hex centroid
      let minDist = Infinity;
      /* eslint-disable no-loop-func */
      targetHex = hexagonSideIndices.reduce((closestHex, direction) => { /* eslint-enable no-loop-func */
        const adjHex = targetHex.neighbor(direction);
        const adjPoint = hexagonalGrid.hexToPixel(adjHex);
        const distance = distanceBetweenTwoPoints(targetHexPoint, adjPoint);

        if (distance < minDist && !filledHexagonHashes[cubicHexHash(adjHex)]) {
          minDist = distance;
          return adjHex;
        }
        return closestHex;
      }, targetHex.neighbor(Math.floor(Math.random() * 5)));
    }
  }

  const xFromId = (id) => {
    return get(idCentroidMap, [id, 'x']);
  };

  const yFromId = (id) => {
    return get(idCentroidMap, [id, 'y']);
  };

  const radiusFromId = () => { return radius; };

  const dataFilteredById = Object.keys(idCentroidMap).reduce((acc, morphableId) => {
    acc[morphableId] = oldDataById[morphableId];
    return acc;
  }, {});

  return {
    ...rest,
    dataFilteredById,
    dataFiltered: values(dataFilteredById),
    shape: chartShape.HEXAGONAL_CARTOGRAM,
    xFromId,
    yFromId,
    radiusFromId,
  };
}
