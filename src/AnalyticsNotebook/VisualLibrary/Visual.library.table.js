import Visual from "../Visual.js";

/**
 * Default table renderer function.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Creating a table visual</caption>
 * let data = DataFrame
 *   .examples
 *   .iris()
 *   .head(20)
 *   .visual('table')
 *   .attach('root');
 */
Visual.library.table = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;

  if (!options.binding.columns) {
    // if columns not specified, default to show all columns in the model
    options.binding.columns = dataFrame.model();
  }

  let data = dataFrame.cube(...options.binding.columns);

  let first = data[0];
  let columns = Object.getOwnPropertyNames(first);

  let html = "";

  html += "<table>";
  html += "<tr>";

  columns.forEach((c) => (html += `<th>${c}</th>`));
  html += "</tr>";

  data.forEach((r) => {
    html += "<tr>";
    columns.forEach((c) => {
      html += `<td>${r[c]}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  let elDiv = document.createElement("div");
  elDiv.style.margin = "4px 0px";
  elDiv.innerHTML = html;
  return elDiv;
};
