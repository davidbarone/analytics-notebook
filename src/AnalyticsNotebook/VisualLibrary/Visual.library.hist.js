import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Renders a histogram. Histograms display the display the frequency distribution of a continuous variable using bins.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Displaying a histogram</caption>
 * DataFrame
 *   .examples
 *   .titanic()
 *   .cast({age: 'float'})
 *   .visual(
 *     'hist',
 *     {
 *       binding: {
 *         column: 'age'
 *       }
 *     }
 *   )
 *   .attach("root");
 */
Visual.library.hist = function (visual) {
    let options = visual.options;
    let dataFrame = visual.dataFrame;

    options = Object.mergeDeep({}, options);

    VisualLibraryBase.validateBinding(dataFrame, options.binding, [
        { column: "1c" },
    ]);

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3
        .create("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    let valueName = options.binding.column[0];
    let data = dataFrame.slicedData().list(valueName);

    // X axis: scale and draw:
    let minValue = data.min();
    let maxValue = data.max();
    var x = d3.scaleLinear().domain([minValue, maxValue]).range([0, width]);
    svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3
        .histogram()
        .value(function (d) {
            return d;
        }) // I need to give the vector of value
        .domain(x.domain()) // then the domain of the graphic
        .thresholds(x.ticks(50)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data.arr);

    // Y axis: scale and draw:
    var y = d3.scaleLinear().range([height, 0]);
    y.domain([
        0,
        d3.max(bins, function (d) {
            return d.length;
        }),
    ]); // d3.hist has to be called before the Y axis obviously
    svg.append("g").call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        })
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
            return height - y(d.length);
        })
        .style("fill", "#69b3a2");

    return svg.node().parentNode;
};
