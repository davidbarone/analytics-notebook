import Visual from "../Visual.js";

/**
 * Options object for configuring a slicer visual
 * @typedef {Object} Visual~slicerOptions
 * @property {string} title - Optional title.
 * @property {string} column - The column used to populate the slicer.
 */

/**
 * Creates an interactive slicer which can slice the bound DataFrame object. Any visuals sharing the DataFrame
 * object will be automatically filtered. For configuration, refer to: {@link Visual~slicerOptions}
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Adding a slicer for interactive slicing</caption>
 * UI.layout({
 *   id: 'root',
 *   fit: 'width'
 * });
 * let data = DataFrame.examples.iris();
 * data.visual('slicer', {column: 'class'}).attach('root');
 * data.visual('table').attach('root');
 */
Visual.library.slicer = function (visual) {
  let dataFrame = visual.dataFrame;
  let options = visual.options;

  options = Object.mergeDeep(
    {
      title: options.column || "",
      column: null,
    },
    options
  );

  let column = options.column;

  let elDiv = document.createElement("div");
  if (options.title) {
    let elTitle = document.createElement("h5");
    elTitle.innerText = options.title;
    elDiv.appendChild(elTitle);
  }

  let elSelect = document.createElement("select");
  let values = dataFrame.list(column).unique().arr;
  elSelect.addEventListener("change", function (evt) {
    // Slice the dataFrame
    let value = evt.target.value;
    if (value) {
      visual.setState("selectedValue", value);
      dataFrame.setSlicer(visual, (row) => row[column] === value);
    } else {
      // reset
      dataFrame.unsetSlicer(visual);
    }
  });

  let elAll = document.createElement("option");
  elAll.value = "";
  elAll.text = "<select value>";
  elSelect.appendChild(elAll);

  values.forEach((v) => {
    let elOption = document.createElement("option");
    elOption.value = v;
    elOption.text = v;
    elOption.selected = v === visual.state.selectedValue;
    elSelect.appendChild(elOption);
  });

  let elReset = document.createElement("button");
  elReset.innerText = "Clear";
  elReset.addEventListener("click", function (evt) {
    dataFrame.unsetSlicer(visual);
  });

  elDiv.appendChild(elSelect);
  elDiv.appendChild(elReset);
  return elDiv;
};
