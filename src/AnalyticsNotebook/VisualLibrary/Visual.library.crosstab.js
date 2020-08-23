import Visual from "../Visual.js";

/**
 * Additional options object for configuring a crosstab visual
 * @typedef {Visual~OptionsBase} Visual~OptionsCrosstab
 * @property {Array} binding.columns - The DataFrame field names to project onto the columns of the crosstab.
 * @property {Array} binding.rows - The DataFrame field names to projects onto the rows of the crosstab.
 * @property {Array} binding.values - The DataFrame field names to projects onto the values / cells of the crosstab.
 */

/**
 * Generates a crosstab, matrix or contingency table allowing relationships between multiple categorical variables to be viewed.
 * For configuration, refer to: {@link Visual~OptionsCrosstab}.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Creating a contingency table of Titanic survival rates</caption>
 * let data = DataFrame.examples.titanic();
 *
 * data.measure('passengers', (g, i, df) => g.count());
 * data.measure('survival', (g, i, df) => g.filter(r => r.survived===1).count() / g.count());
 *
 * data
 *   .visual('crosstab', {
 *     binding: {
 *       columns: ['pclass'],
 *       rows: ['sex'],
 *       values: ['passengers', 'survival']
 *     }
 * }).attach('root');
 */
Visual.library.crosstab = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;

  options = Object.mergeDeep({}, options);

  let columnsFieldCount = options.binding.column.length;
  let rowsFieldCount = options.binding.row.length;
  let valuesFieldCount = options.binding.value.length;

  let columns = [
    ...options.binding.column,
    ...options.binding.row,
    ...options.binding.value,
    ...options.binding.color,
  ].filter((c) => c);

  // Get summarised data
  let data = dataFrame.cube(...columns);

  // Get rows headers
  let rowGroups = data.group((row) => {
    let group = {};
    options.binding.row.forEach((r) => {
      group[r] = row[r];
    });
    return group;
  });

  // Get column headers
  let columnGroups = data.group((row) => {
    let group = {};
    options.binding.column.forEach((c) => {
      group[c] = row[c];
    });
    return group;
  });

  // Create the table
  // The total columns = columnGroups + rowsFieldCount (i.e. number of fields for rows)
  // We place the row headers on the row number = columnsFieldCount
  let html = "";
  html += "<table>";

  for (let row = 0; row < columnsFieldCount; row++) {
    html += "<tr>";
    if (row <= columnsFieldCount) {
      // Display the row headers
      options.binding.row.forEach((r) => {
        html += `<th>${columnsFieldCount === row ? r : ""}</th>`;
      });

      // Display the column headers
      let columnName = options.binding.column[row];
      for (let c = 0; c < columnGroups.count(); c++) {
        html += `<th>${columnGroups[c][columnName]}</th>`;
      }
    }
    html += "</tr>";
  }

  // Now the data
  for (let row = 0; row < rowGroups.count(); row++) {
    html += "<tr>";
    // Display the row headers
    for (let r = 0; r < rowsFieldCount; r++) {
      let rowName = options.binding.row[r];
      html += `<th>${rowGroups[row][rowName]}</th>`;
    }

    for (let c = 0; c < columnGroups.count(); c++) {
      // Display the row values
      // First, we create an object which represents all the dimension intersect values
      let intersect = { ...columnGroups[c], ...rowGroups[row] };

      // Now we find the single row (there will be only one row max)
      // in the dataset that matches this
      let cell = data
        .filter((f) => {
          let match = true;
          let dimensions = [...options.binding.column, ...options.binding.row];
          for (let d of dimensions) {
            if (f[d] !== intersect[d]) {
              match = false;
              break;
            }
          }
          return match;
        })
        .select(...options.binding.value, ...options.binding.color)[0];

      // Any color binding used? If so, need to color cell background
      let cellStyle = "";
      if (options.binding.color[0]) {
        let colorField = options.binding.color[0];
        let colorValue = cell[colorField];
        if (colorValue.isColor()) {
          cellStyle = `style="background-color: ${colorValue};"`;
        }
      }
      if (cell) {
        if (valuesFieldCount > 1) {
          let cellTable = "<table>";
          options.binding.value.forEach((v) => {
            cellTable += `<tr><th>${v}</th><td>${cell[v]}</td></tr>`;
          });
          cellTable += "</table>";
          html += `<td ${cellStyle}>${cellTable}</td>`;
        } else {
          let fieldName = options.binding.value[0];
          html += `<td ${cellStyle}>${cell[fieldName]}</td>`;
        }
      } else {
        html += "<td style=backgound-color: #999;></td>";
      }
    }
  }

  html += "</tr>";
  html += "</table>";

  let elDiv = document.createElement("div");
  elDiv.innerHTML = html;
  return elDiv;
};
