
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
