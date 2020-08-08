import List from "./List.js";

/**
 * DataFrame - Manages all manipulation of data.
 *
 * A DataFrame is similar to an Array object. It should be thought of as an array of objects
 * or a two dimensional array, similar to a table. The DataFrame class is the data workhorse.
 * It should be used for retrieving, exploring, cleansing, and transforming data.
 */
class DataFrame {
  constructor() {
    let self = this;
    this.data = [];
    this.slicers = {};
    this.data.push.apply(this.data, arguments);

    // Return Proxy, so that we can handle indexing, i.e.: DataFrame[n]
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (Number(prop) == prop && !(prop in target)) {
          return self.data[prop];
        }
        return target[prop];
      },
    });
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
   * @param {object} options - Options used for the fetch.
   * @returns {DataFrame}
   * @example <caption>Fetching data from an external API</caption>
   * UI.layout({
   *   id: 'root',
   *   direction: 'horizontal',
   *   children: [
   *     {
   *       id: 'left',
   *       direction: 'vertical',
   *       children: [
   *         {id: 'top-left'}, {id: 'bottom-left'}
   *       ]
   *     },
   *     {
   *       id: 'right'
   *     }
   *   ]
   * });
   *
   * // Get country population / area data from https://restcountries
   *
   * let data = await DataFrame.fetch('https://restcountries.eu/rest/v2/all');
   * let countries = data.select('name','capital','region','subregion','population','area');
   * Visual.html("<h1>First 10 countries</h1>").attach('right');
   * countries.head(10).visual('table').attach('right');
   *
   * // Get 10 largest countries and display in bar chart
   *
   * let largest = countries.sort(c=>c.area, true).head(10);
   * largest.visual('bar', {
   *   border: {
   *     width: 2,
   *     color: "gray",
   *     background: "#e0e8ef",
   *     radius: 8
   *   },
   *   margin: {
   *     top: 40,
   *     left: 80,
   *     right: 20,
   *     bottom: 60
   *   },
   *   title: "Population by Continent",
   *   fnCategories: c=> { return {region: c.region}},
   *   fnValues: (c)=> { return {
   *     population: c.list("population").mean(),
   *     area: c.list("area").sum()
   *   }}
   * }).attach('top-left');
   *
   * // Pie chart showing population by region.
   *
   * Visual.html("<h1>Population by Region</h1>").attach('bottom-left');
   * countries.visual('pie', {
   *   border: {
   *     width: 2,
   *     color: "gray",
   *     background: "#ddd",
   *     radius: 8
   *   },
   *   title: "Population by Continent",
   *   fnCategories: c=> { return { region: c.region }},
   *   fnValues: (c)=> { return { population: c.list("population").sum() }}
   * }).attach('bottom-left');
   */
  static async fetch(url, options) {
    console.log("starting read...");
    var result = await fetch(url, options);

    var data = await result.json();
    var count = data.length;
    console.log(`${count} rows read.`);
    return DataFrame.create(data);
  }

  /**
   * This callback is a required parameter of the DataFrame map method.
   * @callback DataFrame~mapFunction
   * @param {object} row - The current row in the DataFrame.
   * @returns {object} The transformed row.
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
   * @param {object} row - The current row in the DataFrame.
   * @returns {boolean} The function should returns a boolean value denoting the rows to be kept.
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
   * @param {object} row - The current row in the DataFrame.
   * @returns {object} The callback should return an object representing the properties of the row that should be considered as the 'group' for the row.
   * All the unique values returned for all rows in the DataFrame objects will form the group rows of the resulting DataFrame.
   */

  /**
   * This callback is a required parameter of the DataFrame group method.
   * @callback DataFrame~aggregateFunction
   * @param {DataFrame} group - The current group in the DataFrame.
   * @returns {object} The callback should return an object representing any aggregrated values of the group. A single object must be returned.
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
   * @returns {string} The pivot function should return back a string value. This value will be projected as a column header.
   */

  /**
   * Pivots rows into columns using a pivot function.
   * @param {DataFrame~groupingFunction} groupingFunction - The data grouping function.
   * @param {DataFrame~pivotFunction} pivotFunction - The data pivoting function.
   * @param {DataFrame~aggregateFunction} aggregateFunction - The data aggregation function.
   * @returns {DataFrame}
   * @example <caption>Pivoting the Anscombe's Quartet built-in dataset</caption>
   * let df = DataFrame
   *   .examples
   *   .anscombe()
   *   .pivot(
   *     g => { return { observation: g.observation }},
   *     p => p.dataset,
   *     a => { return JSON.stringify({ x: a.list('x').mean(), y: a.list('y').mean() })}
   *   )
   *   .remove('observation')
   *   .visual('table')
   *   .attach('root');
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
   * @returns {DataFrame}
   */
  head(top) {
    let arr = [...this.data];
    return DataFrame.create(arr.splice(0, top));
  }

  /**
   * Returns the number of rows in the DataFrame.
   * @returns {number} The number of rows in the DataFrame object.
   */
  count() {
    return this.data.length;
  }

  /**
   * Sorts the rows in a DataFrame object based on a sort function.
   * @param {*} sortFunction
   * @param {*} descending
   * @returns {DataFrame} The sorted DataFrame object
   */
  sort(sortFunction, descending) {
    let reverse = descending ? -1 : 1;
    let fn = (a, b) => {
      return sortFunction(a) > sortFunction(b) ? 1 * reverse : -1 * reverse;
    };
    this.data.sort(fn);
    return DataFrame.create(this.data);
  }

  /**
   * Joins 2 DataFrame objects.
   * @param {*} dataFrame
   * @param {*} type
   * @param {*} joinFunction
   * @param {*} selectFunction
   * @returns {DataFrame}
   */
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

  /**
   * Returns a single column from a DataFrame object.
   * @param {string} columnName
   * @returns {List}
   */
  list(columnName) {
    return new List([...this.data.map((r) => r[columnName])]);
  }

  /**
   * Returns descriptive statistics about the specified DataFrame object.
   * @returns {DataFrame}
   */
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
        std: column.std(),
      });
    });
    return new DataFrame(...results);
  }

  /**
   * Changes the types of columns in a DataFrame object.
   * @param {object} types
   * @returns {DataFrame}
   */
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

  /**
   * Removes selected columns from a DataFrame object.
   * @param  {...string} columnNames - list of columns to remove.
   * @returns {DataFrame}
   */
  remove(...columnNames) {
    let data = [];
    this.data.forEach((row) => {
      columnNames.forEach((c) => {
        delete row[c];
      });
      data.push(row);
    });

    return DataFrame.create(data);
  }

  /**
   * Selects columns to keep in a dataset. Columns not specified are removed.
   * @param  {...string} columnNames - List of columns to keep.
   * @returns {DataFrame}
   */
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

  /**
   * Creates a Visual object from a DataFrame object.
   * @param {*} renderer - The renderer to use.
   * @param {*} options - The configuration for the renderer. The configuration is renderer-specific.
   * @returns {Visual}
   */
  visual(renderer, options) {
    let visual = new Visual(this, renderer, options);
    return visual;
  }

  /**
   * Clones the DataFrame object.
   * @returns {DataFrame}
   */
  clone() {
    return DataFrame.create(this.data);
  }

  /**
   * Creates a correlation table for all numeric pairs in the DataFrame object.
   * @returns {DataFrame} Correlation for all numerical variable pairs in the DataFrame object.
   * @example <caption>Generating the correlation pairs for a DataFrame object</caption>
   * let iris = DataFrame.examples.iris();
   * let corr = iris.corr();
   * console.log(corr);
   *
   * // Visualise
   * corr.pivot(
   *   g => { return { x: g.x }},
   *   p => p.y,
   *   a => a.list('corr').mean()
   * ).visual('table').attach('root');
   */
  corr() {
    let columns = [];
    let properties = Object.getOwnPropertyNames(this.data[0]);
    properties.forEach((p) => {
      if (this.list(p).type() === "number") {
        columns.push(p);
      }
    });

    let results = [];
    columns.forEach((x) => {
      columns.forEach((y) => {
        results.push({
          x: x,
          y: y,
          corr: this.list(x).corr(this.list(y)),
        });
      });
    });

    return DataFrame.create(results);
  }

  /**
   * This callback is a required parameter of the DataFrame map method.
   * @callback DataFrame~forEachCallback
   * @param {object} currentValue - The current row in the DataFrame.
   * @param {number} [index] - The index of the current row in the DataFrame.
   * @param {Array} [array] - The array that the forEach was called on.
   */

  /**
   * Executes a callback function for each row in the DataFrame object.
   * @param {DataFrame~forEachCallback} forEachCallback
   */
  forEach(forEachCallback) {
    this.data.forEach(forEachCallback);
  }
}

/**
 * Built-in example datasets.
 * @memberof DataFrame
 * @member examples
 */
DataFrame.examples = {};

export default DataFrame;
