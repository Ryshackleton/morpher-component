import {
  get, isEmpty, isNil, reduce,
} from 'lodash';
import {
  extent, scaleLinear, zoomIdentity,
} from 'd3';
import {
  buildProjectionAndZoom,
  calcViewbox,
  values,
} from '../utils';
import { chartShape } from '../constants';

export default function mapChartModel(chartState) {
  const {
    dataRequest: {
      radiusField,
    },
    chartRequest: {
      radiusRange = [2, 20],
    },
    colorScale,
    colorValueFromId,
    colorFromId,
    dataFiltered,
    dataFilteredById,
    idFeatureMap,
    morphablesDomGroup,
    seriesKeys,
    xScaleRange,
    yScaleRange,
  } = chartState;


  const height = yScaleRange[0] - yScaleRange[1];
  const width = xScaleRange[1] - xScaleRange[0];

  const dataWithFeatures = [];
  const dataIdsWithFeatures = [];
  const features = dataFiltered.reduce((featureAcc, datum) => {
    const { morphableId } = datum;
    if (!isNil(idFeatureMap[morphableId])) {
      dataIdsWithFeatures.push(morphableId);
      dataWithFeatures.push(datum);
      featureAcc.push(idFeatureMap[morphableId]);
    }
    return featureAcc;
  }, []);

  /** build and scale the projection from the width, height, and the selected features */
  const {
    bounds: mapBounds,
    projection,
    zoomed,
  } = buildProjectionAndZoom({
    features, width, height,
  });
  /** call zoomed on the morphable dom group to handle scaling/simplification of features */
  morphablesDomGroup
    .call(
      zoomed.transform,
      zoomIdentity.translate(
        projection.translate[0],
        projection.translate[1],
      ).scale(projection.scale),
    )
    .call(zoomed);

  /** main function to get geo path from a given morphable id in the projection */
  const pathFromId = (id) => { return projection.path(idFeatureMap[id]); };

  /** pre compute id -> centroids for tweening efficiency */
  // const zoomTransform = morphablesDomGroup.nodes()[0].__zoom; // hack to get the current zoom transform from the dom
  const idCentroidMap = reduce(dataWithFeatures, (acc, datum) => {
    // TODO: figure out a way around the computationally expensive method: path.centroid()
    // TODO:  could use something like the method below, but need to work out the correct projection transform for a point
    // const { center } = calcViewbox({ projection, features: [idFeatureMap[datum.morphableId]] });
    // acc[datum.morphableId] = zoomTransform.invert(center);
    acc[datum.morphableId] = projection.path.centroid(idFeatureMap[datum.morphableId]);
    return acc;
  }, {});
  const xFromId = (id) => {
    return idCentroidMap[id] ? idCentroidMap[id][0] : 0;
  };
  const yFromId = (id) => {
    return idCentroidMap[id] ? idCentroidMap[id][1] : 0;
  };

  /** pre-compute morphableId -> radius, radius value */
  const radiusUndefined = isEmpty(radiusField) || isNil(radiusField);
  const radiusScale = scaleLinear()
    .domain(extent(values(dataWithFeatures, radiusField)))
    .range(radiusRange);
  const radiusValueFromId = (id) => {
    return get(dataFilteredById, [id, radiusField], 0);
  };
  const idRadiusMap = reduce(dataWithFeatures, (acc, datum) => {
    if (radiusUndefined) {
      const { bounds } = calcViewbox({ projection, features: [idFeatureMap[datum.morphableId]] });
      const boxWidth = bounds[1][0] - bounds[0][0];
      const boxHeight = bounds[1][1] - bounds[0][1];
      acc[datum.morphableId] = (boxWidth + boxHeight) * 0.5;
    }
    acc[datum.morphableId] = radiusScale(radiusValueFromId(datum.morphableId));
    return acc;
  }, {});

  const radiusFromId = (id) => { return idRadiusMap[id]; };

  /** return the maps that get paths, colors from morphable id's */
  return {
    shape: chartShape.MAP,
    mapBounds,
    pathFromId,
    xFromId,
    yFromId,
    radiusFromId,
    radiusValueFromId,
    colorScale,
    colorValueFromId,
    colorFromId,
    seriesKeys,
    dataFiltered: dataWithFeatures,
    filteredDataIds: dataIdsWithFeatures,
  };
}
