import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Renders a pie chart.
 * @param {DataFrame} dataFrame - The data bound to the visual.
 * @param {Object} options - Configuration of the visual.
 * @returns {Node}
 * @example <caption>Displaying a pie chart</caption>
 * DataFrame
 *   .examples
 *   .titanic()
 *   .measure('passengers',(g,i,df) => g.count())
 *   .visual(
 *     'pie',
 *     {
 *       title: 'This is a test',
 *       background: '#999',
 *       border: {width: 1, color: '#333'},
 *       binding: {
 *         column: 'sex',
 *         value: 'passengers'
 *       }
 *     }
 *   )
 *   .attach("root");
 */
Visual.library.pie = function (visual) {
  let options = visual.options;
  let dataFrame = visual.dataFrame;

  options = Object.mergeDeep({}, options);

  VisualLibraryBase.validateBinding(dataFrame, options.binding, [
    { column: "1c", value: "1m" },
  ]);

  // Format data
  let categoryName = options.binding.column[0];
  let valueName = options.binding.value[0];

  let data = dataFrame
    .cube(categoryName, valueName)
    ._data.toObject(categoryName, valueName);

  // set the dimensions and margins of the graph
  let width = options.width;
  let height = options.height;
  let margin = 10;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2 - margin;

  // append the svg object to the div called 'my_dataviz'
  var svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // set the color scale
  var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);

  // Compute the position of each group on the pie:
  var pie = d3.pie().value(function (d) {
    return d.value;
  });

  var data_ready = pie(d3.entries(data));
  // Now I know that group A goes from 0 degrees to x degrees and so on.

  // shape helper to build arcs:
  var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", function (d) {
      return color(d.data.key);
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  // Now add the annotation. Use the centroid method to get the best coordinates
  svg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function (d) {
      return d.data.key;
    })
    .attr("transform", function (d) {
      return "translate(" + arcGenerator.centroid(d) + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", 17);

  return svg.node().parentNode;
};
