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
 * Validates the options.binding configuration. This is done via a validation object.
 * @param {DataFrame} dataFrame - The DataFrame instance containing the model.
 * @param {object} binding - The binding object to validate.
 * @param {Array.object} rules - The rules for validation. The rules object must contain a property for each binding you're validating for. The value of the property is a string containing 2 characters. The first character denotes the type of field permitted. Possible values are 'C' for columns and calculations, and 'N' for measures. The second character denote how many values can be provided. Valid values are '1' for only 1 field permitted, and '+' for 1 or more values permitted.
 */
let validateBinding = function (dataFrame, binding, rules) {
  let ok = false;
  for (let r of rules) {
    console.log(r);
    for (let prop of Object.getOwnPropertyNames(r)) {
      let configuration = r[prop];
      let category = configuration[0];
      let size = configuration[1];
      if (!binding[prop]) {
        // no binding set - error
        break;
      }
      if (size == "1" && binding[prop].length > 1) {
        // should be 1 element. More than 1 supplied.
        break;
      }

      // Check the correct type of field.
      if (
        binding[prop].some((c) => {
          let columnCategory = dataFrame.columnCategory(c);
          if (
            (category.toLowerCase() === "m" &&
              columnCategory === ColumnCategory.MEASURE) ||
            (category.toLowerCase() === "c" &&
              columnCategory === ColumnCategory.COLUMN) ||
            (category.toLowerCase() === "c" &&
              columnCategory === ColumnCategory.CALCULATION)
          ) {
            return true;
          } else {
            return false;
          }
        })
      ) {
        break;
      }
    }

    // if got here, then rule OK.
    ok = true;
    break;
  }
  if (!ok) {
    throw "Invalid binding specified.";
  }
};

export default {
  defaultOptions: VisualOptionsBaseDefault,
  validateBinding: validateBinding,
};
