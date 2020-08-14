import Visual from "../Visual.js";

/**
 * Default table renderer function.
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
  let data = dataFrame.boundData();

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