
/* eslint-disable import/prefer-default-export */
export function morphables(selection, chartModel, chartRequest) {
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
}
