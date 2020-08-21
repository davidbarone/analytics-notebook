import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Additional options for configuring a scatterplot visual.
 * @typedef {Visual~OptionsBase} Visual~ScatterOptions
 * @property {string} binding.column - The DataFrame field name to project onto the x axis of the scatter plot.
 * @property {string} binding.row - The DataFrame field name to project onto the y axis of the scatter plot.
 * @property {string} binding.detail - If specified, the data frame will be grouped by this field. Otherwise, the raw data will be used.
 * @property {string} binding.size - The DataFrame field name to use for the size of the marks on the scatter plot.
 * @property {string} binding.color - The DataFrame field name to use for the color of the marks on the scatter plot.
 * @property {object} axes - The axes configuration.
 * @property {object} axes.column - The x-axis configuration.
 * @property {boolean} axes.column.display - Toggles the display of the column (x) axis.
 * @property {string} axes.column.title - The column (x) axis title.
 * @property {string} axes.column.min - The min value of the column (x) axis.
 * @property {string} axes.column.max - The max value of the column (x) axis.
 * @property {object} axes.row - The y-axis configuration.
 * @property {boolean} axes.row.display - Toggles the display of the row (y) axis.
 * @property {string} axes.row.title - The row (y) axis title.
 * @property {string} axes.row.min - The min value of the row (y) axis.
 * @property {string} axes.row.max - The max value of the row (y) axis.
 */

/**
 * Displays a scatter plot allowing 2 continuous variables to be compared. For configuration, refer to: {@link Visual~ScatterOptions}.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Displaying a scatterplot</caption>
 * DataFrame
 *   .examples
 *   .titanic()
 *   .cast({age: 'float', fare: 'float'})
 *   .calculate('rownum', (r, i, df) => i)
 *   .measure('age values', (g, i, df) => g.list('age').mean())
 *   .measure('fare values', (g, i, df) => g.list('fare').mean())
 *   .visual(
 *     'scatter',
 *     {
 *       binding: {
 *         column: 'age values',
 *         row: 'fare values',
 *         detail: 'rownum'
 *       }
 *     }
 *   )
 *   .attach("root");
 * @example <caption>Incorporating a 3rd dimension using color</caption>
 * let iris = DataFrame
 *   .examples
 *   .iris()
 *   .calculate('rownum', (r, i, df) => i)
 *   .measure('sepal length values', (g, i, df) => g.list('sepal_length_cm').mean())
 *   .measure('sepal width values', (g, i, df) => g.list('sepal_width_cm').mean())
 *   .measure('color value', (g, i, df) => g.list('class').min());
 * 
 * iris
 *   .visual(
 *     'scatter',
 *     {
 *       binding: {
 *         column: 'sepal length values',
 *         row: 'sepal width values',
 *         detail: 'rownum',
 *         color: 'color value'
 *       }
 *     }
 *   )
 *   .attach("root");
 */
Visual.library.scatter = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;
  options = Object.mergeDeep({}, options);

  VisualLibraryBase.validateBinding(dataFrame, options.binding, [
    { column: "1m", row: "1m", detail: '?c', size: '?m', color: '?m' }
  ]);

  // Get column names
  let xColumnName = options.binding.column[0];
  let yColumnName = options.binding.row[0];
  let detailBinding = options.binding.detail[0];
  let colorBinding = options.binding.color[0];
  let sizeBinding = options.binding.size[0];
  let columns = [xColumnName, yColumnName, detailBinding, colorBinding, sizeBinding].filter(c => c);
  let data = dataFrame.cube(...columns)._data;
  const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

  // set the dimensions and margins of the graph
  var margin = options.margin,
    width = options.width - margin.left - margin.right,
    height = options.height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  let minXValue =
    options.axes.column.min ||
    d3.min(data, function (d) {
      return +d[xColumnName];
    });

  let maxXValue =
    options.axes.column.max ||
    d3.max(data, function (d) {
      return +d[xColumnName];
    });

  var x = d3.scaleLinear().domain([minXValue, maxXValue]).range([0, width]);

  if (options.axes.column.display) {
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  }

  // Add Y axis
  let minYValue =
    options.axes.row.min ||
    d3.min(data, function (d) {
      return +d[yColumnName];
    });
  let maxYValue =
    options.axes.row.max ||
    d3.max(data, function (d) {
      return +d[yColumnName];
    });

  var y = d3.scaleLinear().domain([minYValue, maxYValue]).range([height, 0]);

  if (options.axes.row.display) {
    svg.append("g").call(d3.axisLeft(y));
  }

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d[xColumnName]);
    })
    .attr("cy", function (d) {
      return y(d[yColumnName]);
    })
    .attr("r", function (d) {
      return sizeBinding ? d[sizeBinding] : 3;
    })
    .style("fill", function (d) {
      return colorBinding
        ? colorScale(d[colorBinding])
        : "#69b3a2";
    });

  return svg.node().parentNode;
};
