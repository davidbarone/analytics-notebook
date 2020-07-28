/**
 * A visual represents any visual component rendered in the output, for example tables and charts.
 */
class Visual {
  /**
   * Creates a new visual.
   * @param {DataFrame} dataFrame - Data being bound to the visual.
   * @param {} renderer - The rendering function used to draw the visual.
   * @param {Object} options - configuration for the rendering. This is renderer-specific.
   */
  constructor(dataFrame, renderer, options) {
    this.dataFrame = dataFrame;
    this.options = options;
    this.renderer = renderer;
    this.panelId = null; // set by assign
    walk(this);
    Visual.visuals.push(this);
  }

  // object that contains the assignments of visual <-> panel
  // Each property is an array of visuals. Id = Panel.id.
  static watchers = [];

  // Registry of all visuals pushed
  static visuals = [];

  /**
   * Attaches the visual to a panel in the output.
   * @param {String} panelId - The id of the panel to attach the visual to.
   */
  attach(panelId) {
    this.panelId = panelId;
    const watcher = new Watcher(
      () => this.dataFrame.data,
      (val) => this.render()
    );
  }

  /**
   * Redraws the current visual and all other visuals in the same panel. Re-rendering
   * typically occurs when data is sliced via interactive visuals.
   */
  render() {
    // clear the panel + redraw all visuals in the panel.
    let id = this.panelId;
    UI.clear(id);
    Visual.visuals.forEach((c) => {
      let content = c.renderer(c.dataFrame, c.options);
      let id = c.panelId;
      UI.content(content, id);
    });
  }
}

/**
 * Default table renderer function.
 * @param {*} dataFrame
 * @param {*} options
 */
Visual.table = function (dataFrame, options) {
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
  elDiv.innerHTML = html;
  return elDiv;
};

Visual.slicer = function (dataFrame, options) {
  let elDiv = document.createElement("div");
  if (options.title) {
    let elTitle = document.createElement("h5");
    elTitle.innerText = options.title;
    elDiv.appendChild(elTitle);
  }

  elSelect = document.createElement("select");
  let values = dataFrame.column(options.columnName).distinct();

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
Visual.bar = function (dataFrame, options) {
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
  console.log(dataFrame.data);
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
