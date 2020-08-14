/**
 * @typedef {object} Visual~OptionsMargin
 * @property {number} top - The top margin
 * @property {number} right - The right margin
 * @property {number} bottom - The bottom margin
 * @property {number} left - The left margin
 */

/**
 * @typedef {object} Visual~OptionsBorder
 * @property {number} width - The width of the border
 * @property {string} color - The border color
 * @property {number} radius - The border radius
 */

/**
 * @typedef {object} Visual~OptionsBase
 * @property {number} title - The title for the visual
 * @property {number} width - The width of the visual
 * @property {number} height - The height of the visual
 * @property {boolean} inline - Set to true for an inline visual. The default is false (block visual)
 * @property {Visual~OptionsMargin} margin - The margin for the visual
 * @property {string} background - The background color for the visual
 * @property {Visual~OptionsBorder} border - The border style for the visual
 * @property {object} binding - Data bindings for the visual. Bindings are visual type specific.
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
  background: "#eee",
  border: {
    width: 1,
    color: "#999",
    radius: 0,
  },
  binding: {},
};

export default {
  defaultOptions: VisualOptionsBaseDefault,
};
