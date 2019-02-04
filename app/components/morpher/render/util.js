
export const applyStyles = (selection, chartModel, chartRequest) => {
  const { colorFromId } = chartModel;
  const {
    morphableStrokeFunction = () => {
      return 'black';
    },
    morphableStrokeWidthFunction = () => {
      return '1px';
    },
  } = chartRequest;

  return selection
    .style('stroke', morphableStrokeFunction)
    .style('stroke-width', morphableStrokeWidthFunction)
    .style('fill', colorFromId);
};

export const fadeOutTransition = (selection, duration = 1000) => {
  return selection.empty()
    ? selection
    : selection
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();
};

export const sortedSelection = (
  selection,
  {
    chartModel,
    animationSortField,
    animationSortAscending,
  },
) => {
  let valueFunction;
  if (animationSortField === 'color') {
    valueFunction = chartModel.colorValueFromId;
  } else if (animationSortField === 'x') {
    valueFunction = chartModel.xFromId;
  } else if (animationSortField === 'y') {
    valueFunction = chartModel.yFromId;
  } else if (animationSortField === 'radius') {
    valueFunction = chartModel.radiusFromId;
  }
  return valueFunction
    ? selection.sort((a, b) => {
      return animationSortAscending
        ? valueFunction(a) - valueFunction(b)
        : valueFunction(b) - valueFunction(a);
    })
    : selection;
};
