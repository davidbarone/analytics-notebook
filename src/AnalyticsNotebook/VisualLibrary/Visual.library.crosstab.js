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
 * @returns {Node}
 * @param {Visual} visual - The Visual object used for rendering.
 * @example <caption>Creating a contingency table of Titanic survival rates</caption>
 * let data = DataFrame.examples.titanic();
 *
 * data.calculate({
 *   passengers: (g, df) => g.count(),
 *   survival: (g, df) => g.filter(r=>r.survived===1).count() / g.count()
 * });
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

  options = Object.mergeDeep(
    {},
    {
      title: "",
      binding: {
        columns: null,
        rows: null,
        values: null,
      },
    },
    options
  );

  let columnsFieldCount = options.binding.columns.length;
  let rowsFieldCount = options.binding.rows.length;
  let valuesFieldCount = options.binding.values.length;

  // Get summarised data
  let data = dataFrame.cube(
    ...options.binding.columns,
    ...options.binding.rows,
    ...options.binding.values
  );

  // Get rows headers
  let rowGroups = data.group((row) => {
    let group = {};
    options.binding.rows.forEach((r) => {
      group[r] = row[r];
    });
    return group;
  });

  // Get column headers
  let columnGroups = data.group((row) => {
    let group = {};
    options.binding.columns.forEach((c) => {
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
      options.binding.rows.forEach((r) => {
        html += `<th>${columnsFieldCount === row ? r : ""}</th>`;
      });

      // Display the column headers
      let columnName = options.binding.columns[row];
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
      let rowName = options.binding.rows[r];
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
          let dimensions = [
            ...options.binding.columns,
            ...options.binding.rows,
          ];
          for (let d of dimensions) {
            if (f[d] !== intersect[d]) {
              match = false;
              break;
            }
          }
          return match;
        })
        .select(...options.binding.values)[0];

      if (cell) {
        if (valuesFieldCount > 1) {
          let cellTable = "<table>";
          options.binding.values.forEach((v) => {
            cellTable += `<tr><th>${v}</th><td>${cell[v]}</td></tr>`;
          });
          cellTable += "</table>";
          html += `<td>${cellTable}</td>`;
        } else {
          let fieldName = options.binding.values[0];
          html += `<td>${cell[fieldName]}</td>`;
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
