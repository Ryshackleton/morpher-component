import { identity } from 'lodash';
import { pathGenerator, pathInterpolator } from '../utils/path';
import { css, defaults } from '../constants';
import { applyStyles, sortedSelection } from './util';

const {
  ANIMATE_ALL,
  ANIMATE_IN_SEQUENCE,
  FLUBBER_INTERPOLATE_OPTIONS,
  TRANSITION_DELAY,
  TRANSITION_DURATION,
} = defaults;

export default function chart(dom, chartState) {
  const {
    chartModel,
    chartModel: {
      shape,
    },
    chartRequest,
    chartRequest: {
      animationOrder = ANIMATE_ALL,
      transitionDuration = TRANSITION_DURATION,
      transitionDelay = TRANSITION_DELAY,
      animationSortField,
      animationSortAscending = true,
      morphableOpacityFunction = 1,
    },
    filteredDataIds = [],
  } = chartState;
  const { morphablesGroup } = dom;

  let delayCount = 0; // need an external counter because d3 selection indices aren't always from 0
  const isAnimatingInSequence = animationOrder === ANIMATE_IN_SEQUENCE;
  const delayFunction = isAnimatingInSequence
    ? () => {
      delayCount += 1;
      return delayCount * transitionDelay;
    }
    : transitionDelay;

  const join = morphablesGroup.selectAll('path')
    .data(filteredDataIds, identity);

  join.exit()
    .transition()
    .duration(transitionDuration)
    .style('opacity', 0)
    .remove();

  // interpolate paths on update
  const interpolator = pathInterpolator(shape, chartModel, FLUBBER_INTERPOLATE_OPTIONS);
  (isAnimatingInSequence
    ? sortedSelection(join, { chartModel, animationSortField, animationSortAscending })
    : join)
    .attr('class', css[shape])
    .transition()
    .duration(transitionDuration)
    .delay(delayFunction)
    .call(applyStyles, chartModel, chartRequest)
    .style('opacity', morphableOpacityFunction)
    .attrTween('d', interpolator);

  // generate paths on enter
  const pathGen = pathGenerator(shape, chartModel);
  join.enter()
    .append('path')
    .attr('class', css[shape])
    .call(applyStyles, chartModel, chartRequest)
    .style('opacity', 0)
    .attr('d', pathGen)
    .transition()
    .duration(join.empty() ? 0 : transitionDuration)
    .delay(join.empty() ? 0 : transitionDuration / 2)
    .style('opacity', morphableOpacityFunction);
}
