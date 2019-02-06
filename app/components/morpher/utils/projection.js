import {
  event, geoIdentity, geoPath, geoTransform, zoom, zoomIdentity,
} from 'd3';

/**
 * Calculate bounding box for features
 * @param {Array} features - GeoJSON features
 * @return {Array} - d3 bounding box
 * @access protected
 */
function calcBounds({ projection, features }) {
  return projection.bounds({
    type: 'FeatureCollection',
    features,
  });
}

/**
 * Calculate center from bounds OR scale AND translate
 * @param {Object} options
 * @param {Number} [options.width=settings.width]
 * @param {Number} [options.height=settings.height]
 * @param {Array} [options.bounds]
 * @param {Number} [options.scale]
 * @param {Number} [options.translate]
 * @return {Array}
 * @access protected
 */
export function calcCenter({
  width,
  height,
  bounds,
  scale,
  translate,
}) {
  if (bounds) {
    return [
      (bounds[1][0] + bounds[0][0]),
      (bounds[1][1] + bounds[0][1]),
    ];
  }

  if (scale && translate) {
    return [
      (width - (translate[0] * 2)) / scale,
      (height - (translate[1] * 2)) / scale,
    ];
  }

  return [0, 0];
}

/**
 * Calculate translate from center AND scale
 * @param {Object} options
 * @param {Number} options.scale
 * @param {Number} options.translate
 * @param {Number} [options.width=settings.width]
 * @param {Number} [options.height=settings.height]
 * @return {Array}
 * @access protected
 */
function calcTranslate({
  width,
  height,
  scale,
  center: mapCenter,
}) {
  return [(width - (scale * mapCenter[0])) / 2, (height - (scale * mapCenter[1])) / 2];
}

/**
 * Calculate view box for chart layers
 * @param {Array} layers - Chart layers
 * @return {Object}
 * @access protected
 */
export function calcViewbox({ projection, features }) {
  const bounds = calcBounds({ projection, features });
  return { bounds, center: calcCenter({ bounds }) };
}

export function buildProjectionAndZoom({ features, width, height }) {
  const projection = {
    area: 1,
    scale: 1,
    translate: [0, 0],
    transform: geoIdentity(),
    bounds: geoPath()
      .projection(geoTransform({
        point(x, y, z) {
          this.stream.point(x, y, z);
        },
      })).bounds,
    simplify: geoTransform({
      point(x, y, z) {
        if (z === undefined || z >= projection.area) {
          this.stream.point(
            (x * projection.scale) + projection.translate[0],
            (y * projection.scale) + projection.translate[1],
            z,
          );
        }
      },
    }),
    path: geoPath().projection({
      stream(s) {
        return projection.simplify.stream(projection.transform.stream(s));
      },
    }),
  };

  const bounds = calcBounds({ projection, features });

  projection.scale = 0.95 / Math.max(
    (bounds[1][0] - bounds[0][0]) / width,
    (bounds[1][1] - bounds[0][1]) / height,
  );
  projection.translate = calcTranslate({
    width, height, scale: projection.scale, center: calcCenter({ bounds }),
  });

  const zoomed = zoom()
    .on('zoom', () => {
      const { x, y, k } = event.transform;

      projection.scale = k;
      projection.translate = [x, y];
      projection.area = 1 / projection.scale / projection.scale;
    })
    .scaleExtent([0.3, 50]); // min/max zoom extent, probably not really necessary here, but useful if mouse zooming is ever enabled

  projection.transform.clipExtent([[-5, -5], [(width + 10), (height + 10)]]);

  return {
    bounds,
    projection,
    zoomed,
  };
}

export function updatedProjection({
  chartWidth: width,
  chartHeight: height,
  features,
  morphablesDomGroup,
}) {
  /** build and scale the projection from the width, height, and the selected features */
  const {
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

  return projection;
}
