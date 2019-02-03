import elementResizeDetectorMaker from 'element-resize-detector';
import D3Component from 'idyll-d3-component';
import buildChartModel from './chartModel';
import * as render from './render';

import {
  newChartState,
  updatedDataState,
  updatedChartXYState,
} from './chartState/index';

import './scss/morpher.scss';

class Morpher extends D3Component {
  initialize(parentNode, props) {
    this.chartState = newChartState(props);

    this.dom = render.svgInitialize(parentNode);
    render.resetSvgTransforms(this.dom, this.chartState);

    elementResizeDetectorMaker({ strategy: 'scroll' })
      .listenTo(parentNode, this.rebuild.bind(this));

    this.update(props);
  }

  rebuild() {
    this.chartState = updatedChartXYState(this.dom, this.chartState);

    render.resetSvgTransforms(this.dom, this.chartState);

    this.chartState.chartModel = buildChartModel(this.chartState);

    render.axes(this.dom, this.chartState);
    render.chart(this.dom, this.chartState);
    render.legends(this.dom, this.chartState);
  }

  update(props = this.chartState /* , oldProps */) {
    const {
      chartRequest,
      chartRequest: {
        margin = this.chartState.margin, // user requested margin or existing margin
        axesMargin = this.chartState.axesMargin, // user requested axesMargin or existing margin
      },
    } = props;
    if (!this.chartState || !chartRequest) {
      return;
    }
    this.chartState = updatedDataState(
      this.dom,
      {
        ...this.chartState,
        chartRequest,
        margin,
        axesMargin,
      },
    );
    this.rebuild();
  }
}

Morpher.defaultProps = {
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

export default Morpher;
