/**
 * A List object represents a single column from a DataFrame. Univariate analysis can be performed on a List object.
 */
class List {
  constructor(arr) {
    this.arr = [];
    this.arr = [...arr];
  }

  /**
   * Returns the number of items in the list including null values.
   * @returns {number} The count of items in the list.
   * @example <caption>Getting the number of records in a dataset</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("age").count());
   */
  count() {
    return this.arr.length;
  }

  /**
   * Returns the sum of items in a list. Nulls are ignored.
   * @returns {number} Returns the sum of a list.
   * @example <caption>Getting the sum of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").sum());
   */
  sum() {
    return this.values().arr.reduce((acc, cur) => acc + cur, 0);
  }

  /**
   * Returns the minimum value of items in a list. Nulls are ignored.
   * @returns {number} Returns the minimum value in a list.
   * @example <caption>Getting the minimum value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").min());
   */
  min() {
    return this.values().arr.reduce((acc, cur) => (acc <= cur ? acc : cur));
  }

  /**
   * Returns the maximum value of items in a list. Nulls are ignored.
   * @returns {number} Returns the maximum value in a list.
   * @example <caption>Getting the maximum value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").max());
   */
  max() {
    return this.values().arr.reduce((acc, cur) => (acc > cur ? acc : cur));
  }

  /**
   * Returns the mean value of items in a list. Nulls are ignored.
   * @returns {number} Returns the mean value in a list.
   * @example <caption>Getting the mean value of a list</caption>
   * let titanic = DataFrame.examples.titanic();
   * UI.content(titanic.column("survived").mean());
   */
  mean() {
    return (
      this.values().arr.reduce((acc, cur) => acc + cur, 0) /
      this.values().count()
    );
  }

  /**
   * Returns the specified percentile of a list of numbers. Nulls are ignored.
   * @param {number} percentile - The percentile value between 0 and 100.
   * @returns {number} Returns the corresponding percentile value.
   * @example <caption>Getting the Q1 value of a list of values</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").percentile(25));
   */
  percentile(percentile) {
    const sorted = this.values().arr.sort((a, b) => (a > b ? 1 : -1));
    const pos = Math.ceil((sorted.length - 1) * (percentile / 100));
    return sorted[pos];
  }

  /**
   * Returns a list of non-null values. Duplicates are included.
   * @returns {List} All non-null values (duplicates included).
   * @example <caption>Getting a list of non-null values</caption>
   * let titanic = DataFrame.examples.titanic().cast({age: 'float'});
   * UI.content(titanic.list("age").values());
   */
  values() {
    return new List(this.arr.filter((i) => i || i == 0));
  }

  /**
   * Returns a unique list of non-null values. Duplicates are excluded.
   * @returns {List} Unique list of non-null values.
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
   * @returns {string} The type of the list.
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
   * @returns {Array} The list of most frequently occuring value(s).
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

  /**
   * Calculates the variance of a list of values.
   * @returns {number} The non-biased variance.
   * @example <caption>Getting the variance of ages on the titanic</caption>
   * let variance = DataFrame
   *   .examples
   *   .titanic()
   *   .cast({age: 'float'})
   *   .list('age')
   *   .var();
   * console.log(variance);
   */
  var() {
    let sumSquaredDeviations = 0;
    let mean = this.mean();
    this.values().arr.forEach((row) => {
      sumSquaredDeviations += Math.pow(row - mean, 2);
    });
    return sumSquaredDeviations / (this.values().count() - 1);
  }

  /**
   * Calculates the standard deviation of a list of values.
   * @returns {number} The non-biased standard deviation.
   * @example <caption>Getting the variance of ages on the titanic</caption>
   * let std = DataFrame
   *   .examples
   *   .titanic()
   *   .cast({age: 'float'})
   *   .list('age')
   *   .std();
   * console.log(std);
   */
  std() {
    return Math.pow(this.var(), 0.5);
  }

  /**
   * Calculates the correlation to another List object
   * @param {List} list - List object with which to calculate the correlation.
   * @returns {number} The correlation value between -1 and 1.
   * @example <caption>Calculating the correlation between 2 List objects</caption>
   * let iris = DataFrame.examples.iris();
   * let sepal_length_cm = iris.list('sepal_length_cm');
   * let petal_length_cm =  iris.list('petal_length_cm');
   * console.log(sepal_length_cm.corr(petal_length_cm));
   */
  corr(list) {
    if (this.count() !== list.count()) {
      throw "Cannot compute correlation. Both lists must have same row count.";
    }

    let xMean = this.mean();
    let xStd = this.std();
    let yMean = list.mean();
    let yStd = list.std();
    let rowCount = this.count();

    let numerator = 0;
    let denominator = 0;
    this.arr.forEach((x) => {
      let i = this.arr.indexOf(x);
      let y = list.arr[i];
      if (y && x) {
        numerator += ((x - xMean) / xStd) * ((y - yMean) / yStd);
        denominator++;
      }
    });

    let corr = numerator / (denominator - 1);
    return Math.round(corr * 1000) / 1000;
  }
}

export default List;
