////////////////////////////////////////////////////
//
// Visuals
//
// Functions to create visual nodes. Includes:
//
// hist()
// bar()
// scatter()
// table()
////////////////////////////////////////////////////

class Visuals {}

////////////////////////////////////////////////////
// Visuals.bar
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "bar",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML bar chart node based on a Data Frame containing data. A bar chart can contain multiple values. Alternatively, if a single measure is provided, an optional sub-group can be specified.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render in the pie chart.",
      },
      {
        parameterName: "categoryName",
        parameterType: "string",
        parameterDescription:
          "The column name used for the bar chart categories (x-axis).",
      },
      {
        parameterName: "valueName",
        parameterType: "string",
        parameterDescription:
          "The column name used for the bar chart values (y-axis).",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a bar chart.",
      description: `The following example displays a bar chart to the output.`,
      code: `var sales = [
  { country: "UK", amount: 48318 },
  { country: "US", amount: 72421 },
  { country: "Japan", amount: 18471 },
  { country: "Europe", amount: 14344 }
];
UI.content(Visuals.bar(DataFrame.create(sales), 'country', 'amount'));`,
    },
    {
      name: "Displaying a bar chart with a pivot column.",
      description: `The following example displays a bar chart to the output.`,
      code: `let titanic = await DataFrame.read("demo","titanic");

UI.layout(['root']);
            
let chart = Visuals.bar(titanic, {
    fnCategories: g=> {return {embarked: g.embarked}},
    fnSubGroups: p=> {return {sex: p.sex}},
    fnValues: a=> {return {survived: a.column('survived').count()}}
});
            
UI.content(chart, 'root');`,
    },
  ],
});

////////////////////////////////////////////////////
// Visuals.table
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "table",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML table node based on a Data Frame containing data.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render as a table.",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a table.",
      description: `The following example displays a table to the output.`,
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
UI.content(Visuals.table(DataFrame.create(people)));`,
    },
  ],
});
Visuals.table = function (data) {
  let first = data[0];
  let columns = Object.getOwnPropertyNames(first);

  let html = "";

  html += "<table>";
  html += "<tr>";

  columns.forEach((c) => (html += `<th>${c}</th>`));
  html += "</tr>";

  data.forEach((r) => {
    html += "<tr>";
    columns.forEach((c) => {
      html += `<td>${r[c]}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  return html;
};

////////////////////////////////////////////////////
// Visuals.pie
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "pie",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML pie chart node based on a Data Frame containing data.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render in the pie chart.",
      },
      {
        parameterName: "categoryName",
        parameterType: "string",
        parameterDescription:
          "The column name used for the pie segment categories.",
      },
      {
        parameterName: "valueName",
        parameterType: "string",
        parameterDescription: "The column name used for the pie segment sizes.",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a pie.",
      description: `The following example displays a table to the output.`,
      code: `var sales = [
  { country: "UK", amount: 48318 },
  { country: "US", amount: 72421 },
  { country: "Japan", amount: 18471 },
  { country: "Europe", amount: 14344 }
];
UI.content(Visuals.pie(DataFrame.create(sales), 'country', 'amount'));`,
    },
  ],
});
Visuals.pie = function (data, categoryName, valueName) {
  // convert the data frame into simple object.
  // Pie just just needs keys/values
  data = data.toObject(categoryName, valueName);

  // set the dimensions and margins of the graph
  var width = 450;
  height = 450;
  margin = 10;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2 - margin;

  // append the svg object to the div called 'my_dataviz'
  var svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // set the color scale
  var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);

  // Compute the position of each group on the pie:
  var pie = d3.pie().value(function (d) {
    return d.value;
  });
  var data_ready = pie(d3.entries(data));
  // Now I know that group A goes from 0 degrees to x degrees and so on.

  // shape helper to build arcs:
  var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", function (d) {
      return color(d.data.key);
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  // Now add the annotation. Use the centroid method to get the best coordinates
  svg
    .selectAll("mySlices")
    .data(data_ready)
    .enter()
    .append("text")
    .text(function (d) {
      return d.data.key;
    })
    .attr("transform", function (d) {
      return "translate(" + arcGenerator.centroid(d) + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", 17);

  return svg.node().parentNode;
};

////////////////////////////////////////////////////
// Visuals.hist
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "hist",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML histogram chart node based on a Data Frame containing data.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render in the pie chart.",
      },
      {
        parameterName: "columnName",
        parameterType: "string",
        parameterDescription:
          "The name of the column to draw a histogram for. The column should be a numeric column.",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a histogram.",
      description: `The following example displays a histogram of the ages of passengers on the titanic.`,
      code: `let titanic = (await DataFrame.read("demo","titanic"));
let ageHist = Visuals.hist(titanic, "age");
UI.content(ageHist);`,
    },
  ],
});
Visuals.hist = function (data, columnName) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // get the data

  // X axis: scale and draw:
  let minValue = d3.min(data, function (d) {
    return +d[columnName];
  });
  let maxValue = d3.max(data, function (d) {
    return +d[columnName];
  });
  var x = d3.scaleLinear().domain([minValue, maxValue]).range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3
    .histogram()
    .value(function (d) {
      return d[columnName];
    }) // I need to give the vector of value
    .domain(x.domain()) // then the domain of the graphic
    .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear().range([height, 0]);
  y.domain([
    0,
    d3.max(bins, function (d) {
      return d.length;
    }),
  ]); // d3.hist has to be called before the Y axis obviously
  svg.append("g").call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  svg
    .selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", 1)
    .attr("transform", function (d) {
      return "translate(" + x(d.x0) + "," + y(d.length) + ")";
    })
    .attr("width", function (d) {
      return x(d.x1) - x(d.x0) - 1;
    })
    .attr("height", function (d) {
      return height - y(d.length);
    })
    .style("fill", "#69b3a2");

  return svg.node().parentNode;
};

////////////////////////////////////////////////////
// Visuals.scatter
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "scatter",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML scatter chart node based on a Data Frame containing data.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render in the pie chart.",
      },
      {
        parameterName: "xColumnName",
        parameterType: "string",
        parameterDescription:
          "The name of the column to place on the x-axis of the scatter plot. The column should be a numeric column.",
      },
      {
        parameterName: "yColumnName",
        parameterType: "string",
        parameterDescription:
          "The name of the column to place on the y-axis of the scatter plot. The column should be a numeric column.",
      },
      {
        parameterName: "options",
        parameterType: "object",
        parameterDescription: `An object configuring options for the chart. The options are as follows:
<pre>
{
    height: 400,        // height of scatterplot
    width: 400,         // width of scatterplot
    title: ''           // title of scatterplot         
}
</pre>`,
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a scatter plot.",
      description: `The following example displays a scatter plot of titanic passenger data, comparing age and fare variables.`,
      code: `let titanic = (await DataFrame.read("demo","titanic"));
let scat = Visuals.scatter(titanic, "age", "fare");
UI.content(scat);`,
    },
  ],
});
Visuals.scatter = function (data, xColumnName, yColumnName, options) {
  options = {
    ...{
      height: 400,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      axes: {
        x: {
          display: true,
        },
        y: {
          display: true,
        },
      },
      title: "",
    },
    ...options,
  };

  // set the dimensions and margins of the graph
  var margin = options.margin,
    width = options.width - margin.left - margin.right,
    height = options.height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  let minXValue = d3.min(data, function (d) {
    return +d[xColumnName];
  });
  let maxXValue = d3.max(data, function (d) {
    return +d[xColumnName];
  });
  var x = d3.scaleLinear().domain([minXValue, maxXValue]).range([0, width]);

  if (options.axes.x.display) {
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  }

  // Add Y axis
  let minYValue = d3.min(data, function (d) {
    return +d[yColumnName];
  });
  let maxYValue = d3.max(data, function (d) {
    return +d[yColumnName];
  });
  var y = d3.scaleLinear().domain([minYValue, maxYValue]).range([height, 0]);

  if (options.axes.y.display) {
    svg.append("g").call(d3.axisLeft(y));
  }

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d[xColumnName]);
    })
    .attr("cy", function (d) {
      return y(d[yColumnName]);
    })
    .attr("r", 1.5)
    .style("fill", "#69b3a2");

  return svg.node().parentNode;
};

////////////////////////////////////////////////////
// Visuals.box
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "box",
  async: false,
  returns: "Node",
  description:
    "Creates an HTML boxplot diagram for a column of numeric values.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to render in the pie chart.",
      },
      {
        parameterName: "xColumnName",
        parameterType: "string",
        parameterDescription:
          "The name of the column to place on the x-axis of the scatter plot. The column should be a numeric column.",
      },
      {
        parameterName: "yColumnName",
        parameterType: "string",
        parameterDescription:
          "The name of the column to place on the y-axis of the scatter plot. The column should be a numeric column.",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a boxplot.",
      description: `The following example displays a boxplot for the ages of the Titanic passengers.`,
      code: `let titanic = (await DataFrame
    .read("demo","titanic"))
    .map(t=> {return {age:parseFloat(t.age)}})
    .filter(t=>!isNaN(t.age));
let bp = Visuals.box(titanic, "age");
UI.content(bp);`,
    },
  ],
});
Visuals.box = function (data, columnName) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create dummy data
  var data = data.column(columnName);
  //var data = [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 20, 12, 11, 9];

  // Compute summary statistics used for the box:
  var data_sorted = data.sort(d3.ascending);
  var q1 = d3.quantile(data_sorted, 0.25);
  var median = d3.quantile(data_sorted, 0.5);
  var q3 = d3.quantile(data_sorted, 0.75);
  var interQuantileRange = q3 - q1;
  var min = q1 - 1.5 * interQuantileRange;
  var max = q1 + 1.5 * interQuantileRange;

  // Show the Y scale
  var y = d3.scaleLinear().domain([min, max]).range([height, 0]);
  svg.call(d3.axisLeft(y));

  // a few features for the box
  var center = 200;
  var width = 100;

  // Show the main vertical line
  svg
    .append("line")
    .attr("x1", center)
    .attr("x2", center)
    .attr("y1", y(min))
    .attr("y2", y(max))
    .attr("stroke", "black");

  // Show the box
  svg
    .append("rect")
    .attr("x", center - width / 2)
    .attr("y", y(q3))
    .attr("height", y(q1) - y(q3))
    .attr("width", width)
    .attr("stroke", "black")
    .style("fill", "#69b3a2");

  // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("x1", center - width / 2)
    .attr("x2", center + width / 2)
    .attr("y1", function (d) {
      return y(d);
    })
    .attr("y2", function (d) {
      return y(d);
    })
    .attr("stroke", "black");

  return svg.node().parentNode;
};

////////////////////////////////////////////////////
// Visuals.pairs
////////////////////////////////////////////////////
documentation.operations.push({
  class: "Visuals",
  static: true,
  name: "pairs",
  async: false,
  returns: "Node",
  description:
    "Creates scatterplot matrix showing relationship between numerical variables in a DataFrame object.",
  signatures: [
    [
      {
        parameterName: "data",
        parameterType: "DataFrame",
        parameterDescription: "The data frame to analyse.",
      },
    ],
  ],
  examples: [
    {
      name: "Displaying a scatterplot matrix.",
      description: `The following example displays a scatterplot matrix for the iris dataset.`,
      code: `let iris = await DataFrame.read("demo","iris");
let pairs = Visuals.pairs(iris);
UI.layout('root');
UI.content(pairs, 'root');`,
    },
  ],
});
Visuals.pairs = function (data) {
  let columns = [];
  let properties = Object.getOwnPropertyNames(data[0]);
  properties.forEach((p) => {
    if (data.column(p).type() === "number") {
      columns.push(p);
    }
  });

  // Create table with columns.length+1 columns/rows
  let table = document.createElement("table");
  let header = table.createTHead();
  let row = header.insertRow(0);
  let cell = row.insertCell(0);
  cell.innerHTML = "&nbsp;";

  // headers
  columns.forEach((c) => {
    cell = row.insertCell();
    cell.innerHTML = c;
  });

  // now loop through each row.
  columns.forEach((c1) => {
    row = table.insertRow();
    let cell = row.insertCell();
    cell.innerHTML = c1;
    columns.forEach((c2) => {
      let cell = row.insertCell();
      // get scatterplot for 2 variables
      let scat = Visuals.scatter(data, c1, c2, {
        width: 100,
        height: 100,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        axes: {
          x: { display: false },
          y: { display: false },
        },
      });
      cell.appendChild(scat);
    });
  });

  return table;
};

Visuals.slicer = function (data, columnName) {
  elSelect = document.createElement("select");
  let values = data.column(columnName).distinct();

  values.forEach((v) => {
    let elOption = document.createElement("option");
    elOption.value = v;
    elOption.text = v;
    elSelect.appendChild(elOption);
  });

  return elSelect;
};
