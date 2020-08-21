import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Creates scatterplot matrix showing relationship between numerical variables in a DataFrame object.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Creating a scatterplot matrix</caption>
 * DataFrame
 *   .examples
 *   .iris()
 *   .visual('pairs')
 *   .attach('root');
 */
Visual.library.pairs = function (visual) {
    let options = visual.options;
    let dataFrame = visual.dataFrame;

    let columns = [];
    let properties = Object.getOwnPropertyNames(dataFrame._data[0]);
    properties.forEach((p) => {
        if (dataFrame.list(p).type() === "number") {
            columns.push(p);
        }
    });

    // Create table with columns.length+1 columns/rows
    let table = document.createElement("table");
    let header = table.createTHead();
    let row = header.insertRow(0);
    let cell = row.insertCell(0);
    cell.outerHTML = "<th></th>";

    // headers
    columns.forEach((c) => {
        cell = row.insertCell();
        cell.outerHTML = `<th>${c}</th>`;
    });

    // now loop through each row.
    columns.forEach((c1) => {
        row = table.insertRow();
        let cell = row.insertCell();
        cell.outerHTML = `<th>${c1}</th>`;
        columns.forEach((c2) => {
            let cell = row.insertCell();
            // get scatterplot for 2 variables
            let scat = dataFrame
                .calculate('rownum', (r, i, df) => i)
                .measure('row value', (g, i, df) => g.list(c1).mean())
                .measure('column value', (g, i, df) => g.list(c2).mean())
                .visual(
                    'scatter',
                    {
                        width: 100,
                        height: 100,
                        margin: { top: 10, right: 10, bottom: 10, left: 10 },
                        binding: {
                            column: 'column value',
                            row: 'row value',
                            detail: 'rownum'
                        },
                        axes: {
                            column: { display: false },
                            row: { display: false }
                        }
                    });
            cell.appendChild(scat.node());
        });
    });

    return table;
};
