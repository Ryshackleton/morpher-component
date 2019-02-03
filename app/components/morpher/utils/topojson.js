import { get, isNil, reduce } from 'lodash';
import { feature } from 'topojson';
import { groupedDataProps } from './data';

export const coordinatesSortedByNumberOfArcs = ({ geometry }) => {
  const { coordinates, type } = geometry;
  return {
    type,
    coordinates: geometry.type === 'MultiPolygon'
      ? coordinates.sort((a, b) => {
        return b[0].length - a[0].length;
      })
      : coordinates,
  };
};

export const buildIdToFeatureMap = ({
  topology,
  dataByLocationId,
  locationIdField,
}) => {
  return reduce(topology.objects, (acc, layer) => {
    return {
      ...acc,
      ...reduce(feature(topology, layer).features, (featureAcc, thisFeature) => {
        const location_id = get(thisFeature, locationIdField)
          || get(thisFeature, ['properties', locationIdField]);
        const thisLocData = get(dataByLocationId, location_id);
        if (thisLocData) {
          thisLocData.forEach((datum) => {
            const { morphableId } = datum;
            if (!isNil(location_id) && !isNil(morphableId)) {
              featureAcc[morphableId] = {
                type: thisFeature.type,
                geometry: {
                  // sort coordinates by number of arcs so the (hopefully) largest polygon
                  // will be first in the array. This is because flubber will target the first
                  // path in the list to tarnsition to, so we don't want to transition to a
                  // geometry that is very small, then have the larger one appear at the end
                  ...coordinatesSortedByNumberOfArcs(thisFeature),
                },
                properties: {
                  ...thisFeature.properties,
                  [locationIdField]: location_id,
                  morphableId,
                },
              };
            }
          });
        }
        return featureAcc;
      }, {}),
    };
  }, {});
};

export const createIdTopoJsonFeatureMap = (data, topology, locationIdField) => {
  if (!topology || !locationIdField) {
    return undefined;
  }
  /** build a map of morphable id -> feature in the topojson */
  /** figure out the location id series */
  const { bySeries: dataByLocationId } = groupedDataProps(data, locationIdField);
  return buildIdToFeatureMap({
    topology,
    dataByLocationId,
    locationIdField,
  });
};
