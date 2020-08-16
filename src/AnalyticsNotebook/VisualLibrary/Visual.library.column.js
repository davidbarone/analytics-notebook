import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Additional options for configuring a column visual.
 * @typedef {Visual~OptionsBase} Visual~ColumnOptions
 * @property {string} binding.column - The DataFrame field name to project onto the main categories axis of the column chart.
 * @property {string} binding.row - The DataFrame field name to project onto the groupings of the column chart.
 * @property {Array} binding.values - The DataFrame field name(s) to projects onto the values / cells of the crosstab. If the binding.row value is specified, only 1 value field can be entered here.
 * @property {object} axes - The axes configuration.
 * @property {object} axes.column - The x-axis configuration.
 * @property {boolean} axes.column.display - Toggles the display of the column (x) axis.
 * @property {string} axes.column.title - The column (x) axis title.
 * @property {object} axes.row - The y-axis configuration.
 * @property {boolean} axes.row.display - Toggles the display of the row (y) axis.
 * @property {string} axes.row.title - The row (y) axis title.
 */

/**
 * Renders a column chart or grouped column chart. Column charts should be used to show a distribution of data points, or show comparisons between different categories of data. Bars are vertically aligned. For horizontally-aligned bars, refer to the bar visual type. For configuration, refer to: {@link Visual~ColumnOptions}.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Creating a grouped column chart</caption>
 * let model = DataFrame
 *   .examples
 *   .titanic()
 *   .calculate({
 *     passengers: (g, df) => g.count()
 *   });
 *
 * model
 *   .visual(
 *     'column',
 *     {
 *       title: 'Passengers on the Titanic by Embarked port & Sex',
 *       background: '#abcdef',
 *       binding: {
 *         column: 'embarked',
 *         row: 'sex',
 *         values: ['passengers']
 *       }
 *     }
 *   )
 *   .attach('root');
 * @example <caption>Law of Large Numbers</caption>
 * let roll = () => Math.floor(Math.random() * 6) + 1;
 * let attempts = prompt("Enter number of dice throws (1 - 1,000,000):");
 * let data = [];
 *
 * for (let i = 0; i < attempts; i++) {
 *   data.push({roll: roll()});
 * }
 *
 * let df = DataFrame
 *   .create(data)
 *   .calculate({
 *     count: (g, df) => g.count()
 *   });
 *
 * df
 *   .visual(
 *     'column'
 *     , {
 *       title: `Results of ${attempts} Throws:`,
 *       binding: {
 *         column: 'roll',
 *         values: ['count']
 *       }
 *     }
 *   ).attach('root');
 */
Visual.library.column = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;

  options = Object.mergeDeep(
    {},
    {
      binding: {
        column: "",
        row: "",
        value: "",
      },
      axes: {
        column: {
          display: true,
          title: "",
        },
        row: {
          display: true,
          title: "",
        },
      },
    },
    options
  );

  let columns = [
    options.binding.column,
    options.binding.row,
    options.binding.values,
  ].filter((c) => c);

  // Summarise data
  let data = visual.dataFrame.cube(...columns);

  let subGroups = [];
  // If the row field set, pivot the data
  if (options.binding.row) {
    subGroups = data.list(options.binding.row).unique().arr;
    data = data.pivot(
      (g) => {
        return { [options.binding.column]: g[options.binding.column] };
      },
      (p) => p[options.binding.row],
      (a) => a.list(options.binding.values[0]).sum()
    );
  } else {
    // just value(s) specified. These are already column headers.
    subGroups = options.binding.values;
  }

  data = data.data; // Get underlying native js array.

  // set the dimensions and margins of the graph
  let width = options.width - options.margin.left - options.margin.right,
    height = options.height - options.margin.top - options.margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", options.width)
    .attr("height", options.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + options.margin.left + "," + options.margin.top + ")"
    );

  // border
  if (options.border) {
    var border = svg
      .append("rect")
      .attr("x", -options.margin.left)
      .attr("y", -options.margin.top)
      .attr("height", options.height)
      .attr("width", options.width)
      .style("fill", "none");
  }

  // title?
  if (options.title) {
    svg
      .append("text")
      .attr("x", options.width / 2 - options.margin.left)
      .attr("y", 0 - options.margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text(options.title);
  }

  // X axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map(function (d) {
        return d[options.binding.column];
      })
    )
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // X axis title?
  if (options.axes.column.title) {
    svg
      .append("text") // text label for the x axis
      .attr("x", (width + options.margin.left + options.margin.right) / 2)
      .attr("y", height + options.margin.top + options.margin.bottom - 12)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(options.axes.column.title);
  }

  // Add Y axis
  let maxValue = 0;
  subGroups.forEach((g) => {
    let value = d3.max(data, function (d) {
      return +d[g];
    });
    if (value > maxValue) {
      maxValue = value;
    }
  });

  var y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3
    .scaleBand()
    .domain(subGroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette = one color per subgroup
  var color = d3
    .scaleOrdinal()
    .domain(subGroups)
    .range(["#e41a1c", "#377eb8", "#4daf4a"]);

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .enter()

    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d[options.binding.column]) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return subGroups.map(function (key) {
        return { key: key, value: d[key] };
      });
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xSubgroup(d.key);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .attr("fill", function (d) {
      return color(d.key);
    });

  return svg.node().parentNode;
};
