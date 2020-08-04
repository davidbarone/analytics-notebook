/**
 * @typedef {String} PanelFit
 */

/**
 * @enum {PanelFit}
 */
var PANEL_FIT = {
  /**
   * Child visuals will not be resized. Scroll bars will be displayed if content overflows the panel.
   */
  NONE: "none",

  /**
   * Child visuals will be resized so the width fits the panel.
   */
  WIDTH: "width",

  /**
   * Child visuals will be resized so the height fits the panel.
   */
  HEIGHT: "height",

  /**
   * Child visuals will be resized so both the width and height fits the panel.
   */
  BOTH: "both",
};

export default PANEL_FIT;
