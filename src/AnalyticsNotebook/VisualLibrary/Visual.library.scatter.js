import Visual from "../Visual.js";

/**
 * Displays a scatter plot allowing 2 continuous variables to be compared.
 * @param {DataFrame} dataFrame - The data bound to the visual.
 * @param {Object} options - Configuration of the visual.
 * @param {number} options.height - The height of the scatterplot.
 * @param {number} options.width - The width of the scatterplot.
 * @param {Object} options.margin - The margins for the scatterplot.
 * @param {number} options.margin.top - The top margin for the scatterplot.
 * @param {number} options.margin.right - The right margin for the scatterplot.
 * @param {number} options.margin.bottom - The bottom margin for the scatterplot.
 * @param {number} options.margin.left - The bottom margin for the scatterplot.
 * @returns {Node}
 * @example <caption>Displaying a scatterplot</caption>
 * DataFrame
 *   .examples
 *   .titanic()
 *   .cast({age: 'float', fare: 'float'})
 *   .visual(
 *     'scatter',
 *     {
 *       fnXValues: (r) => {
 *         return { age: r.age };
 *       },
 *       fnYValues: (r) => {
 *         return { fare: r.fare };
 *       }
 *     }
 *   )
 *   .attach("root");
 *
 * @example <caption>Incorporating a 3rd dimension using color</caption>
 * let iris = DataFrame.examples.iris();
 * iris
 *   .visual(
 *     'scatter',
 *     {
 *       fnXValues: (r) => {
 *         return { sepal_length_cm: r.sepal_length_cm };
 *       },
 *       fnYValues: (r) => {
 *         return { sepal_width_cm: r.sepal_width_cm };
 *       },
 *       fnColor: (r) => r.class==="Iris-setosa" ? "green" : r.class==="Iris-versicolor" ? "red" : "blue"
 *     }
 *   )
 *   .attach("root");
 */
Visual.library.scatter = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;
  let data = dataFrame.boundData();

  options = Object.mergeDeep(
    {
      height: 300,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      title: "",
      fnXValues: null,
      fnYValues: null,
      fnSize: null,
      fnColor: null,
      axes: {
        x: {
          display: true,
          title: "",
        },
        y: {
          display: true,
          title: "",
        },
      },
      border: {
        width: 0,
        color: "black",
        radius: 8,
        background: "#fff",
      },
    },
    options
  );

  // Get column names
  let xColumnName = Object.getOwnPropertyNames(options.fnXValues(data[0]))[0];
  let yColumnName = Object.getOwnPropertyNames(options.fnYValues(data[0]))[0];

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
    options.axes.x.min ||
    d3.min(data, function (d) {
      return +d[xColumnName];
    });

  let maxXValue =
    options.axes.x.max ||
    d3.max(data, function (d) {
      return +d[xColumnName];
    });

  var x = d3.scaleLinear().domain([minXValue, maxXValue]).range([0, width]);

  if (options.axes.x.display) {
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  }

  // Add Y axis
  let minYValue =
    options.axes.y.min ||
    d3.min(data, function (d) {
      return +d[yColumnName];
    });
  let maxYValue =
    options.axes.y.max ||
    d3.max(data, function (d) {
      return +d[yColumnName];
    });

  var y = d3.scaleLinear().domain([minYValue, maxYValue]).range([height, 0]);

  if (options.axes.y.display) {
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
      return options.fnSize ? options.fnSize(d) : 5;
    })
    .style("fill", function (d) {
      return options.fnColor ? options.fnColor(d) : "#69b3a2";
    });

  return svg.node().parentNode;
};
