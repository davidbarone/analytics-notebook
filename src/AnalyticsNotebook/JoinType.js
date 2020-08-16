/**
 * @typedef {String} JoinType
 */

/**
 * @enum {JoinType}
 */
var JOIN_TYPE = {
  /**
   * Includes all matching rows, plus unmatched rows from the left-hand DataFrame instance.
   */
  LEFT: "left",
  /**
   * Includes all matching rows, plus unmatched rows from the right-hand DataFrame instance.
   */
  RIGHT: "right",
  /**
   * Includes all matching rows, and exludes all unmatched rows from the left and right DataFrame instances.
   */
  INNER: "inner",
  /**
   * Includes all matching and unmatched rows from both left and right DataFrame insteances.
   */
  OUTER: "outer",
};

export default JOIN_TYPE;
