////////////////////////////////////////////////////
//
// Data Frame
//
// Provides table functions in workbench. Includes:
//
// fetch()
// map()
// filter()
// group()
// head()
// join()
// sort()
// column()
// describe()
// cast()
// remove()
// select()
// measures()
////////////////////////////////////////////////////
function DataFrame() {
    var arr = [];
    arr.push.apply(arr, arguments);
    arr.__proto__ = DataFrame.prototype;
    return arr;
}
DataFrame.prototype = new Array;

////////////////////////////////////////////////////
// DataFrame.fetch
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: true,
    name: 'fetch',
    async: true,
    returns: 'DataFrame',
    description: 'Fetches json data from a url.',
    signatures: [
        [
            {
                parameterName: 'url',
                parameterType: 'string',
                parameterDescription: 'The url for the data.'
            }
        ]
    ],
    examples: [
        {
            name: 'Querying data and rendering a table to the output pane.',
            description: `The following example illustrates how to query the titanic dataset, get the top 10 rows, and render the results as a table.`,
            code: `let titanic = await sw.read("demo","titanic");
titanic = sw.head(titanic,5);
sw.table(titanic);`
        }
    ]
});
DataFrame.fetch = async function (url) {
    console.log("starting read...");
    var result = await fetch(url, {
        //credentials: 'include'
    });

    var data = await result.json();
    var count = data.length;
    console.log(`${count} rows read.`);
    return new DataFrame(...data);
}

////////////////////////////////////////////////////
// DataFrame.create
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: true,
    name: 'create',
    async: true,
    returns: 'DataFrame',
    description: 'Creates a new DataFrame object from a plain JavaScript Array.',
    signatures: [
        [
            {
                parameterName: 'arr',
                parameterType: 'Array',
                parameterDescription: 'The Array object.'
            }
        ]
    ],
    examples: [
        {
            name: 'Creating a manual dataset.',
            description: `The following example illustrates how to create a manual dataset.`,
            code: `var people = [
  { name: "Tony", sex: "Male", age: 25 },
  { name: "Paul", sex: "Male", age: 17 },
  { name: "Sarah", sex: "Female", age: 42 },
  { name: "Debbie", sex: "Female", age: 62 },
  { name: "Michael", sex: "Male", age: 51 },
  { name: "Jenny", sex: "Female", age: 38 },
  { name: "Frank", sex: "Male", age: 32 },
  { name: "Amy", sex: "Female", age: 29 }
];

var df = DataFrame.create(people);
console.log(df);`
        }
    ]
});
DataFrame.create = function (arr) {
    return new DataFrame(...arr);
}

////////////////////////////////////////////////////
// DataFrame.prototype.map
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'map',
    async: false,
    returns: 'DataFrame',
    description: 'Maps the rows in a DataFrame using a map function.',
    signatures: [
        [
            {
                parameterName: 'fnMap',
                parameterType: 'function',
                parameterDescription: 'A function which is evaluated for each row. The function accepts up to 3 values: currentValue, Index, and Array. Only currentValue is mandatory.'
            }
        ]
    ],
    examples: [
        {
            name: 'Adding custom calculations to existing data frames.',
            description: `The following example illustrates how to enhance a dataset, by adding a custom calculation to the data frame.`,
            code: `var people = [
  { name: "Tony", sex: "Male", age: 25 },
  { name: "Paul", sex: "Male", age: 17 },
  { name: "Sarah", sex: "Female", age: 42 },
  { name: "Debbie", sex: "Female", age: 62 },
  { name: "Michael", sex: "Male", age: 51 },
  { name: "Jenny", sex: "Female", age: 38 },
  { name: "Frank", sex: "Male", age: 32 },
  { name: "Amy", sex: "Female", age: 29 }
];
              
let df = DataFrame.create(people).map((p)=> { return { ageBand: Math.floor(p.age/10)*10, ...p }});
console.log(df);`
        }
    ]
});
DataFrame.prototype.map = function (fnMap) {
    let baseMap = Array.prototype.map.bind(this);
    return new DataFrame(...baseMap(fnMap));
}

////////////////////////////////////////////////////
// DataFrame.prototype.filter
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'filter',
    async: false,
    returns: 'DataFrame',
    description: 'Filters a data frame based on a filter function.',
    signatures: [
        [
            {
                parameterName: 'fnFilter',
                parameterType: 'function',
                parameterDescription: 'A function which is evaluated for each row. The function accepts up to 3 values: currentValue, Index, and Array. Only currentValue is mandatory.'
            }
        ]
    ],
    examples: [
        {
            name: 'Filtering a dataset.',
            description: `The following example illustrates how filter the people dataset for males only.`,
            code: `var people = [
  { name: "Tony", sex: "Male", age: 25 },
  { name: "Paul", sex: "Male", age: 17 },
  { name: "Sarah", sex: "Female", age: 42 },
  { name: "Debbie", sex: "Female", age: 62 },
  { name: "Michael", sex: "Male", age: 51 },
  { name: "Jenny", sex: "Female", age: 38 },
  { name: "Frank", sex: "Male", age: 32 },
  { name: "Amy", sex: "Female", age: 29 }
];

let df = DataFrame.create(people).filter((p)=> { return p.sex==="Male" });
console.log(df);`
        }
    ]
});
DataFrame.prototype.filter = function (fnFilter) {
    let baseFilter = Array.prototype.filter.bind(this);
    return new DataFrame(...baseFilter(fnFilter));
}

////////////////////////////////////////////////////
// DataFrame.prototype.group
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'group',
    async: false,
    returns: 'DataFrame',
    description: 'Groups a data frame, by providing the group function and the aggregate function. The group function determines the unique groupings for the resulting data frame. The group function can return an object with multiple properties. The aggregation function returns additional aggregation columns.',
    signatures: [
        [
            {
                parameterName: 'fnGroup',
                parameterType: 'function',
                parameterDescription: 'A function which returns the fields which are to be grouped in the resulting data frame.'
            },
            {
                parameterName: 'fnAggregate',
                parameterType: 'function',
                parameterDescription: 'A function which returns the fields which are to be aggregated in the resulting data frame.'
            }
        ]
    ],
    examples: [
        {
            name: 'Grouping a dataset.',
            description: `The following example illustrates how to group a dataset, and add in an aggregation.`,
            code: `var people = [
  { name: "Tony", sex: "Male", age: 25 },
  { name: "Paul", sex: "Male", age: 17 },
  { name: "Sarah", sex: "Female", age: 42 },
  { name: "Debbie", sex: "Female", age: 62 },
  { name: "Michael", sex: "Male", age: 51 },
  { name: "Jenny", sex: "Female", age: 38 },
  { name: "Frank", sex: "Male", age: 32 },
  { name: "Amy", sex: "Female", age: 29 }
];
              
let df = DataFrame
  .create(people)
  .group(
      (g)=> { return { sex: g.sex }},
      (a)=> { return { count: a.length }}
    );
              
console.log(df);`
        }
    ]
});
DataFrame.prototype.group = function (fnKey, fnAggregate) {
    let groups = {};
    this.forEach(function (o) {
        var group = JSON.stringify(fnKey(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        if (!fnAggregate) {
            return JSON.parse(group);
        } else {
            let items = DataFrame.create(groups[group]);
            var agg = fnAggregate(items);
            return { ...JSON.parse(group), ...agg };
        }
    })
}

////////////////////////////////////////////////////
// DataFrame.prototype.pivot
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'pivot',
    async: false,
    returns: 'DataFrame',
    description: 'Pivots rows in a DataFrame object into columns.',
    signatures: [
        [
            {
                parameterName: 'fnGroup',
                parameterType: 'function',
                parameterDescription: 'A function which returns an object containing the properties/values of the key/group.'
            },
            {
                parameterName: 'fnPivot',
                parameterType: 'function',
                parameterDescription: 'A function which returns a number or string value which represents the values to be pivoted into columns.'
            },
            {
                parameterName: 'fnAggregate',
                parameterType: 'function',
                parameterDescription: 'A function which returns a number representing the aggregation of each pivot value for each group.'
            }
        ]
    ],
    examples: [
        {
            name: 'Pivoting a dataset.',
            description: `The following example creates a matrix showing the average age of males/females for each boarding class.`,
            code: `UI.layout(['left','right']);

// Data
let titanic = (await DataFrame.read("demo","titanic"))
    .cast({
        age: 'float'
    });
                            
UI.content(Visuals.table(titanic.head(20)), 'left');
                        
let pvt = titanic.pivot(
    g => {return { pclass: g.pclass }},
    p => p.sex,
    a => a.column("age").avg()
);
                        
UI.content(Visuals.table(pvt), 'right');`
        }
    ]
});
DataFrame.prototype.pivot = function (fnGroup, fnPivot, fnAggregate) {

    // Get distinct values for the pivot function
    let pivot = [];
    this.forEach(function (r) {
        let value = fnPivot(r);
        if (pivot.indexOf(value) === -1)
            pivot.push(value);
    });

    let groups = {};
    this.forEach(function (o) {
        var group = JSON.stringify(fnGroup(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return DataFrame.create(Object.keys(groups).map(function (group) {

        // For each group, loop through each pivot value
        // calculating the value to pivot
        let pivotObj = {}
        pivot.forEach(p => {
            let items = DataFrame.create(groups[group]).filter(r => fnPivot(r) === p);
            let value = fnAggregate(items);
            pivotObj[p] = value;
        });

        return { ...JSON.parse(group), ...pivotObj };
    }));
}


////////////////////////////////////////////////////
// DataFrame.prototype.head
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'head',
    async: false,
    returns: 'DataFrame',
    description: 'Returns the top N items in a dataset. This method should normally be used in conjunction with the sort function.',
    signatures: [
        [
            {
                parameterName: 'top',
                parameterType: 'Number',
                parameterDescription: 'The number of rows to return.'
            }
        ]
    ],
    examples: [
        {
            name: 'Retrieving the first 5 rows from a dataset.',
            description: `The following example returns the first 5 rows from the titanic dataset.`,
            code: `let titanic = (await DataFrame.read("demo","titanic")).head(5);
console.log(titanic);`
        }
    ]
});
DataFrame.prototype.head = function (top) {
    return new DataFrame(...this.splice(0, top));
}

////////////////////////////////////////////////////
// DataFrame.prototype.sort
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'sort',
    async: false,
    returns: 'DataFrame',
    description: 'Returns a sorted DataFrame based on the sort function. The sort function should return the field or calculation to use as the sort.',
    signatures: [
        [
            {
                parameterName: 'fnSort',
                parameterType: 'function',
                parameterDescription: 'The callback function. Takes a parameter of currentValue, and should return a primitive value which is the value that will be sorted.'
            },
            {
                parameterName: 'descendint',
                parameterType: 'boolean',
                parameterDescription: 'Set to true for descending. If the parameter is omitted, the sort will default to ascending order.'
            }
        ]
    ],
    examples: [
        {
            name: 'Retrieving the top 5 rows from a dataset by Age.',
            description: `The following example illustrates how to retrieve the 5 oldest passengers from the titanic dataset.`,
            code: `let oldest5 = (await DataFrame.read("demo","titanic"))
  .map((t) => { return { name: t.name, age: parseFloat(t.age) }})
  .filter((t) => { return !Number.isNaN(t.age) })
  .sort((t) => { return t["age"] }, true)
  .head(5);

console.log(oldest5);`
        }
    ]
});
DataFrame.prototype.sort = function (fnSort, descending) {
    let arr = [...this];
    let reverse = descending ? -1 : 1;
    let sortFunction = (a, b) => { return fnSort(a) > fnSort(b) ? 1 * reverse : -1 * reverse }
    //arr.sort(sortFunction);
    let baseSort = Array.prototype.sort.bind(this);
    baseSort(sortFunction);
    //Array.prototype.sort.apply(arr, sortFunction);
    return new DataFrame(...this);
}

////////////////////////////////////////////////////
// DataFrame.prototype.join
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'join',
    async: false,
    returns: 'DataFrame',
    description: 'Joins another DataFrame / Array to the current Data Frame. Note that currently, only an INNER JOIN is performed.',
    signatures: [
        [
            {
                parameterName: 'data',
                parameterType: 'Array',
                parameterDescription: 'The array or data frame to join to the current data frame.'
            },
            {
                parameterName: 'type',
                parameterType: 'string',
                parameterDescription: 'The type of join. Must be \'inner\', \'left\', \'right\', or \'outer\'.'
            },
            {
                parameterName: 'fnJoin',
                parameterType: 'function',
                parameterDescription: 'A callback function to perform the join. The callback function should take 2 parameters: <b>left</b> and <b>right</b>. Each parameter is an object, and represents a row in either array.'
            },
            {
                parameterName: 'fnSelect',
                parameterType: 'function',
                parameterDescription: 'A callback function to perform the final select from the join. The callback function should take 2 parameters: <b>left</b> and <b>right</b>. Each parameter is an object, and represents the left and right rows that were joined. You can choose to return data from either sides of the join.'
            }
        ]
    ],
    examples: [
        {
            name: 'Joining 2 data frames.',
            description: `The following example illustrates how to join the sales data frame to the customer data frame.`,
            code: `let sales = DataFrame.create([
    {customer:'A1495', sku: 'BH41', qty: 10, unitPrice: 1.45},
    {customer:'G234', sku: 'HF42', qty: 1, unitPrice: 2.00},
    {customer:'F4824', sku: 'AH52', qty: 5, unitPrice: 1.00},
    {customer:'E472', sku: 'IF14', qty: 20, unitPrice: 1.20},
    {customer:'A2235', sku: 'FI42', qty: 5, unitPrice: 1.80},
    {customer:'J942', sku: 'AV91', qty: 2, unitPrice: 2.50},
    {customer:'B1244', sku: 'FY14', qty: 1, unitPrice: 3},
    {customer:'S95', sku: 'FE56', qty: 5, unitPrice: 5},
    {customer:'D424', sku: 'FE39', qty: 1, unitPrice: 2.50},
    {customer:'P1254', sku: 'DD67', qty: 2, unitPrice: 3.00}
]);
            
let customers = DataFrame.create([
    {customer:'A1495', name: 'Paul Allen'},
    {customer:'G234', name: 'Tony George'},
    {customer:'F4824', name: 'Dave Farthing'},
    {customer:'E472', name: 'Simone Earl'},
    {customer:'A2235', name: 'Fiona Abbot' },
    {customer:'J942', name: 'Tracy Jones'},
    {customer:'B1244', name: 'Stan Brown'},
    {customer:'S345', name: 'Michael Smith'},
    {customer:'F254', name: 'Dave Firth'},
    {customer:'J1344', name: 'Stuart Jones' }
]);

let join = sales.join(
    customers,
    'outer',
    (left,right) => { return left.customer === right.customer },
    (left,right) => { return {
        customer: right.customer ?? left.customer ?? null,
        name: right.name ?? null,
        sku: left.customer ?? null,
        qty: left.qty ?? null,
        unitPrice: left.unitPrice ?? null
    }}
);

UI.layout(['left','right','join']);
UI.content(Visuals.table(sales), 'left');
UI.content(Visuals.table(customers), 'right');
UI.content(Visuals.table(join), 'join');`
        }
    ]
});
DataFrame.prototype.join = function (data, type, fnJoin, fnSelect) {
    let results = [];
    let left = [...this];
    let right = [...data];
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
            if (fnJoin(left[i], right[j])) {
                // match
                results.push({
                    left: left[i],
                    right: right[j]
                });
                leftIds.remove(i);
                rightIds.remove(j);
            }
        }
    }

    // Add in outer joins
    if (type === "left" || type === "outer") {
        leftIds.forEach(l => {
            results.push({
                left: left[l],
                right: {}
            });
        });
    }

    if (type === "right" || type === "outer") {
        rightIds.forEach(r => {
            results.push({
                left: {},
                right: right[r]
            });
        });
    }

    // Do select now
    return new DataFrame(...results.map(r => fnSelect(r.left, r.right)));

}

////////////////////////////////////////////////////
// DataFrame.prototype.column
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'column',
    async: false,
    returns: 'Column',
    description: 'Returns a single column from a DataFrame object. Column objects are typically used to perform aggregations over (e.g. count, min, max, sum, avg).',
    signatures: [
        [
            {
                parameterName: 'columnName',
                parameterType: 'string',
                parameterDescription: 'The name of the column.'
            }
        ]
    ],
    examples: [
        {
            name: 'Getting a column',
            description: `The following example illustrates how to get the qty column from a data frame.`,
            code: `let sales = DataFrame.create([
{customer:'A1495', sku: 'BH41', qty: 10, unitPrice: 1.45},
{customer:'G234', sku: 'HF42', qty: 1, unitPrice: 2.00},
{customer:'F4824', sku: 'AH52', qty: 5, unitPrice: 1.00},
{customer:'E472', sku: 'IF14', qty: 20, unitPrice: 1.20},
{customer:'A2235', sku: 'FI42', qty: 5, unitPrice: 1.80},
{customer:'J942', sku: 'AV91', qty: 2, unitPrice: 2.50},
{customer:'B1244', sku: 'FY14', qty: 1, unitPrice: 3},
{customer:'S95', sku: 'FE56', qty: 5, unitPrice: 5},
{customer:'D424', sku: 'FE39', qty: 1, unitPrice: 2.50},
{customer:'P1254', sku: 'DD67', qty: 2, unitPrice: 3.00}
]);
            
let qty = sales.column("qty");
UI.content(qty);`
        }
    ]
});
DataFrame.prototype.column = function (columnName) {
    return new Column(...this.map((r) => r[columnName]));
}

////////////////////////////////////////////////////
// DataFrame.prototype.describe
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'describe',
    async: false,
    returns: 'DataFrame',
    description: `Returns a DataFrame object with a set of descriptive statistics for the current data frame. The following information is returned:
<ul>
    <li><b>name</b> - The name of the column / variable.</li>
    <li><b>type</b> - The data type.</li>
    <li><b>count</b> - The number of rows.</li>
    <li><b>distinct</b> - The number of distinct, non-null values.</li>
    <li><b>fill</b> - The proportion of non-null values. 1 signifies that all rows have a value. 0 signifies that all rows are null.</li>
    <li><b>mode</b> - The most frequently occuring value(s).</li>
    <li><b>mean</b> - The mean of the values.</li>
    <li><b>min</b> - The minimum value.</li>
    <li><b>q1</b> - The Q1 value.</li>
    <li><b>median</b> - The median or Q2 value.</li>
    <li><b>q3</b> - The Q3 value.</li>
    <li><b>max</b> - The maximum value.</li>
</ul>`,
    signatures: [],
    examples: [
        {
            name: 'Getting descriptive statistics',
            description: `The following example illustrates how to get the descriptive statistics from the Titanic dataset.`,
            code: `UI.layout('root');
            
let titanic = (await DataFrame.read("demo","titanic"));
            
titanic = titanic
    .cast({
        age: 'int',
        ticket: 'int',
        fare: 'float'
    })
    .describe();
            
UI.content(Visuals.table(titanic), 'root');`
        }
    ]
});
DataFrame.prototype.describe = function () {
    let first = this[0];
    let props = Object.getOwnPropertyNames(first);
    let results = [];
    props.forEach(p => {
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
            max: column.values().max()
        });
    });
    return new DataFrame(...results);
}

////////////////////////////////////////////////////
// DataFrame.prototype.cast
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'cast',
    async: false,
    returns: 'DataFrame',
    description: 'Changes the data types of specified columns.',
    signatures: [
        [
            {
                parameterName: 'types',
                parameterType: 'object',
                parameterDescription: 'An object defining the cast rules. The object should contain a property for each column name you want to change the type for. The value of the property should be either \'int\', \'float\' or \'string\'.'
            }
        ]
    ],
    examples: [
        {
            name: 'Changing column types',
            description: `The following example illustrates how to change column types on the Titanic dataset.`,
            code: `UI.layout('root');
                        
let titanic = (await DataFrame.read("demo","titanic"))
    .cast({
        age: 'int',
        fare: 'float'
    })
    .head(10);
UI.content(titanic);`
        }
    ]
});
DataFrame.prototype.cast = function (types) {

    var columnsToCast = Object.getOwnPropertyNames(types);
    var convertedValues = {};

    let castFunctions = {
        'int': parseInt,
        'float': parseFloat
    };

    let ret = this.map((row) => {

        let convertedValues = columnsToCast.reduce((acc, cur) => {

            return {
                ...acc,
                [cur]: castFunctions[types[cur]](row[cur])
            };
        }, {});

        return {
            ...row,
            ...convertedValues
        };

    });

    return new DataFrame(...ret);
}

////////////////////////////////////////////////////
// DataFrame.prototype.remove
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'remove',
    async: false,
    returns: 'DataFrame',
    description: 'Deletes one or more columns from a DataFrame.',
    signatures: [
        [
            {
                parameterName: 'columnNames',
                parameterType: 'Array',
                parameterDescription: 'Array of column names to delete.'
            }
        ]
    ],
    examples: [
        {
            name: 'Removing columns from a DataFrame.',
            description: `The following example illustrates how to delete columns from the Titanic dataset.`,
            code: `let titanic = await DataFrame.read("demo","titanic");
titanic = titanic.remove(['ticket','fare','cabin','embarked','boat','body','home.dest'])            
UI.content(Visuals.table(titanic.head(10)));`
        }
    ]
});
DataFrame.prototype.remove = function (columnNames) {

    this.forEach((row) => {
        columnNames.forEach(c => {
            delete row[c];
        });
    });

    return new DataFrame(...this);
}

////////////////////////////////////////////////////
// DataFrame.prototype.select
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'DataFrame',
    static: false,
    name: 'select',
    async: false,
    returns: 'DataFrame',
    description: 'Selects only certain columns from a DataFrame.',
    signatures: [
        [
            {
                parameterName: 'columnNames',
                parameterType: 'Array',
                parameterDescription: 'Array of column names to include.'
            }
        ]
    ],
    examples: [
        {
            name: 'Selecting columns from a DataFrame.',
            description: `The following example illustrates how to select certain columns from the Titanic dataset.`,
            code: `let titanic = await DataFrame.read("demo","titanic");
titanic = titanic.select(['pclass','suvived','name','sex','age'])            
UI.content(Visuals.table(titanic.head(10)));`
        }
    ]
});
DataFrame.prototype.select = function (columnNames) {

    let results = []
    this.forEach((row) => {
        let obj = {};
        columnNames.forEach(c => {
            obj[c] = row[c];
        });
        results.push(obj);
    });

    return new DataFrame(...results);
}
