import { debounce } from 'lodash';
import elementResizeDetectorMaker from 'element-resize-detector';
import D3Component from 'idyll-d3-component';
import buildChartModel from './chartModel';
import * as render from './render';
import {
  createIdTopoJsonFeatureMap,
  updatedStateFromChartRequest,
  updatedProjection,
} from './utils';

import './scss/morpher.scss';

const defaultMargins = {
  margin: {
    top: 40,
    left: 20,
    bottom: 20,
    right: 20,
  },
  axesMargin: {
    top: 50,
    left: 50,
    bottom: 50,
    right: 50,
  },
};

/**
 * A component that renders a variety of different chart types and transitions between
 * the different chart types by re-shaping the individual chart elements to fit the new shape
 */
class Morpher extends D3Component {
  /**
   * Initializes the Morphable component
   * 1) Adds unique id's to all of the data points and stores in chartState
   * 2) Builds a map of id ('morphableId') -> topojson feature
   * 3) Renders the initial SVG on the dom, creating the initial structure,
   *    as well as an element resize detector to detect changes to the parent node's size
   * @param parentNode
   * @param props.data {array} - an array of data objects
   * @param props.topology {object} - (optional) GEOJSON topology containing location id's
   *        in the feature.properties
   * @param props.locationIdField {string} - (optional) - the property name of the location id field
   *        on the feature.properties object in the topology object
   * @params props.chartRequest {object} - an initial configuration for the chart, passed to update()
   * @return {undefined}
   */
  initialize(parentNode, props) {
    /* give every datum a unique id */
    const morphableRawData = props.data.map(
      (datum, index) => { return { ...datum, morphableId: index }; },
    );

    const {
      axesMargin = defaultMargins.axesMargin,
      margin = defaultMargins.margin,
      locationIdField = 'location_id',
      topology,
      hideFeaturesWithNoData = true,
    } = props;

    /* map of morphable id -> GeoJSON feature for quick lookup, as well as creating some
       dummy objects with no data to enable rendering of all geometries if requested by setting
       props.hideFeaturesWithNoData to false */
    const {
      // array of features to pass into projection
      features,
      // map of morphableId -> feature for quick lookup
      idFeatureMap,
      // array of dummy objects containing { morphableId, [locationIdField] }
      // representing map features with no data
      dummyMorphableData,
    } = createIdTopoJsonFeatureMap(
      morphableRawData,
      topology,
      locationIdField,
      hideFeaturesWithNoData,
    );

    /* chart state initially contains the id'd data, and a map of id -> topojson features */
    this.chartState = {
      axesMargin,
      // inner chart dimensions to detect when projection should update (initialize to zero)
      chartWidth: 0,
      chartHeight: 0,
      dummyMorphableData,
      features,
      // boolean to determine whether map features lacking data should be displayed
      hideFeaturesWithNoData,
      idFeatureMap,
      margin,
      // the raw data, with morphableId
      morphableRawData,
    };

    /* build the svg DOM */
    this.dom = render.initialSVG(parentNode);
    render.updateSVGTransforms(this.dom, margin, axesMargin);

    /* initial update */
    this.updateChartState(props);

    /* setup resize listener to debounce the morph method and trigger a resize */
    const doResize = true;
    const debouncedMorph = debounce(
      this.morph.bind(this, doResize),
      300,
      { trailing: true },
    );
    /* element resize triggers morph upon creation */
    elementResizeDetectorMaker({ strategy: 'scroll' })
      .listenTo(parentNode, debouncedMorph); // morph and trigger resize
  }

  /**
   * Morphs from the existing chart shape to the shape configured in this.chartState.chartRequest
   * 1) Updates the sizing of the chart to handle any sizing changes,
   * 2) Rebuilds the chart model based on the this.chartState.chartRequest,
   * 3) Re-renders axes, the chart, and any legends per the chart request
   * @param resize {boolean} - resize before updating if true
   * @return {undefined}
   */
  morph(resize = false) {
    if (resize) {
      this.resize();
    }

    /* Use the new chart state to morph the chart model (map, scatter, bar, etc) */
    this.chartState.chartModel = buildChartModel(this.chartState);

    /* re-render everything, morphing previous chart shapes from to the new shapes */
    render.axes(this.dom, this.chartState);
    render.chart(this.dom, this.chartState);
    render.legends(this.dom, this.chartState);
  }

  /**
   * Updates the svg transforms and the map projection based on the new size of the chart,
   * and mutates this.chartState props dealing with layout such as:
   * chartWidth
   * chartHeight
   * projection - (map projection)
   * xScaleRange
   * yScaleRange
   */
  resize() {
    const {
      chartWidth: oldWidth,
      chartHeight: oldHeight,
      features,
      margin,
      axesMargin,
      idFeatureMap,
      morphableRawData,
      projection: oldProjection,
    } = this.chartState;

    /* Get the axis ranges in pixel space */
    const {
      chartWidth,
      chartHeight,
      ...xyAxisRanges
    } = render.getXYPixelRangesFromSVG(this.dom.svg, margin, axesMargin)

    /* Update the svg group transforms */
    render.updateSVGTransforms(this.dom, margin, axesMargin);

    /* IF the chart dimensions have changed, update map projection */
    const { xFromId, yFromId, projection } = (chartWidth === oldWidth && chartHeight === oldHeight)
      ? oldProjection
      : updatedProjection({
        chartWidth,
        chartHeight,
        data: morphableRawData,
        features,
        idFeatureMap,
        morphablesDomGroup: this.dom.morphablesGroup,
      });

    /* Update state */
    this.chartState = {
      ...this.chartState,
      ...xyAxisRanges,
      axesMargin,
      chartWidth,
      chartHeight,
      idFeatureMap,
      margin,
      morphableRawData,
      projection,
      xFromId,
      yFromId,
    };
  }

  /**
   * From the props.chartRequest object:
   * 1) filter the data,
   * 2) determine any series information and group data accordingly
   * 3) compute the requested color scale
   * @param props - the chart request object containing the chart spec
   * @param props.chartState - the chart state object containing all relevant props
   * @param props.chartState.chartRequest {object} containing the chart spec for the new chart to build
   * @return {boolean} true if chart state is valid and can be updated
   */
  updateChartState(props) {
    const { chartRequest } = props;
    if (!this.chartState || !chartRequest) {
      return false;
    }

    /* filter the data based on the new chartRequest and compute shared props like color scales */
    this.chartState = updatedStateFromChartRequest(
      this.dom,
      {
        ...this.chartState,
        chartRequest,
      },
    );

    return true;
  }

  /**
   * Overloaded from D3Component to hook into React's component update cycle
   * @param props {object} - props passed from Idyll markdown
   * @param oldProps - passed by Idyll, not used
   */
  update(props = this.chartState /* , oldProps */) {
    if (this.updateChartState(props)) {
      /* compute the chart model and morph to the next chart shape */
      this.morph();
    }
  }
}

export default Morpher;
