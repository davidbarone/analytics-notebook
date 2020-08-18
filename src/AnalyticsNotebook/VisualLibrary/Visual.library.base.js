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
  binding: {},
};

export default {
  defaultOptions: VisualOptionsBaseDefault,
};
