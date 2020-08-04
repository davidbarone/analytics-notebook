import examples from "./DataFrame.examples.js";

/**
 * DataFrame - Manages all manipulation of data.
 *
 * A DataFrame is similar to an Array object. It should be thought of as an array of objects
 * or a two dimensional array, similar to a table. The DataFrame class is the data workhorse.
 * It should be used for retrieving, exploring, cleansing, and transforming data.
 */
class DataFrame {
  constructor() {
    this.data = [];
    this.slicers = {};
    this.data.push.apply(this.data, arguments);
  }

  /**
   * Creates a new DataFrame object from a plain Javascript Array object.
   * @param {Array} arr - The array to create a DataFrame object from.
   * @returns {DataFrame}
   */
  static create(arr) {
    return new DataFrame(...arr);
  }

  /**
   * Fetches data from a Url. The data must be JSON data.
   * @param {string} url - The Url to fetch data from.
   * @param {Object} options - Options used for the fetch.
   * @returns {DataFrame}
   */
  static async fetch(url, options) {
    console.log("starting read...");
    var result = await fetch(url, options);

    var data = await result.json();
    var count = data.length;
    console.log(`${count} rows read.`);
    return new DataFrame(data);
  }

  /**
   * This callback is a required parameter of the DataFrame map method.
   * @callback DataFrame~mapFunction
   * @param {Object} row - The current row in the DataFrame.
   * @returns {Object} - The transformed row.
   */

  /**
   * Transforms a DataFrame object using a mapping function.
   * @param {DataFrame~mapFunction} mapFunction - The function to map the data. The function accepts a single parameter 'row' representing the current row. The function must return an object representing the transformed row.
   * @returns {DataFrame}
   */
  map(mapFunction) {
    return DataFrame.create(this.data.map(mapFunction));
  }

  /**
   * This callback is a required parameter of the DataFrame filter method.
   * @callback DataFrame~filterFunction
   * @param {Object} row - The current row in the DataFrame.
   * @returns {boolean} - The function should returns a boolean value denoting the rows to be kept.
   */

  /**
   * Filters a DataFrame object using a filter function.
   * @param {DataFrame~filterFunction} filterFunction - The function to filter the data. The function accepts a single parameter 'row' representing the current row. The function must return a boolean.
   * @returns {DataFrame}
   */
  filter(filterFunction) {
    return DataFrame.create(this.data.filter(filterFunction));
  }

  /**
   * This callback is a required parameter of the DataFrame group method.
   * @callback DataFrame~groupingFunction
   * @param {Object} row - The current row in the DataFrame.
   * @returns {Object} - The callback should return an object representing the properties of the row that should be considered as the 'group' for the row.
   * All the unique values returned for all rows in the DataFrame objects will form the group rows of the resulting DataFrame.
   */

  /**
   * This callback is a required parameter of the DataFrame group method.
   * @callback DataFrame~aggregateFunction
   * @param {DataFrame} group - The current group in the DataFrame.
   * @returns {Object} - The callback should return an object representing any aggregrated values of the group. A single object must be returned.
   */

  /**
   * Groups a DataFrame object using a grouping function and an optional aggregation function. The group function is mandatory and specifies the group values.
   * If the aggregation function is ommitted, the result is simply the distinct group values. If an aggregation function is specified, then additional
   * aggregated values for each group can be included.
   * @param {DataFrame~groupingFunction} groupingFunction
   * @param {DataFrame~aggregateFunction} aggregateFunction
   * @returns {DataFrame}
   */
  group(groupingFunction, aggregateFunction) {
    let groups = {};
    this.data.forEach(function (o) {
      var group = JSON.stringify(groupingFunction(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    let data = Object.keys(groups).map(function (group) {
      if (!aggregateFunction) {
        return JSON.parse(group);
      } else {
        let items = DataFrame.create(groups[group]);
        var agg = aggregateFunction(items);
        return { ...JSON.parse(group), ...agg };
      }
    });
    return DataFrame.create(data);
  }

  /**
   * This callback is a required parameter of the DataFrame pivot function.
   * @callback DataFrame~pivotFunction
   * @param {DataFrame} group - The current group in the DataFrame.
   * @returns {String} - The pivot function should return back a string value. This value will be projected as a column header.
   */

  /**
   * Pivots rows into columns using a pivot function.
   * @param {DataFrame~groupingFunction} groupingFunction - The data grouping function.
   * @param {DataFrame~pivotFunction} pivotFunction - The data pivoting function.
   * @param {DataFrame~aggregateFunction} aggregateFunction - The data aggregation function.
   * @returns {DataFrame}
   */
  pivot(groupingFunction, pivotFunction, aggregateFunction) {
    // Get distinct values for the pivot function
    let pivot = [];
    this.data.forEach(function (r) {
      let value = pivotFunction(r);
      if (pivot.indexOf(value) === -1) pivot.push(value);
    });

    let groups = {};
    this.data.forEach(function (o) {
      var group = JSON.stringify(groupingFunction(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });

    let data = Object.keys(groups).map(function (group) {
      // For each group, loop through each pivot value
      // calculating the value to pivot
      let pivotObj = {};
      pivot.forEach((p) => {
        let items = DataFrame.create(groups[group]).filter(
          (r) => pivotFunction(r) === p
        );
        let value = aggregateFunction(items);
        pivotObj[p] = value;
      });

      return { ...JSON.parse(group), ...pivotObj };
    });

    return DataFrame.create(data);
  }

  /**
   * Gets the top 'n' rows of a DataFrame object.
   * @param {Number} top - Top 'n' rows to select.
   */
  head(top) {
    let arr = [...this.data];
    return DataFrame.create(arr.splice(0, top));
  }

  /**
   * Returns the number of rows in the DataFrame.
   */
  count() {
    return this.data.length;
  }

  /**
   * Sorts the rows in a DataFrame object based on a sort function.
   * @param {*} sortFunction
   * @param {*} descending
   */
  sort(sortFunction, descending) {
    let reverse = descending ? -1 : 1;
    let fn = (a, b) => {
      return sortFunction(a) > sortFunction(b) ? 1 * reverse : -1 * reverse;
    };
    this.data.sort(fn);
    return DataFrame.create(this.data);
  }

  join(dataFrame, type, joinFunction, selectFunction) {
    let results = [];
    let left = [...this.data];
    let right = [...dataFrame.data];
    let leftIds = [];
    let rightIds = [];

    for (let i = 0; i < left.length; i++) {
      leftIds.push(i);
    }

    for (let j = 0; j < right.length; j++) {
      rightIds.push(j);
    }

    for (let i = 0; i < left.length; i++) {
      for (let j = 0; j < right.length; j++) {
        if (joinFunction(left[i], right[j])) {
          // match
          results.push({
            left: left[i],
            right: right[j],
          });
          leftIds.remove(i);
          rightIds.remove(j);
        }
      }
    }

    // Add in outer joins
    if (type === "left" || type === "outer") {
      leftIds.forEach((l) => {
        results.push({
          left: left[l],
          right: {},
        });
      });
    }

    if (type === "right" || type === "outer") {
      rightIds.forEach((r) => {
        results.push({
          left: {},
          right: right[r],
        });
      });
    }

    // Do select now
    let data = [...results.map((r) => selectFunction(r.left, r.right))];
    return DataFrame.create(data);
  }

  list(columnName) {
    return new List([...this.data.map((r) => r[columnName])]);
  }

  describe() {
    let first = this.data[0];
    let props = Object.getOwnPropertyNames(first);
    let results = [];
    props.forEach((p) => {
      let column = this.list(p);
      results.push({
        name: p,
        type: column.type(),
        count: column.count(),
        unique: column.unique().count(),
        fill: column.values().count() / column.count(),
        mode: column.values().mode(),
        mean: column.values().sum() / column.values().count(),
        min: column.values().min(),
        q1: column.values().percentile(25),
        median: column.values().percentile(50),
        q3: column.values().percentile(75),
        max: column.values().max(),
      });
    });
    return new DataFrame(...results);
  }

  cast(types) {
    var columnsToCast = Object.getOwnPropertyNames(types);
    var convertedValues = {};

    let castFunctions = {
      int: parseInt,
      float: parseFloat,
    };

    let data = this.data.map((row) => {
      let convertedValues = columnsToCast.reduce((acc, cur) => {
        return {
          ...acc,
          [cur]: castFunctions[types[cur]](row[cur]),
        };
      }, {});

      return {
        ...row,
        ...convertedValues,
      };
    });

    return DataFrame.create(data);
  }

  remove(columnNames) {
    let data = [...this.data].forEach((row) => {
      columnNames.forEach((c) => {
        delete row[c];
      });
    });

    return DataFrame.create(data);
  }

  select(...columnNames) {
    let data = [];
    this.data.forEach((row) => {
      let obj = {};
      columnNames.forEach((c) => {
        obj[c] = row[c];
      });
      data.push(obj);
    });

    return DataFrame.create(data);
  }

  slice(slicers) {
    this.slicers = {
      ...this.slicers,
      ...slicers,
    };

    this.temp = [...this.data];
    let keys = Object.getOwnPropertyNames(this.slicers);
    keys.forEach((k) => {
      let values = this.slicers[k];
      this.temp = this.temp.filter((r) => values.includes(r[k]));
    });

    // finally swap data + temp
    [this.data, this.temp] = [this.temp, this.data];
    return this;
  }

  // clears slicers
  reset() {
    this.data = [...this.temp];
    this.temp = undefined;
  }

  visual(renderer, options) {
    let visual = new Visual(this, renderer, options);
    return visual;
  }

  /**
   * Clones the DataFrame object.
   */
  clone() {
    return DataFrame.create(this.data);
  }
}

DataFrame.examples = examples;

export default DataFrame;
