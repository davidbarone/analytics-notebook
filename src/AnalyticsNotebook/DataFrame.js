/**
 * DataFrame - Manages all manipulation of data.
 *
 * A DataFrame is similar to an Array object. It should be thought of as an array of objects
 * or a two dimensional array, similar to a table.
 */
class DataFrame {
  data = [];
  slicers = {};
  constructor() {
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
   * @returns {DataFrame}
   */
  static async fetch(url) {
    console.log("starting read...");
    var result = await fetch(url, {
      //credentials: 'include'
    });

    var data = await result.json();
    var count = data.length;
    console.log(`${count} rows read.`);
    return new DataFrame(...data);
  }

  /**
   * Transforms a DataFrame object using a mapping function.
   * @param {DataFrame~mapFunction} mapFunction - The function to map the data. The function accepts a single parameter 'row' representing the current row. The function must return an object representing the transformed row.
   * @returns {DataFrame} - The transformed DataFrame.
   */
  map(mapFunction) {
    this.data = [...this.data.map(mapFunction)];
    return this;
  }

  /**
   * This callback is displayed as part of the DataFrame.filter method.
   * @callback DataFrame~mapFunction
   * @param {Object} row - The current row in the DataFrame.
   * @returns {Object} - The transformed row.
   */

  /**
   * Filters a DataFrame object using a filter function.
   * @param {Function} filterFunction - The function to filter the data. The function accepts a single parameter 'row' representing the current row. The function must return a boolean.
   * @returns {DataFrame} - The filtered DataFrame.
   */
  filter(filterFunction) {
    this.data = [...this.data.filter(filterFunction)];
    return this;
  }

  /**
   * Groups a DataFrame object using a grouping function and an optional aggregation function. The group function is mandatory and specifies the group values.
   * If the aggregation function is ommitted, the result is simply the distinct group values. If an aggregation function is specified, then additional
   * aggregated values for each group can be included.
   * @param {*} groupingFunction
   * @param {*} aggregateFunction
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
    this.data = data;
    return this;
  }

  pivot(groupingFunction, pivotFunction, aggregateFunction) {
    // Get distinct values for the pivot function
    let pivot = [];
    this.forEach(function (r) {
      let value = pivotFunction(r);
      if (pivot.indexOf(value) === -1) pivot.push(value);
    });

    let groups = {};
    this.forEach(function (o) {
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
          (r) => fnPivot(r) === p
        );
        let value = aggregateFunction(items);
        pivotObj[p] = value;
      });

      return { ...JSON.parse(group), ...pivotObj };
    });

    this.data = data;
    return this;
  }

  head(top) {
    this.data = [...this.data.splice(0, top)];
    return this;
  }

  sort(sortFunction, descending) {
    let reverse = descending ? -1 : 1;
    let fn = (a, b) => {
      return sortFunction(a) > sortFunction(b) ? 1 * reverse : -1 * reverse;
    };
    this.data.sort(fn);
    return this;
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
    this.data = data;
    return this;
  }

  column(columnName) {
    return new Column(...this.data.map((r) => r[columnName]));
  }

  describe() {
    let first = this.data[0];
    let props = Object.getOwnPropertyNames(first);
    let results = [];
    props.forEach((p) => {
      let column = this.column(p);
      results.push({
        name: p,
        type: column.type(),
        count: column.count(),
        distinct: column.distinct().count(),
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

    this.data = data;
    return this;
  }

  remove(columnNames) {
    let data = [...this.data].forEach((row) => {
      columnNames.forEach((c) => {
        delete row[c];
      });
    });

    this.data = data;
    return this;
  }

  select(columnNames) {
    let data = [];
    this.data.forEach((row) => {
      let obj = {};
      columnNames.forEach((c) => {
        obj[c] = row[c];
      });
      data.push(obj);
    });

    this.data = data;
    return this;
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
}
