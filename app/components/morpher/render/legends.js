import {
  axisBottom, format, scaleLinear, scaleThreshold,
} from 'd3';

export default function legends(dom, chartState) {
  const {
    chartModel: {
      colorScale,
    },
    chartRequest: {
      legendTitle = 'Legend Title',
      legendWidthScale = scaleLinear(),
      legendRange = [0, 50],
    },
  } = chartState;
  const {
    colorLegend,
  } = dom;
  if (!colorScale || !legendTitle) {
    return;
  }

  colorLegend.selectAll('*')
    .remove();

  const x = legendWidthScale
    .domain(colorScale.domain())
    .range(legendRange);

  const thresh = scaleThreshold()
    .domain(colorScale.domain())
    .range(colorScale.range());

  colorLegend
    .selectAll('rect')
    .data(thresh.range().map((d) => {
      const dInv = thresh.invertExtent(d);
      return [
        dInv[0] == null ? x.domain()[0] : dInv[0],
        dInv[1] == null ? x.domain()[1] : dInv[1],
      ];
    }))
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', (d) => { return x(d[0]); })
    .attr('width', (d) => { return (x(d[1]) - x(d[0])); })
    .attr('fill', (d) => { return thresh(d[0]); });

  colorLegend.call(axisBottom(x)
    .tickSize(13)
    .tickFormat(format('.1f'))
    .tickValues(thresh.domain()))
    .select('.domain')
    .remove();

  colorLegend
    .append('text')
    .attr('class', 'caption')
    .attr('x', x.range()[0])
    .attr('y', -8)
    .attr('fill', '#000')
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold')
    .text(legendTitle);
}
