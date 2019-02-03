import {
  forceSimulation, forceX, forceY, forceCollide,
} from 'd3';

/* eslint-disable no-plusplus, import/prefer-default-export */
export const forcePackNodesToRadii = ({
  nodes,
  alphaMin = 0.01,
  collideStrength = 0.8,
  maxTicks = 1000,
  radiusPadding = 0.3,
  radiusAccessor,
  xAccessor,
  yAccessor,
  xStrength = 0.2,
  yStrength = 0.2,
}) => {
  const force = forceSimulation(nodes)
    .force('x', forceX().x((d) => { return xAccessor(d); }).strength(xStrength))
    .force('y', forceY().y((d) => { return yAccessor(d); }).strength(yStrength))
    .force('collide', forceCollide().strength(collideStrength).radius((d) => {
      return radiusAccessor(d) + radiusPadding;
    }))
    .stop();

  let i = 0;
  while (force.alpha() > alphaMin && ++i !== maxTicks) {
    force.tick();
  }

  return nodes;
};
/* eslint-enable no-plusplus, import/prefer-default-export */
