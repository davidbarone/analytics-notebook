import ColumnCategory from "../ColumnCategory.js";

/**
 * Configuration for the margins of a visual. Typically used for visuals with x and y axes. The margins refer to the space where the axes labels and title go.
 * @typedef {object} Visual~OptionsMargin
 * @property {number} top - The top margin
 * @property {number} right - The right margin
 * @property {number} bottom - The bottom margin
 * @property {number} left - The left margin
 */

/**
 * Configuration of the border around a visual.
 * @typedef {object} Visual~OptionsBorder
 * @property {number} width - The width of the border
 * @property {string} color - The border color
 * @property {number} radius - The border radius
 */

/**
 * Configuration applicable to all visuals.
 * @typedef {object} Visual~OptionsBase
 * @property {number} title - The title for the visual
 * @property {number} width - The width of the visual
 * @property {number} height - The height of the visual
 * @property {boolean} inline - Set to true for an inline visual. The default is false (block visual). Inline visuals align horizontally within a panel and block visuals align vertically.
 * @property {Visual~OptionsMargin} margin - The margin for the visual
 * @property {string} background - The background color for the visual
 * @property {Visual~OptionsBorder} border - The border style for the visual
 * @property {object} binding - Data bindings for the visual. Bindings are visual type specific.
 */

/**
 * Configuration of a single axis of a visual. Used for visuals with axes (e.g. x & y).
* @typedef {object} Visual~OptionsAxis
 * @property {boolean} display - Toggles the display of the column (x) axis.
 * @property {string} title - The column (x) axis title.
 * @property {string} min - The min value of the column (x) axis.
 * @property {string} max - The max value of the column (x) axis.
 * /

/**
 * Configuration of the axes of a visual. Used for visuals with axes (e.g. x & y).
* @typedef {object} Visual~OptionsAxes
 * @property {Visual~OptionsAxis} column - The column (x) axis configuration.
 * @property {Visual~OptionsAxis} row - The row (y) axis configuration.
 */

let VisualOptionsBaseDefault = {
  title: "",
  width: 400,
  height: 300,
  inline: false,
  margin: {
    top: 40,
    right: 20,
    bottom: 40,
    left: 60,
  },
  background: "#fefefe",
  border: {
    width: 0,
    color: "#999",
    radius: 0,
  },
  binding: {
    column: "",
    row: "",
    value: "",
    color: "",
    size: "",
    detail: "",
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
};

/**
 * Defines a single binding rule. Each binding rule is comprised of a set of properties with each storing a 2 character value defining the binding rule.
 * 
 * The first character specifies the number of fields allowed in the binding:
 * |Value |Meaning                             |
 * |:----:|:-----------------------------------|
 * |**1** |One field binding only allowed      |
 * |**?** |Zero or one field binding allowed   |
 * |***** |Zero or more field bindings allowed |
 * |**+** |One or more field bindings allowed  |
 * 
 * The second character defines the type of binding allowed:
 * 
 * |Value |Meaning                             |
 * |:----:|:-----------------------------------|
 * |**m** |Measure required                    |
 * |**c** |Column or calculated field required |
 * |**a** |Any (Measure or Column allowed)     |
 *
 * The required bindings on the built-in visuals are:
 *
 * |Type          | Column | Row    | Value  | Color  | Size   | Detail |
 * |--------------|:------:|:------:|:------:|:------:|:------:|:------:|
 * | **bar**      | X      | X      | X      |        |        |        |
 * | **column**   | X      | X      |        |        |        |        |
 * | **pie**      | X      |        | X      |        |        |        |
 * | **table**    | X      |        |        |        |        |        |
 * | **crosstag** | X      | X      | X      |        |        |        |
 * | **hist**     | X      |        |        |        |        |        |
 * | **box**      | X      |        |        |        |        |        |
 * | **scatter**  | X      | X      |        | X      | X      | X      |
 * | **slicer**   | X      |        |        |        |        |        |
 * | **pairs**    | ?      |        |        |        |        |        |
 * | **html**     |        |        |        |        |        |        |
 * 
 * The 6 properties in the binding rule are not all required for all visual types. Typically, a visual may only require one or two of these bindings.
 * @typedef {object} Visual~OptionsBindingRule
 * @property {string} column - The column binding.
 * @property {string} row - The row binding.
 * @property {string} value - The value binding.
 * @property {string} detail - The detail binding.
 * @property {string} color - The color binding.
 * @property {string} size - The size binding.
 */

let _validateSingleRule = function (dataFrame, binding, rule) {

  for (let prop of Object.getOwnPropertyNames(rule)) {
    let configuration = rule[prop];
    let size = configuration[0];
    let category = configuration[1];
    if (!binding[prop] && "1+".includes(size)) {
      // no binding set, but mandatory - error
      throw `Binding for ${prop} is mandatory.`
      break;
    }
    if (size == "1" && binding[prop].length > 1) {
      // should be 1 element. More than 1 supplied.
      throw `Binding for ${prop} should be single field.`
    }

    // Check the correct category of field.
    if (binding[prop] && binding[prop].length > 0) {
      binding[prop].filter(c => c).some((c) => {
        let columnCategory = dataFrame.columnCategory(c);
        if (!(
          (category.toLowerCase() === "m" &&
            columnCategory === ColumnCategory.MEASURE) ||
          (category.toLowerCase() === "c" &&
            columnCategory === ColumnCategory.COLUMN) ||
          (category.toLowerCase() === "c" &&
            columnCategory === ColumnCategory.CALCULATION) ||
          (category.toLowerCase() === 'a')
        )) {
          throw `Binding for ${prop} is of incorrect type (column/calculation/measure).`
        }
      })
    }
  }
}

/**
 * Validates the options.binding configuration passed into a Visual.
 * @param {DataFrame} dataFrame - The DataFrame instance containing the model.
 * @param {object} binding - The binding object to validate.
 * @param {Visual~OptionsBindingRule[]} rules - The binding validation rules.
 */
let validateBinding = function (dataFrame, binding, rules) {
  let ok = false;
  let error;
  for (let rule of rules) {
    try {
      _validateSingleRule(dataFrame, binding, rule);
      ok = true;
      break;
    } catch (err) {
      error = err
    }
  }
  if (!ok) {
    throw error;
  }
};

let doErrorVisual = function (error, options, id) {
  // Add core styles
  let elVisual = document.createElement("div");
  elVisual.id = id; // Assign the id to the visual node.
  elVisual.classList.add("visual", "error");

  // Apply Visual styles
  if (options) {
    if (options.inline) {
      elVisual.style.display = "inline-block";
    }
  }

  elVisual.innerText = error;
  elVisual.style.height = `${options.height}px`;
  elVisual.style.width = `${options.width}px`;
  return elVisual;  // The styled visual
}

/**
 * Applies base styling on a visual.
 */
let doBaseStyles = function (content, options, id) {

  // Add core styles
  let elVisual = document.createElement("div");
  elVisual.id = id; // Assign the id to the visual node.
  elVisual.classList.add("visual");
  let elInner = document.createElement("div");
  elInner.classList.add("visual", "inner");
  elVisual.appendChild(elInner);

  // Add title?
  if (options.title) {
    let elTitle = document.createElement("div");
    elTitle.innerText = options.title;
    elTitle.style.textAlign = "center";
    elTitle.style.fontWeight = 600;
    elInner.appendChild(elTitle);
  }

  // Apply Visual styles
  if (options) {
    if (options.background) {
      elInner.style.backgroundColor = options.background;
    }
    if (options.border) {
      elInner.style.border = `${options.border.width}px solid ${options.border.color}`;
    }
    if (options.border && options.border.radius) {
      elInner.style.borderRadius = `${options.border.radius}px`;
    }
    if (options.inline) {
      elVisual.style.display = "inline-block";
    }
  }
  elInner.appendChild(content);
  return elVisual;  // The styled visual
}

export default {
  defaultOptions: VisualOptionsBaseDefault,
  validateBinding: validateBinding,
  doBaseStyles: doBaseStyles,
  doErrorVisual: doErrorVisual,
};
