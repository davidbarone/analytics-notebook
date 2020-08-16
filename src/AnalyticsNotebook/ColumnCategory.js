/**
 * @typedef {String} ColumnCategory
 */

/**
 * The type of a column in a DataFrame instance.
 * @enum {ColumnCategory}
 */
var COLUMN_CATEGORY = {
  /**
   * A physical column in the data frame instance.
   */
  COLUMN: "column",
  /**
   * A calculated column in the model. Behaves like a real column.
   */
  CALCULATION: "calculation",
  /**
   * A measure defined in the model. Measures are used for aggregating data.
   */
  MEASURE: "measure",
};

export default COLUMN_CATEGORY;
