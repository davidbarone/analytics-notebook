////////////////////////////////////////////////////
//
// Column
//
// Provides functions to aggregate values in a
// column. Includes:
//
// count()
// distinct()
// sum()
// min()
// max()
// avg()
// percentile()
// values()
////////////////////////////////////////////////////
function Column() {
    var arr = [];
    arr.push.apply(arr, arguments);
    arr.__proto__ = Column.prototype;
    return arr;
}
Column.prototype = new Array;

////////////////////////////////////////////////////
// Column.prototype.count
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'count',
    async: false,
    returns: 'number',
    description: 'Returns the count of items in a column.',
    signatures: [],
    examples: [
        {
            name: 'Getting the row count of a column',
            description: `The following example illustrates how to get the row count of a column.`,
            code: `let titanic = await DataFrame.read("Demo","titanic");
UI.content(titanic.column("age").count());`
        }
    ]
});
Column.prototype.count = function () {
    return this.length;
}

////////////////////////////////////////////////////
// Column.prototype.sum
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'sum',
    async: false,
    returns: 'number',
    description: 'Returns the sum of items in a column. Nulls are ignored.',
    signatures: [],
    examples: [
        {
            name: 'Getting the sum of a column',
            description: `The following example illustrates using the sum() to calculate the survivors on the titanic.`,
            code: `let titanic = await DataFrame.read("Demo","titanic");
UI.content(titanic.column("survived").sum());`
        }
    ]
});
Column.prototype.sum = function () {
    return this.values().reduce((acc, cur) => acc + cur, 0);
}

////////////////////////////////////////////////////
// Column.prototype.min
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'min',
    async: false,
    returns: 'number',
    description: 'Returns the minimum value of items in a column. Nulls are ignored',
    signatures: [],
    examples: [
        {
            name: 'Getting the minimum value of a column',
            description: `The following example illustrates getting the minimum value from a column.`,
            code: `let titanic = await DataFrame.read("Demo","titanic");
UI.content(titanic.column("name").min());`
        }
    ]
});
Column.prototype.min = function () {
    return this.values().reduce((acc, cur) => acc <= cur ? acc : cur);
}

////////////////////////////////////////////////////
// Column.prototype.min
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'max',
    async: false,
    returns: 'number',
    description: 'Returns the maximum value of items in a column. Nulls are ignored.',
    signatures: [],
    examples: [
        {
            name: 'Getting the maximum value of a column',
            description: `The following example illustrates getting the maximum value from a column.`,
            code: `let titanic = await DataFrame.read("Demo","titanic");
UI.content(titanic.column("name").max());`
        }
    ]
});
Column.prototype.max = function () {
    return this.values().reduce((acc, cur) => acc >= cur ? acc : cur);
}

////////////////////////////////////////////////////
// Column.prototype.avg
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'avg',
    async: false,
    returns: 'number',
    description: 'Returns the average number of items in a column. Nulls are ignored.',
    signatures: [],
    examples: [
        {
            name: 'Getting the average value of a column',
            description: `The following example illustrates getting the average value from a column.`,
            code: `let titanic = await DataFrame.read("demo","titanic");
let ages = titanic
    .filter(t=>!isNaN(t.age))
    .map(t=>{return{...t, age: parseFloat(t.age)}})
    .column("age");
UI.content(ages.avg());`
        }
    ]
});
Column.prototype.avg = function () {
    return this.values().reduce((acc, cur) => acc + cur, null) / this.length;
}

////////////////////////////////////////////////////
// Column.prototype.percentile
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'percentile',
    async: false,
    returns: 'number',
    description: 'Returns the specified percentile of a list of numbers. Nulls are ignored.',
    signatures: [
        [
            {
                parameterName: 'percent',
                parameterType: 'number',
                parameterDescription: 'The percentile must be between 0 and 100.'
            }
        ]
    ],
    examples: [
        {
            name: 'Getting the 25th percentile (Q1) value of a column.',
            description: `The following example illustrates getting the 25th percentile of ages of passengers on the Titanic.`,
            code: `let titanic = (await DataFrame
    .read("demo","titanic"))
    .map(t=> {return {age:parseFloat(t.age)}})
    .filter(t=>!isNaN(t.age));
            
let q1 = titanic.column("age").percentile(25);
UI.content(q1);`
        }
    ]
});
Column.prototype.percentile = function (percent) {
    const sorted = this.values().sort((a, b) => a > b ? 1 : -1);
    const pos = Math.ceil((sorted.length - 1) * (percent / 100));
    return sorted[pos];
}

////////////////////////////////////////////////////
// Column.prototype.values
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'values',
    async: false,
    returns: 'Column',
    description: 'Returns a list of non-null values (including duplicates).',
    signatures: [],
    examples: [
        {
            name: 'Getting a list of non-null values',
            description: `The following example illustrates getting the non-null values from a column.`,
            code: `let titanic = (await DataFrame
    .read("demo","titanic"))
    .cast({age: 'float'})
    .column("age")
    .values()
            
UI.content(titanic);`
        }
    ]
});
Column.prototype.values = function () {
    return new Column(...this.filter(i => i));
}

////////////////////////////////////////////////////
// Column.prototype.distinct
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'distinct',
    async: false,
    returns: 'Column',
    description: 'Returns a list of unique non-null values (excluding duplicates).',
    signatures: [],
    examples: [
        {
            name: 'Getting a distinct list of non-null values',
            description: `The following example illustrates getting all the distinct non-null values from a column.`,
            code: `let titanic = (await DataFrame
    .read("demo","titanic"))
    .cast({age: 'float'})
    .column("age")
    .distinct()
            
UI.content(titanic);`
        }
    ]
});
Column.prototype.distinct = function () {
    let unique = [];
    unique.pushUnique(...this.values());
    return new Column(...unique);
}

////////////////////////////////////////////////////
// Column.prototype.type
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'type',
    async: false,
    returns: 'string',
    description: 'Returns the data type of the column. The Javascript type for the first value is used.',
    signatures: [],
    examples: [
        {
            name: 'Getting the data type of a column',
            description: `The following example illustrates how to get the data type of a column.`,
            code: `let titanic = await DataFrame.read("Demo","titanic");
UI.content(titanic.column("age").type());`
        }
    ]
});
Column.prototype.type = function () {
    let type = "undefined";
    if (this.length > 0) {
        type = typeof (this[0]);
    }
    return type;
}

////////////////////////////////////////////////////
// Column.prototype.mode
////////////////////////////////////////////////////
documentation.operations.push({
    class: 'Column',
    static: false,
    name: 'mode',
    async: false,
    returns: 'Array',
    description: 'Returns the most frequent value(s). There can be more than 1 mode in a set of values.',
    signatures: [],
    examples: [
        {
            name: 'Getting the mode of a set of values',
            description: `The following example illustrates how to get the mode for a set of values.`,
            code: `let values = new Column(1,5,3,7,3,7,8,12,15);
UI.content(values.mode());`
        }
    ]
});
Column.prototype.mode = function () {

    let obj = {};
    let arr = [];
    this.values().forEach((row) => {
        if (!obj[row]) {
            obj[row] = 0;
        }
        obj[row] = obj[row] + 1;
    });

    Object.getOwnPropertyNames(obj).forEach(i => {
        arr.push({ value: i, count: obj[i] })
    });

    // Sort in descending order
    arr.sort((a, b) => { return a.count > b.count ? -1 : 1 });

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
