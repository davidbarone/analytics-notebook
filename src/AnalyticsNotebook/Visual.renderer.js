/**
 * Default table renderer function.
 * @param {*} dataFrame
 * @param {*} options
 */
Visual.renderer.table = function (dataFrame, options) {
  let first = dataFrame.data[0];
  let columns = Object.getOwnPropertyNames(first);

  let html = "";

  html += "<table>";
  html += "<tr>";

  columns.forEach((c) => (html += `<th>${c}</th>`));
  html += "</tr>";

  dataFrame.data.forEach((r) => {
    html += "<tr>";
    columns.forEach((c) => {
      html += `<td>${r[c]}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  let elDiv = document.createElement("div");
  elDiv.style.margin = "4px 0px";
  elDiv.innerHTML = html;
  return elDiv;
};

Visual.renderer.slicer = function (dataFrame, options) {
  let elDiv = document.createElement("div");
  if (options.title) {
    let elTitle = document.createElement("h5");
    elTitle.innerText = options.title;
    elDiv.appendChild(elTitle);
  }

  elSelect = document.createElement("select");
  let values = dataFrame.list(options.columnName).unique().arr;

  elSelect.addEventListener("change", function (evt) {
    // Slice the dataFrame
    let value = evt.target.value;
    if (value) {
      let slicer = {};
      slicer[options.columnName] = [value];
      dataFrame.slice(slicer);
    } else {
      dataFrame.reset();
    }
  });

  let elAll = document.createElement("option");
  elAll.value = null;
  elAll.text = "<select value>";
  elSelect.appendChild(elAll);

  // If slicer context already set, automatically set value
  let slicer = dataFrame.slicers[options.columnName];
  let selectedValue = null;
  if (slicer) {
    //values = values.filter(v => { slicer.includes(v) });
    //alert(values.length);
    selectedValue = values[0];
  }

  values.forEach((v) => {
    let elOption = document.createElement("option");
    elOption.value = v;
    elOption.text = v;
    elOption.selected = v === selectedValue;
    elSelect.appendChild(elOption);
  });

  elReset = document.createElement("button");
  elReset.innerText = "Clear";
  elReset.addEventListener("click", function (evt) {
    dataFrame.reset();
  });

  elDiv.appendChild(elSelect);
  elDiv.appendChild(elReset);
  return elDiv;
};

/**
 * Renders a bar or grouped bar chart.
 * @param {DataFrame} dataFrame - The data to bind to the chart.
 * @param {Object} options - Configuration of the chart.
 */
Visual.renderer.bar = function (dataFrame, options) {
  options = {
    ...{
      height: 300,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      title: "",
      fnCategories: null,
      fnSubGroups: null,
      fnValues: null,
      axes: {
        x: {
          display: true,
          title: "",
        },
        y: {
          display: true,
          title: "",
        },
      },
      border: {
        width: 0,
        color: "black",
        radius: 8,
        background: "#fff",
      },
    },
    ...options,
  };

  // Get category name (only 1 allowed)
  let categoryName = "";
  if (options.fnCategories) {
    categoryName = Object.getOwnPropertyNames(
      options.fnCategories(dataFrame.head(1))
    )[0];
  }
  let subGroups = [];
  console.log(dataFrame.data);

  // Data must be aggregated to display on the chart:
  if (options.fnSubGroups) {
    // subgroup specified. The names are pivoted as column headers.
    // Only use the 1st value field.
    let subGroupName = Object.getOwnPropertyNames(
      options.fnSubGroups(dataFrame.head(1))
    )[0];
    subGroups = dataFrame
      .map((row) => options.fnSubGroups(row))
      .column(subGroupName)
      .unique();
    let valueName = Object.getOwnPropertyNames(
      options.fnValues(dataFrame.head(1))
    )[0];
    dataFrame = dataFrame.pivot(
      options.fnCategories,
      (p) => options.fnSubGroups(p)[subGroupName],
      (a) => options.fnValues(a)[valueName]
    );
  } else {
    alert("no sub groups");
    // just value(s) specified. These are already column headers.
    // if no subGroups function specified, the subGroups are the names of the values function
    console.log("aa");
    subGroups = Object.getOwnPropertyNames(options.fnValues(dataFrame.head(1)));
    console.log(dataFrame.data);
    dataFrame = dataFrame.group(options.fnCategories, options.fnValues);
  }

  console.log(dataFrame.data);

  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = options.width - margin.left - margin.right,
    height = options.height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", options.width)
    .attr("height", options.height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // border
  if (options.border) {
    var border = svg
      .append("rect")
      .attr("x", -margin.left)
      .attr("y", -margin.top)
      .attr("height", options.height)
      .attr("width", options.width)
      .style("stroke", options.border.color)
      .style("fill", "none")
      .style("stroke-width", options.border.width)
      .attr("rx", options.border.radius);

    if (options.border.background) {
      border.style("fill", options.border.background);
    }
  }

  // title?
  if (options.title) {
    svg
      .append("text")
      .attr("x", options.width / 2 - margin.left)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text(options.title);
  }

  // X axis
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      dataFrame.map(function (d) {
        return d[categoryName];
      })
    )
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // X axis title?
  if (options.axes.x.title) {
    svg
      .append("text") // text label for the x axis
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", height + margin.top + margin.bottom - 12)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(options.axes.x.title);
  }

  // Add Y axis
  let maxValue = 0;
  subGroups.forEach((g) => {
    let value = d3.max(dataFrame.data, function (d) {
      return +d[g];
    });
    if (value > maxValue) {
      maxValue = value;
    }
  });

  var y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3
    .scaleBand()
    .domain(subGroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette = one color per subgroup
  var color = d3
    .scaleOrdinal()
    .domain(subGroups)
    .range(["#e41a1c", "#377eb8", "#4daf4a"]);

  // Bars
  svg
    .selectAll("mybar")
    .data(dataFrame.data)
    .enter()

    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d[categoryName]) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return subGroups.map(function (key) {
        return { key: key, value: d[key] };
      });
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xSubgroup(d.key);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .attr("fill", function (d) {
      return color(d.key);
    });

  return svg.node().parentNode;
};

/**
 * Renderer that renders static content. The dataFrame object is ignored.
 * @param {*} dataFrame
 * @param {*} options
 */
Visual.renderer.html = function (dataFrame, options) {
  let elDiv = document.createElement("div");
  let html = options.html || "";
  elDiv.innerHTML = html;
  return elDiv;
};

/**
 * Renders a pie chart.
 * @param {*} dataFrame
 * @param {*} options
 */
Visual.renderer.pie = function (dataFrame, options) {
  options = {
    ...{
      height: 300,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      title: "",
      fnCategories: null,
      fnValues: null,
      border: {
        width: 0,
        color: "black",
        radius: 8,
        background: "#fff",
      },
    },
    ...options,
  };

  // Format data
  let categoryName = Object.getOwnPropertyNames(
    options.fnCategories(dataFrame.data[0])
  )[0];
  let valueName = Object.getOwnPropertyNames(options.fnValues(dataFrame))[0];
  let data = dataFrame
    .group(options.fnCategories, options.fnValues)
    .data.toObject(categoryName, valueName);

  // set the dimensions and margins of the graph
  var width = options.width;
  height = options.height;
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

/**
 * Renders a histogram.
 * @param {*} dataFrame
 * @param {*} options
 */
Visual.renderer.hist = function (dataFrame, options) {
  options = {
    ...{
      height: 300,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      title: "",
      fnValues: null,
      border: {
        width: 0,
        color: "black",
        radius: 8,
        background: "#fff",
      },
    },
    ...options,
  };

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
  let valueName = Object.getOwnPropertyNames(options.fnValues(dataFrame))[0];
  let data = dataFrame.list(valueName);

  // X axis: scale and draw:
  let minValue = data.min();
  let maxValue = data.max();
  var x = d3.scaleLinear().domain([minValue, maxValue]).range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3
    .histogram()
    .value(function (d) {
      return d;
    }) // I need to give the vector of value
    .domain(x.domain()) // then the domain of the graphic
    .thresholds(x.ticks(50)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data.arr);

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

Visual.renderer.scatter = function (dataFrame, options) {
  //Visual.renderer.scatter = function (data, xColumnName, yColumnName, options) {

  options = {
    ...{
      height: 300,
      width: 400,
      margin: {
        top: 10,
        right: 30,
        bottom: 30,
        left: 60,
      },
      title: "",
      fnXValues: null,
      fnYValues: null,
      axes: {
        x: {
          display: true,
          title: "",
        },
        y: {
          display: true,
          title: "",
        },
      },
      border: {
        width: 0,
        color: "black",
        radius: 8,
        background: "#fff",
      },
    },
    ...options,
  };

  // Get column names
  let xColumnName = Object.getOwnPropertyNames(
    options.fnXValues(dataFrame.data[0])
  )[0];
  let yColumnName = Object.getOwnPropertyNames(
    options.fnYValues(dataFrame.data[0])
  )[0];

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
  let minXValue = d3.min(dataFrame.data, function (d) {
    return +d[xColumnName];
  });
  let maxXValue = d3.max(dataFrame.data, function (d) {
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
  let minYValue = d3.min(dataFrame.data, function (d) {
    return +d[yColumnName];
  });
  let maxYValue = d3.max(dataFrame.data, function (d) {
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
    .data(dataFrame.data)
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

/**
 * Draws a boxplot diagram. Boxplot diagrams are useful for showing the 5-number summary of a continuous variable.
 * The function will automatically include a boxplot for every numeric variable in the DataFrame object.
 * @param {*} dataFrame - The data
 * @param {*} options - The configuration of the boxplot
 */
Visual.renderer.box = function (dataFrame, options) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // Get the 1st numeric column
  let columns = [];
  let properties = Object.getOwnPropertyNames(dataFrame.data[0]);
  properties.forEach((p) => {
    if (dataFrame.list(p).type() === "number") {
      columns.push(p);
    }
  });

  let columnName = columns[0];

  // append the svg object to the body of the page
  var svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create dummy data
  var data = dataFrame.list(columnName);
  //var data = [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 20, 12, 11, 9];

  // Compute summary statistics used for the box:
  var data_sorted = data.arr.sort(d3.ascending);
  var q1 = d3.quantile(data_sorted, 0.25);
  var median = d3.quantile(data_sorted, 0.5);
  var q3 = d3.quantile(data_sorted, 0.75);
  var interQuantileRange = q3 - q1;
  var min = q1 - 1.5 * interQuantileRange;
  var max = q1 + 1.5 * interQuantileRange;

  // Show the X scale
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain([columnName])
    .paddingInner(1)
    .paddingOuter(0.5);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

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
