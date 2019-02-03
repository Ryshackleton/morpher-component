import elementResizeDetectorMaker from 'element-resize-detector';
import D3Component from 'idyll-d3-component';
import buildChartModel from './chartModel';
import * as render from './render';
import {
  createIdTopoJsonFeatureMap,
  updatedStateFromChartRequest,
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
      margin = defaultMargins.margin,
      axesMargin = defaultMargins.axesMargin,
    } = props;

    /* chart state initially contains the id'd data, and a map of id -> topojson features */
    this.chartState = {
      margin,
      axesMargin,
      idFeatureMap: createIdTopoJsonFeatureMap(
        morphableRawData,
        props.topology,
        props.locationIdField || 'location_id',
      ),
      morphableRawData,
    };

    /* build the svg DOM */
    this.dom = render.initialSVG(parentNode);
    render.updateSVGTransforms(this.dom, margin, axesMargin);
    elementResizeDetectorMaker({ strategy: 'scroll' })
      .listenTo(parentNode, this.morph.bind(this));

    /* initial update */
    this.update(props);
  }

  /**
   * Morphs from the existing chart shape to the shape configured in this.chartState.chartRequest
   * 1) Updates the sizing of the chart to handle any sizing changes,
   * 2) Rebuilds the chart model based on the this.chartState.chartRequest,
   * 3) Re-renders axes, the chart, and any legends per the chart request
   * @return {undefined}
   */
  morph() {
    const { margin, axesMargin } = this.chartState;

    /* Get the axis ranges in pixel space */
    const xyAxisRanges = render.getXYPixelRangesFromSVG(this.dom.svg, margin, axesMargin);

    /* Update the svg group transforms */
    render.updateSVGTransforms(this.dom, margin, axesMargin);

    /* Update state */
    this.chartState = {
      ...this.chartState,
      ...xyAxisRanges,
      margin,
      axesMargin,
    };

    /* Use the new chart state to morph the chart model (map, scatter, bar, etc) */
    this.chartState.chartModel = buildChartModel(this.chartState);

    /* re-render everything, morphing previous chart shapes from to the new shapes */
    render.axes(this.dom, this.chartState);
    render.chart(this.dom, this.chartState);
    render.legends(this.dom, this.chartState);
  }

  /**
   * From the props.chartRequest object:
   * 1) filter the data,
   * 2) determine any series information and group data accordingly
   * 3) compute the requested color scale
   * 4) call morph() to morph the chart model and update the UI
   * @param props.chartRequest - the chart request object containing the chart spec
   * @return {undefined}
   */
  update(props = this.chartState /* , oldProps */) {
    const { chartRequest } = props;
    if (!this.chartState || !chartRequest) {
      return;
    }

    /* filter the data based on the new chartRequest and compute shared props like color scales */
    this.chartState = updatedStateFromChartRequest(
      this.dom,
      {
        ...this.chartState,
        chartRequest,
      },
    );

    /* compute the chart model and morph to the next chart shape */
    this.morph();
  }
}

export default Morpher;
