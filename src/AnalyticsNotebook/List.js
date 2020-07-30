/**
 * A List object represents a single column from a DataFrame. Univariate analysis can be performed on a List object. 
  */
class List {
  arr = [];
  constructor(arr) {
    this.arr = [...arr];
  }

  /**
   * Returns the number of items in the list including null values.
   * @example <caption>Getting the number of records in a dataset</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("age").count());
   * @returns {Number} Returns the number of items in the list including nulls.
   */
  count() {
    return this.arr.length;
  }

  /**
   * Returns the sum of items in a list. Nulls are ignored.
   * @example <caption>Getting the sum of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").sum());
   * @returns {Number} Returns the sum of a list.
   */
  sum() {
    return this.values().arr.reduce((acc, cur) => acc + cur, 0);
  }

  /**
   * Returns the minimum value of items in a list. Nulls are ignored.
   * @example <caption>Getting the minimum value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").min());
   * @returns {Number} Returns the minimum value in a list.
   */
  min() {
    return this.values().arr.reduce((acc, cur) => (acc <= cur ? acc : cur));
  }

  /**
   * Returns the maximum value of items in a list. Nulls are ignored.
   * @example <caption>Getting the maximum value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").max());
   * @returns {Number} Returns the maximum value in a list.
   */
  max() {
    return this.values().arr.reduce((acc, cur) => (acc > cur ? acc : cur));
  }

  /**
   * Returns the mean value of items in a list. Nulls are ignored.
   * @example <caption>Getting the mean value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").mean());
   * @returns {Number} Returns the mean value in a list.
   */
  mean() {
    return (
      this.values().arr.reduce((acc, cur) => acc + cur, null) /
      this.values().arr.length
    );
  }

  /**
   * Returns the specified percentile of a list of numbers. Nulls are ignored.
   * @param {Number} percentile - The percentile value between 0 and 100.
   * @example <caption>Getting the Q1 value of a list of values</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").percentile(25));
   * @returns {Number} Returns the corresponding percentile value.
   */
  percentile(percentile) {
    const sorted = this.values().arr.sort((a, b) => (a > b ? 1 : -1));
    const pos = Math.ceil((sorted.length - 1) * (percentile / 100));
    return sorted[pos];
  }

  /**
   * Returns a list of non-null values. Duplicates are included.
   * @returns {List} New list containing all non-null values.
   * @example <caption>Getting a list of non-null values</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").values());
   */
  values() {
    return new List(this.arr.filter((i) => i || i == 0));
  }

  /**
   * Returns a unique list of non-null values. Duplicates are excluded.
   * @returns {List} New list containing unique list of non-null values.
   * @example <caption>Getting a unique list of non-null values</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").unique());
   */
  unique() {
    let results = [];
    results.pushUnique(this.values().arr);
    return new List(results);
  }

  /**
   * Gets the type of the list. The Javascript type of the first row is used.
   * @returns {String} - The type of the list.
   * @example <caption>Getting the type of a list</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").unique());
   */
  type() {
    let type = "undefined";
    if (this.arr.length > 0) {
      type = typeof this.arr[0];
    }
    return type;
  }

  /**
   * Returns the most frequent value(s). Up to 5 mode values are permitted.
   * @returns {Array} - The list of most frequently occuring value(s).
   * @example <caption>Getting the mode of a list</caption>
   * let values = new Column(1,5,3,7,3,7,8,12,15);
   * UI.content(values.mode());
   */
  mode() {
    let obj = {};
    let arr = [];
    this.values().arr.forEach((row) => {
      if (!obj[row]) {
        obj[row] = 0;
      }
      obj[row] = obj[row] + 1;
    });

    Object.getOwnPropertyNames(obj).forEach((i) => {
      arr.push({ value: i, count: obj[i] });
    });

    // Sort in descending order
    arr.sort((a, b) => {
      return a.count > b.count ? -1 : 1;
    });

    // zero element is mode. We grab all ties too
    let highestCount = arr[0].count;
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].count < highestCount) {
        break;
      }
      result.push(arr[i].value);
    }
    // Only return mode if <= 5 mode values. Otherwise
    // not relevant
    if (result.length <= 5) {
      return result;
    } else {
      return undefined;
    }
  }
}
