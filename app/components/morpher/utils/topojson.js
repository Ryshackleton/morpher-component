import { get, isNil, reduce, toArray } from 'lodash';
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
  maxMorphableId,
  hideFeaturesWithNoData,
}) => {
  if (!topology && !topology.objects) {
    return {};
  }
  let newMorphableId = maxMorphableId;
  const dummyMorphableData = [];
  const idFeatureMap = reduce(topology.objects, (acc, layer) => {
    return {
      ...acc,
      ...reduce(feature(topology, layer).features, (featureAcc, thisFeature) => {
        // get the location id from the feature
        const location_id = get(thisFeature, locationIdField)
          || get(thisFeature, ['properties', locationIdField]);
        // if there's no location id, we have no way to reference this feature
        if (isNil(location_id)) {
          return featureAcc;
        }

        const featureWithLongestPolygonAsFirstInArray = {
          type: thisFeature.type,
          geometry: {
            // sort coordinate arrays by number of arcs so the (hopefully) largest polygon
            // will be first in the array. This is because flubber will target the first
            // path in the list to tarnsition to, so we don't want to transition to a
            // geometry that is very small, then have the larger one appear at the end
            ...coordinatesSortedByNumberOfArcs(thisFeature),
          },
        };

        // get the array of raw morphable data that corresponds with this feature
        const thisLocData = get(dataByLocationId, location_id);
        if (thisLocData) {
          // map each datum's id to this feature
          thisLocData.forEach(({ morphableId }) => {
            featureAcc[morphableId] = {
              ...featureWithLongestPolygonAsFirstInArray,
              properties: {
                ...thisFeature.properties,
                [locationIdField]: location_id,
                morphableId,
              },
            };
          });
        } else if (!hideFeaturesWithNoData) {
          // no data corresponds to this feature, so create a dummy data object that maps
          // to this feature
          newMorphableId += 1;
          dummyMorphableData.push({
            morphableId: newMorphableId,
            [locationIdField]: location_id,
          });
          featureAcc[newMorphableId] = {
            ...featureWithLongestPolygonAsFirstInArray,
            properties: {
              ...thisFeature.properties,
              [locationIdField]: location_id,
              morphableId: newMorphableId,
            },
          };
        }
        return featureAcc;
      }, {}),
    };
  }, {});
  return { features: toArray(idFeatureMap), idFeatureMap, dummyMorphableData };
};

export const createIdTopoJsonFeatureMap = (
  data, topology, locationIdField, hideFeaturesWithNoData,
) => {
  if (!topology || !locationIdField) {
    return undefined;
  }

  const maxMorphableId = data.length - 1;

  /** build a map of morphable id -> feature in the topojson */
  /** figure out the location id series */
  const { bySeries: dataByLocationId } = groupedDataProps(data, locationIdField);
  return buildIdToFeatureMap({
    topology,
    dataByLocationId,
    locationIdField,
    maxMorphableId,
    hideFeaturesWithNoData,
  });
};
