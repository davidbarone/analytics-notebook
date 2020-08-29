import List from "./List.js";
import ColumnCategory from "./ColumnCategory.js";
import JoinType from "./JoinType.js";
import "./Extensions.js";

/**
 * Provides data extraction and manipulation services.
 *
 * A DataFrame is similar to an Array object. It should be thought of as an array of objects, or a two dimensional array, similar to a table. Methods on the DataFrame class and DataFrame instances can be used for:
 * - Retrieving data
 * - Creating new data
 * - Cleansing & transforming data
 * - Summarising data
 * - Analysing data
 * Many methods in a DataFrame instance return a new DataFrame instance. Therefore calls can be 'chained' together to form a data processing pipeline.
 * Additionally, a DataFrame instance can have calculations and measures defined on it. These are formulae which are evaluated at runtime. Collectively, a DataFrame instance with its physical columns, calculations and measures is known as a 'model'. Each individual column, calculation or measure is know as a 'field'.
 */
class DataFrame {
  constructor(arr) {
    let self = this;
    this._data = []; // underlying data
    this._slicers = {}; // Set of filter functions applied to the core data. These filter functions come from Visual objects.
    this._calculations = {};
    this._measures = {};

    for (let i = 0, len = arr.length; i < len; i++) {
      this._data.push(arr[i]);
    }

    // Return Proxy, so that we can handle indexing, i.e.: DataFrame[n]
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (Number(prop) == prop && !(prop in target)) {
          let proxy = target.getRowProxy(target._data[prop], prop, target);
          return proxy;
          // Return a proxy of the object which can evaluate calculations too.
        }
        return target[prop];
      },
    });
  }

  /**
   * Gets a proxy for a single row / object which can evaluate calculations in the model.
   * @param {object} obj - The object to create a proxy for.
   * @param {Number} i - The index of the row in the DataFrame instance.
   * @param {DataFrame} dataFrame - The DataFrame instance with addional calculations & measures defined.
   * @returns {object} The returned object will be able to evaluate any calculations defined in the model.
   */
  getRowProxy(obj, i, dataFrame) {
    let df = dataFrame;
    let p = new Proxy(obj, {
      get(target, prop, receiver) {
        if (Object.getOwnPropertyNames(target).includes(prop)) {
          // physical column
          return target[prop];
        } else if (
          Object.getOwnPropertyNames(df._calculations).includes(prop)
        ) {
          // calculation - behaves like physical column
          return df._calculations[prop](df.getRowProxy(target, i, df), i, df);
        }
      },
    });
    return p;
  }

  /**
   * Creates a new DataFrame object from a plain Javascript Array object.
   * @param {Array} arr - The array to create a DataFrame object from.
   * @returns {DataFrame} A DataFrame instance.
   */
  static create(arr) {
    return new DataFrame(arr);
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
   * Gets all the columns, calculations, and measures in the model.
   * @returns {Array} A array of names in the model.
   */
  model() {
    let first = this[0];
    let props = Object.getOwnPropertyNames(first);
    let calculations = Object.getOwnPropertyNames(this._calculations);
    let measures = Object.getOwnPropertyNames(this._measures);
    let model = [...props, ...calculations, ...measures];
    return model;
  }

  /**
   * Callback function to map or transform an object to another object.
   * @callback DataFrame~mapFunction
   * @param {object} currentValue - The current row in the DataFrame instance.
   * @param {number} [index] - The index of the current row in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {object} The transformed object.
   */

  /**
   * Transforms a DataFrame instance using a mapping function.
   * @param {DataFrame~mapFunction} mapFunction - The function to map the data..
   * @returns {DataFrame} The transformed DataFrame instance.
   * @example <caption>Transforming a DataFrame instance</caption>
   * var people = [
   *   { name: "Tony", sex: "Male", age: 25 },
   *   { name: "Paul", sex: "Male", age: 17 },
   *   { name: "Sarah", sex: "Female", age: 42 },
   *   { name: "Debbie", sex: "Female", age: 62 },
   *   { name: "Michael", sex: "Male", age: 51 },
   *   { name: "Jenny", sex: "Female", age: 38 },
   *   { name: "Frank", sex: "Male", age: 32 },
   *   { name: "Amy", sex: "Female", age: 29 }
   * ];
   *
   * let df = DataFrame.create(people).map((p)=> { return { ageBand: Math.floor(p.age/10)*10, ...p }});
   * console.log(df);
   */
  map(mapFunction) {
    let len = this._data.length;
    let arr = [];
    for (let i = 0, len = this._data.length; i < len; i++) {
      arr.push(mapFunction(this._data[i], i, this));
    }
    return DataFrame.create(arr);
  }

  /**
   * Callback function to filter (include / exclude) an object.
   * @callback DataFrame~filterFunction
   * @param {object} currentValue - The current row in the DataFrame instance.
   * @param {number} [index] - The index of the current row in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {boolean} Returns true to keep the object in the DataFrame instance, and false to remove it.
   */

  /**
   * Filters a DataFrame object using a filter function.
   * @param {DataFrame~filterFunction} filterFunction - The function to filter the data. The function accepts a single parameter 'row' representing the current row. The function must return a boolean.
   * @returns {DataFrame} A filtered DataFrame instance.
   * @example <caption>Filtering a DataFrame instance</caption>
   * var people = [
   *   { name: "Tony", sex: "Male", age: 25 },
   *   { name: "Paul", sex: "Male", age: 17 },
   *   { name: "Sarah", sex: "Female", age: 42 },
   *   { name: "Debbie", sex: "Female", age: 62 },
   *   { name: "Michael", sex: "Male", age: 51 },
   *   { name: "Jenny", sex: "Female", age: 38 },
   *   { name: "Frank", sex: "Male", age: 32 },
   *   { name: "Amy", sex: "Female", age: 29 }
   * ];
   *
   * let df = DataFrame.create(people).filter((p)=> { return p.sex==="Male" });
   * console.log(df);
   */
  filter(filterFunction) {
    let len = this._data.length;
    let arr = [];
    for (let i = 0, len = this._data.length; i < len; i++) {
      if (filterFunction(this._data[i], i, this)) {
        arr.push(this._data[i]);
      }
    }
    return DataFrame.create(arr);
  }

  /**
   * Callback function which assigns an object to a group.
   * @callback DataFrame~groupingFunction
   * @param {object} currentValue - The current row in the DataFrame instance.
   * @param {number} [index] - The index of the current row in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {object} The callback should return an object representing the properties of the row that should be considered as the 'group' for the row.
   * All the unique values returned for all rows in the DataFrame objects will form the grouping rows of the resulting DataFrame instance.
   */

  /**
   * Callback function which aggregates a group of objects.
   * @callback DataFrame~aggregateFunction
   * @param {DataFrame} group - The current group in the DataFrame.
   * @param {DataFrame} dataFrame - The original DataFrame object that the grouping was performed on.
   * @returns {object} The callback should return an object representing any aggregrated values of the group. A single object must be returned with one or more properties.
   */

  /**
   * Callback function which defines column headings for each object.
   * @callback DataFrame~pivotFunction
   * @param {object} currentValue - The current row in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {string} The pivot function should return back a string value. This value will be projected as a column header.
   */

  /**
   * Groups a DataFrame object using a grouping function and optional aggregation and pivot functions. The group function is mandatory and specifies the group values. If the aggregation function is ommitted, the result is simply the distinct group values. If an aggregation function is specified, then additional aggregated values for each group can be included.
   * If a pivot function is specified, then the distinct string values returned by the pivot function are projected as column headers.
   * @param {DataFrame~groupingFunction} groupingFunction - Callback function to group the DataFrame instance.
   * @param {DataFrame~aggregateFunction} [aggregateFunction] - Optional callback to add aggregate data to the groups.
   * @param {DataFrame~pivotFunction} [pivotFunction] - If specified, then the return value of the function ({string}) is used as a column header. Similar to pivoting in relational databases.
   * @returns {DataFrame} The grouped DataFrame instance.
   * @example <caption>Grouping a DataFrame instance</caption>
   * var people = [
   *   { name: "Tony", sex: "Male", age: 25 },
   *   { name: "Paul", sex: "Male", age: 17 },
   *   { name: "Sarah", sex: "Female", age: 42 },
   *   { name: "Debbie", sex: "Female", age: 62 },
   *   { name: "Michael", sex: "Male", age: 51 },
   *   { name: "Jenny", sex: "Female", age: 38 },
   *   { name: "Frank", sex: "Male", age: 32 },
   *   { name: "Amy", sex: "Female", age: 29 }
   * ];
   *
   * let df = DataFrame
   *   .create(people)
   *   .group(
   *       (g)=> { return { sex: g.sex }},
   *       (a)=> { return { count: a.count() }}
   *     );
   *
   * console.log(df);
   * @example <caption>Pivoting the Anscombe's Quartet built-in dataset</caption>
   * let df = DataFrame
   *   .examples
   *   .anscombe()
   *   .group(
   *     g => { return { observation: g.observation }},
   *     a => { return JSON.stringify({ x: a.list('x').mean(), y: a.list('y').mean() })},
   *     p => p.dataset
   *   )
   *   .remove('observation')
   *   .visual('table')
   *   .attach('root');
   */
  group(groupingFunction, aggregateFunction, pivotFunction) {
    let groups = {};
    let that = this;
    for (let i = 0, len = this.count(); i < len; i++) {
      let proxy = that.getRowProxy(that[i], i, that);
      var group = JSON.stringify(groupingFunction(proxy));
      groups[group] = groups[group] || [];
      groups[group].push(proxy);
    }

    // Optional pivot function - Get distinct values for the pivot function
    let pivot = [];
    if (pivotFunction) {
      for (let i = 0, len = this.count(); i < len; i++) {
        let proxy = that[i];
        let value = pivotFunction(proxy, that);
        if (pivot.indexOf(value) === -1) pivot.push(value);
      }
    }

    let data = Object.keys(groups).map(function (group) {
      if (!aggregateFunction) {
        // no aggragations - just return distinct groups
        return JSON.parse(group);
      } else {
        if (pivotFunction) {
          // groups + aggregates + pivot -> pivot data too.
          let pivotObj = {};
          pivot.forEach((p) => {
            let items = DataFrame.create(groups[group]).filter(
              (r) => pivotFunction(r) === p
            );
            let value = aggregateFunction(items);

            // If value has 1 property only, then extract this value
            let props = Object.getOwnPropertyNames(value);
            if (props.length === 1) {
              value = value[props[0]];
            }
            pivotObj[p] = value;
          });
          return { ...JSON.parse(group), ...pivotObj };
        } else {
          // groups + aggregates, no pivot - join groups + aggregations
          let items = DataFrame.create(groups[group]);
          var agg = aggregateFunction(items);
          return { ...JSON.parse(group), ...agg };
        }
      }
    });
    return DataFrame.create(data);
  }

  /**
   * Gets the top 'n' rows of a DataFrame object.
   * @param {Number} top - Top 'n' rows to select.
   * @returns {DataFrame} A DataFrame instance with top 'n' rows only.
   * @example <caption>Getting the top 'n' rows from a DataFrame Instance</caption>
   * let titanic = DataFrame.examples.titanic().head(5);
   * console.log(titanic);
   */
  head(top) {
    let arr = [...this._data];
    return DataFrame.create(arr.splice(0, top));
  }

  /**
   * Returns the number of rows in the DataFrame.
   * @returns {number} The number of rows in the DataFrame instance.
   * @example <caption>Getting the row count of a DataFrame Instance</caption>
   * let count = DataFrame.examples.titanic.count();
   * console.log(count);
   */
  count() {
    return this._data.length;
  }

  /**
   * Callback function which defines the value to sort on. Note that this callback function differs from JavaScript's sort callback in that it doesn't actually calculate the sort, but instead simply returns the value to be sorted.
   * @callback DataFrame~sortFunction
   * @param {object} currentValue - The current row in the DataFrame instance.
   * @param {number} [index] - The index of the current row in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {object} The callback should return an object representing the value to sort on.
   */

  /**
   * Sorts the rows in a DataFrame object based on a sort function.
   * @param {DataFrame~sortFunction} sortFunction
   * @param {*} descending
   * @returns {DataFrame} The sorted DataFrame object
   * @example <caption>Ranking a dataset using Sort</caption>
   * let oldest5 = DataFrame
   *   .examples
   *   .titanic()
   *   .map((t) => { return { name: t.name, age: parseFloat(t.age) }})
   *   .filter((t) => { return !Number.isNaN(t.age) })
   *   .sort((t) => { return t["age"] }, true)
   *   .head(5);
   *
   * console.log(oldest5);
   */
  sort(sortFunction, descending) {
    let reverse = descending ? -1 : 1;
    let fn = (a, b) => {
      return sortFunction(a) > sortFunction(b) ? 1 * reverse : -1 * reverse;
    };
    this._data.sort(fn);
    return DataFrame.create(this._data);
  }

  /**
   * Callback function which compares 2 objects for equality.
   * @callback DataFrame~joinFunction
   * @param {object} objA - The first object.
   * @param {object} objb - The second object.
   * @returns {boolean} The function should return true if the objects are considered equal based on the function.
   */

  /**
   * Callback function which merges / returns an object from 2 input objects.
   * @callback DataFrame~mergeFunction
   * @param {object} objA - The first object.
   * @param {object} objb - The second object.
   * @returns {object} The merged / returned object.
   */

  /**
   * Joins the current DataFrame instance (left) to another DataFrame instance (right). Supports left, right, inner and outer join types.
   * @param {DataFrame} dataFrame - The right hand DataFrame instance
   * @param {JoinType} type - The join type
   * @param {DataFrame~joinFunction} joinFunction - The join function to compare rows from the left and right DataFrame instances.
   * @param {DataFrame~mergeFunction} selectFunction - The function to select the reqired values from the 2 joined tables.
   * @returns {DataFrame}
   * @example <caption>Joining 2 DataFrame Instances</caption>
   * UI.layout({
   *   id: 'root',
   *   direction: 'horizontal',
   *   children: [
   *     {id: 'left'},
   *     {id: 'centre'},
   *     {id: 'right'}
   *   ]
   * });
   *
   * let sales = DataFrame.create([
   *     {customer:'A1495', sku: 'BH41', qty: 10, unitPrice: 1.45},
   *     {customer:'G234', sku: 'HF42', qty: 1, unitPrice: 2.00},
   *     {customer:'F4824', sku: 'AH52', qty: 5, unitPrice: 1.00},
   *     {customer:'E472', sku: 'IF14', qty: 20, unitPrice: 1.20},
   *     {customer:'A2235', sku: 'FI42', qty: 5, unitPrice: 1.80},
   *     {customer:'J942', sku: 'AV91', qty: 2, unitPrice: 2.50},
   *     {customer:'B1244', sku: 'FY14', qty: 1, unitPrice: 3},
   *     {customer:'S95', sku: 'FE56', qty: 5, unitPrice: 5},
   *     {customer:'D424', sku: 'FE39', qty: 1, unitPrice: 2.50},
   *     {customer:'P1254', sku: 'DD67', qty: 2, unitPrice: 3.00}
   * ]);
   *
   * let customers = DataFrame.create([
   *     {customer:'A1495', name: 'Paul Allen'},
   *     {customer:'G234', name: 'Tony George'},
   *     {customer:'F4824', name: 'Dave Farthing'},
   *     {customer:'E472', name: 'Simone Earl'},
   *     {customer:'A2235', name: 'Fiona Abbot' },
   *     {customer:'J942', name: 'Tracy Jones'},
   *     {customer:'B1244', name: 'Stan Brown'},
   *     {customer:'S345', name: 'Michael Smith'},
   *     {customer:'F254', name: 'Dave Firth'},
   *     {customer:'J1344', name: 'Stuart Jones' }
   * ]);
   *
   * let join = sales.join(
   *     customers,
   *     'outer',
   *     (left,right) => { return left.customer === right.customer },
   *     (left,right) => { return {
   *         customer: right.customer ?? left.customer ?? null,
   *         name: right.name ?? null,
   *         sku: left.customer ?? null,
   *         qty: left.qty ?? null,
   *         unitPrice: left.unitPrice ?? null
   *     }}
   * );
   *
   * sales.visual('table').attach('left');
   * customers.visual('table').attach('centre');
   * join.visual('table').attach('right');
   */
  join(dataFrame, type, joinFunction, selectFunction) {
    let results = [];
    let left = [...this._data];
    let right = [...dataFrame._data];
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
   * Returns a List instance based on a single column or calculation from a DataFrame instance.
   * @param {string} column - The column or calculation to return a list for.
   * @returns {List}
   * @example <caption>Getting a list of unique values in a column</caption>
   * let list = DataFrame.examples.titanic().list('pclass');
   * console.log(list.unique());
   */
  list(column) {
    let arr = [];
    for (let i = 0, len = this.count(); i < len; i++) {
      arr.push(this[i][column]);
    }
    return new List(arr);
  }

  /**
   * Returns descriptive statistics about the current DataFrame instance.
   * @returns {DataFrame}
   */
  describe() {
    let first = this[0];
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
    return DataFrame.create(results);
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

    let data = this._data.map((row) => {
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
    this._data.forEach((row) => {
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
    this._data.forEach((row) => {
      let obj = {};
      columnNames.forEach((c) => {
        obj[c] = row[c];
      });
      data.push(obj);
    });

    return DataFrame.create(data);
  }

  // Slicer methods

  /**
   * Adds a visual slicer to the DataFrame slicer context. Each visual can add a single slicer function to this context.
   * @param {Visual} visual - The visual providing the slicer context.
   * @param {DataFrame~filterFunction} - The filter function applied to the DataFrame object.
   */
  setSlicer(visual, filterFunction) {
    if (typeof filterFunction === "function") {
      let id = visual.id;
      this._slicers = { ...this._slicers, [id]: filterFunction };
    }
  }

  /**
   * Removes a slicer originating from a Visual object.
   * @param {Visual} visual - The visual providing the slicer context.
   */
  unsetSlicer(visual) {
    this._slicers = { ...delete this._slicers[visual.id] };
  }

  /**
   * Removes all slicer filter functions
   */
  resetSlicers() {
    this._slicers = {};
  }

  /**
   * Creates a Visual object from a DataFrame object.
   * @param {string} type - The visual type. This visual type must exist in the Visual.library toolbox.
   * @param {*} options - The configuration for the renderer. The configuration is renderer-specific.
   * @param {DataFrame~filterFunction} filterFunction - Optional function to filter the data. The filter is only applied to this visual.
   * @returns {Visual}
   */
  visual(type, options, filterFunction) {
    let visual = new Visual(type, this, options, filterFunction);
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
   * corr.group(
   *   g => { return { x: g.x }},
   *   a => a.list('corr').mean(),
   *   p => p.y
   * ).visual('table').attach('root');
   */
  corr() {
    let columns = [];
    let properties = Object.getOwnPropertyNames(this._data[0]);
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
    for (let i = 0, len = this.count(); i < len; i++) {
      let proxy = this.getRowProxy(this[i], i, this);
      forEachCallback(proxy, i, this);
    }
  }

  /**
   * Defines a calculation on the DataFrame object. Unlike the map() function, Calculations are not physically materialised in the DataFrame instance. Instead, they are dynamically evaluated at runtime.
   * @param {string} name - The name of the calculation.
   * @param {DataFrame~mapFunction} - The calculation callback function.
   * @returns {DataFrame}
   */
  calculate(name, calculation) {
    this._calculations[name] = calculation;
    return this;
  }

  /**
   * Callback function to calculate a measure based on a group of data.
   * @callback DataFrame~measureFunction
   * @param {DataFrame} currentGroup - The current group in the DataFrame instance.
   * @param {number} [index] - The index of the current group in the DataFrame instance.
   * @param {DataFrame} [dataFrame] - The DataFrame instance that the function was called on.
   * @returns {Number | String} The aggregated value.
   */

  /**
   * Defines a measure on the DataFrame object. Measures aggregate a group of data down to a single value. Measures are normally used to sum, count and otherwise summarise numeric data.
   * @param {string} name - The name of the measure.
   * @param {DataFrame~mapFunction} - The measure callback function.
   * @returns {DataFrame}
   *
   */
  measure(name, measure) {
    this._measures[name] = measure;
    return this;
  }

  /**
   * Returns the column category.
   * @param {*} columnName
   * @returns {ColumnCategory}
   */
  columnCategory(columnName) {
    if (this._data[0].hasOwnProperty(columnName)) {
      return ColumnCategory.COLUMN;
    } else if (this._calculations.hasOwnProperty(columnName)) {
      return ColumnCategory.CALCULATION;
    } else if (this._measures.hasOwnProperty(columnName)) {
      return ColumnCategory.MEASURE;
    } else {
      throw `Column: ${columnName} does not exist in the model.`;
    }
  }

  /**
   * Returns the data after slicers have been applied to it. A new DataFrame object is returned with the same calculations and measures as the original DataFrame instance.
   * @returns {DataFrame}
   */
  slicedData() {
    if (!this._data) {
      return undefined;
    } else {
      let data = this._data;
      let slicers = Object.getOwnPropertyNames(this._slicers);
      slicers.forEach((s) => {
        data = data.filter(this._slicers[s]);
      });
      let df = DataFrame.create(data);
      Object.keys(this._calculations).forEach((k) => {
        df.calculate(k, this._calculations[k]);
      });
      Object.keys(this._measures).forEach((k) => {
        df.measure(k, this._measures[k]);
      });
      return df;
    }
  }

  /**
   * Evaluates a subcube from the DataFrame object. The cube method evaluates any calculations and measures defined in the model
   * @param {Array} columns - The columns to include in the subcube.
   */
  cube(...columns) {
    let arrGroups = [];
    let arrMeasures = [];

    // Filter data first
    let data = this.slicedData();

    columns.forEach((c) => {
      if (this.columnCategory(c) === ColumnCategory.MEASURE) {
        arrMeasures.push(c);
      } else {
        arrGroups.push(c);
      }
    });

    data = data.group(
      (row) => {
        let groupByValue = {};
        arrGroups.forEach((g) => {
          if (
            this.columnCategory(g) === ColumnCategory.COLUMN ||
            this.columnCategory(g) === ColumnCategory.CALCULATION
          ) {
            groupByValue[g] = row[g];
          }
        });
        return groupByValue;
      },
      (group) => {
        let measures = {};
        arrMeasures.forEach((m) => {
          measures[m] = this._measures[m](group, this);
        });
        return measures;
      }
    );
    return data;
  }
}

/**
 * Built-in example datasets.
 * @memberof DataFrame
 * @member examples
 */
DataFrame.examples = {};

export default DataFrame;
