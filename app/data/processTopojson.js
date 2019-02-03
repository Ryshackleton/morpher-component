import { reduce } from 'lodash';

export default function processTopojson(topology) {
  const previousDisputedLayer = {};

  topology.objects = reduce(topology.objects, (results, value, key) => {
    const isDisputedLayer = key.includes('disputes');

    value.geometries = value.geometries.reduce((geometries, feature, index) => {
      const { disputes = [], loc_id, admin_id } = feature.properties;
      const location_id = (admin_id || loc_id) || {};
      const geomKey = `key-${index + 1}`;
      let properties;

      if (isDisputedLayer) {
        properties = {
          key: geomKey,
          loc_id: (location_id) || previousDisputedLayer[loc_id].loc_id,
          disputes: disputes.map(Number),
        };

        previousDisputedLayer[loc_id] = properties;
      } else if (key === 'admin0' || location_id) {
        properties = {
          key: geomKey,
          loc_id,
        };
      }

      if (properties) {
        geometries.push({
          ...feature,
          properties,
        });
      }

      return geometries;
    }, []);

    if (value.geometries.length) {
      results[key] = value;
    }

    return results;
  }, {});
}
