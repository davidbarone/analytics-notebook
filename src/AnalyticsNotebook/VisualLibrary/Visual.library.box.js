import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Draws a boxplot diagram. Boxplot diagrams are useful for showing the 5-number summary of a continuous variable.
 * The function will automatically include a boxplot for every numeric variable in the DataFrame object.
 * @param {DataFrame} dataFrame - The data bound to the visual.
 * @param {Object} options - Configuration of the visual.
 * @returns {Node}
 * @example <caption>Displaying a boxplot diagram for continuous variables in the iris dataset</caption>
 * DataFrame
 *   .examples
 *   .iris()
 *   .visual(
 *     'box',
 *     {
 *       binding: {
 *         column: [
 *           'sepal_width_cm',
 *           'sepal_length_cm',
 *           'petal_width_cm',
 *           'petal_length_cm'
 *         ]
 *       }
 *     }
 *   )
 *   .attach('root');
 */
Visual.library.box = function (visual) {
    let options = visual.options;
    let dataFrame = visual.dataFrame;

    options = Object.mergeDeep({}, options);

    VisualLibraryBase.validateBinding(dataFrame, options.binding, [
        { column: "+c" }]
    );

    // Get the numeric columns
    let columns = options.binding.column.filter(c => dataFrame.list(c).type() === "number");

    // Create table with columns.length columns and 2 rows (header / data)
    let table = document.createElement("table");
    let header = table.createTHead();
    let row = header.insertRow(0);

    // headers
    columns.forEach((c) => {
        let cell = row.insertCell();
        cell.outerHTML = `<th>${c}</th>`;
    });

    // function to create single boxplot:
    let fnBoxPlot = function (list) {
        // append the svg object to the body of the page
        var svg = d3
            .create("svg")
            .attr("width", options.width + options.margin.left + options.margin.right)
            .attr(
                "height",
                options.height + options.margin.top + options.margin.bottom
            )
            .append("g")
            .attr(
                "transform",
                "translate(" + options.margin.left + "," + options.margin.top + ")"
            );

        //var data = [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 20, 12, 11, 9];

        // Compute summary statistics used for the box:
        var data_sorted = list.arr.sort(d3.ascending);
        var q1 = d3.quantile(data_sorted, 0.25);
        var median = d3.quantile(data_sorted, 0.5);
        var q3 = d3.quantile(data_sorted, 0.75);
        var interQuantileRange = q3 - q1;
        var min = data_sorted[0]; // q1 - 1.5 * interQuantileRange;
        var max = data_sorted[data_sorted.length - 1]; //q1 + 1.5 * interQuantileRange;

        // Show the Y scale
        var y = d3.scaleLinear().domain([min, max]).range([options.height, 0]);
        svg.call(d3.axisLeft(y));

        // a few features for the box
        let center = options.width / 2;
        let boxWidth = options.width / 2;

        // Show the main vertical line
        svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min))
            .attr("y2", y(max))
            .attr("stroke", "black");

        // Show the box
        svg
            .append("rect")
            .attr("x", center - boxWidth / 2)
            .attr("y", y(q3))
            .attr("height", y(q1) - y(q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        // show median, min and max horizontal lines
        svg
            .selectAll("toto")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center - boxWidth / 2)
            .attr("x2", center + boxWidth / 2)
            .attr("y1", function (d) {
                return y(d);
            })
            .attr("y2", function (d) {
                return y(d);
            })
            .attr("stroke", "black");

        return svg.node().parentNode;
    };

    // box plot row:
    row = table.insertRow();
    columns.forEach((c) => {
        let cell = row.insertCell();
        let list = dataFrame.list(c);
        let boxPlot = fnBoxPlot(list);
        cell.appendChild(boxPlot);
    });

    return table;
};
