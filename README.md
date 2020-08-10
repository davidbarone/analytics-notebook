# Analytics-Notebook

- [Analytics-Notebook](#analytics-notebook)
  - [Application Layout](#application-layout)
    - [Code Section](#code-section)
    - [Output Section](#output-section)
  - [Tutorial](#tutorial)
  - [API](#api)
    - [DataFrame](#dataframe)
    - [List](#list)
    - [Visual](#visual)
    - [UI](#ui)
  - [Documentation](#documentation)
  - [Examples](#examples)
    - [Titanic Exploratory Analysis](#titanic-exploratory-analysis)
    - [Anscombe's Quartet](#anscombes-quartet)
  - [Development / Source Code](#development--source-code)
    - [Scripts](#scripts)

The analytics-notebook is an analytical and statistical notebook application written in JavaScript, and is inspired by similar notebooks such as Jupyter notebooks, and https://observablehq.com/. Like the aforementioned applications, the intention for this application is to allow developers, analysts, researchers and statisticians to make sense out of data.

This application differs slightly from other notebooks in that instead of having multiple code blocks or cells entered inline within the output, analytics-notebook has a single code section and a single output section. The output section can be divided up into multiple visual 'panels' using the API, and visuals can be directed to these panels. A screenshot of the application is shown below:

![anaytics-notebook](https://github.com/davidbarone/analytics-notebook/blob/master/images/example1.png?raw=true)

## Application Layout

The analytics-notebook application has 2 main sections.

- Code section
- Output section

### Code Section

The code section is where the script is entered or loaded. Scripts are coded using Javascript, and there is an API available to help with common analytical tasks like data manipulation. To run a script simply click the run button, or press ctrl-enter. Any output of the script will be rendered to the output section.

At the base of the code section there is a console window. This is similar to the developer console windows found in all browsers. This window will display any errors in your scripts, and output can also be directed to the console (you may not want all output from your scripts going to the output section) using the standard Javascript function console.log().

### Output Section

The output section is used to render any output from the code. Output is typically

- Static text
- Raw unformatted data
- Simple scalar values
- Formatted tables
- Charts and other graphical visuals

Each distinct component displayed rendered to the output section is called a 'Visual'. There are broadly 2 kinds of visuals:

- Data bound visuals
- Static visuals

Data bound visuals are the most commonly used visual. These have a dataset (known as a DataFrame) attached to them. Furthermore, if the data changes (for example through some interactive visuals that can modify data - like the 'slicer' visual), then these visuals will automatically redraw. Static visuals are for things like headings, and free text. This information is normally static and does not have any data bound to it.

## Tutorial

Notebooks are created using JavaScript. The script is entered in the left-hand script section. To run the script, click the <b>Run</b> button, or else press <b>ctrl-enter</b>. To run a simple hello world, paste the following JavaScript code into the code section, and press ctrl-enter to run:

```javascript
alert("hello world!");
```

You will hopefully have received a hello world alert. Congratulations, you've just written your first (if not fairly pointless) notebook script.

You can include any valid JavaScript code in your script. You can use variables, create expressions, objects, functions - basically any valid JavaScript is allowed. For example, paste the following into the script section:

```javascript
let a = 2;
let b = 3;
alert(`The sum of ${a} and ${b} is ${a + b}`);

// -> 'The sum of 2 and 3 is 5'.
```

Alerts are not particularly useful. You'll want to direct results, tables, and visuals to the output pane to create reports, dashboards and other useful analytical output. Each output component is called a 'Visual'. Visuals are either data bound or non-data-bound (static).

To create a static visual, we use the Visual.html method. Paste the following into the code section, and run:

```javascript
Visual.html("hello world!").attach("root");
```

This should write 'hello world' to the output section. The string in the quotes of the html() call can be any valid html. For example, this is also perfectly allowed:

```javascript
Visual.html(
  "<div style='padding: 12px; border: 1px solid #ccc; background: #eee;'>hello world!</div>"
).attach("root");
```

You may have noticed the above 2 examples included an attach() call. To actually place the visual into the output, you must include this function call. The value in brackets is the name of the panel to add the visual into. When you start a new notebook session, a default panel 'root' is always created for you.

Dashboards and other 'Business Intelligence' type reports often layout content in a grid fashion. You can to the same by using the UI.layout function. For example, we can create 4 panels, and direct output to each panels using the example below:

```javascript
UI.layout({
  id: "root",
  direction: "horizontal",
  children: [
    {
      id: "left",
      direction: "vertical",
      children: ["top-left", "bottom-left"],
    },
    {
      id: "right",
      direction: "vertical",
      children: ["top-right", "bottom-right"],
    },
  ],
});

Visual.html("hello").attach("top-left");
Visual.html("world").attach("top-right");
Visual.html("from").attach("bottom-left");
Visual.html("Analytics Notebook").attach("bottom-right");
```

Each panel can contain multiple visuals, and you can make the layout grid as complex as you like. The UI.layout function supports various other features which are beyond the scope of this simple tutorial.

Static visuals are not going to take you very far though. The whole purpose of the analytics notebook is to enable analysts to obtain insights from data. For this, we need to use 'data bound' visuals.

To create data, the DataFrame class is generally used. External data can be obtained from the web using DataFrame.fetch. However, for this tutorial, we're going to use a built-in dataset called 'iris'. Paste the following into the script section:

```javascript
let data = DataFrame.examples.iris();
alert(data.count());
console.log(data);
```

When you run this script, you should receive an alert of '150'. This is the number of rows in the dataset. You may have also noticed the panel in the bottom left corner has some data. This panel is the 'console' panel, and information can be directed to this panel using the console.log() function. You will see in the above script, that we are writing the full DataFrame object to the console. The console is a useful tool for debugging your scripts.

Data on its own is not particularly useful. We need to visualise it. The simplest way to visualise data is via a table. Paste the following code into the script section:

```javascript
let data = DataFrame.examples.iris().head(10).visual("table").attach("root");
```

This script introduces a few more concepts. Firstly, we can see a .head() function call. The .head() function returns the top 'n' rows from a DataFrame object. The .visual() function creates a data bound visual from the DataFrame object. Note how we need to provide the name of the visual type here. In this case we want to render a table, so use the type 'table'. There are a number of built-in visual types, and you can even customise the Analytics Notebook application and write your own custom visual types. Many visual types require an additional configuration argument to be provided, but the 'table' visual type renders fine without any special configuration.

You will also notice how in the above example, the function calls are all 'chained' together. The above syntax is the idiomatic style recommended. The above script could however, be re-written as:

```javascript
let data = DataFrame.examples.iris();
let head = data.head(10);
let visual = head.visual("table");
visual.attach("root");
```

Finally, we can add a bit of interaction. Some visual types can be used to slice and dice the data. The 'slicer' visual is such a type. In general, if a number of visuals share the same DataFrame object in a script, then if this DataFrame object is sliced or diced (e.g. by a slicer visual), then all the other visuals bound to the same DataFrame object will automatically be sliced accordingly. Try running the following code:

```javascript
UI.layout({
  id: "root",
  fit: "width",
});
let data = DataFrame.examples.iris();
data.visual("slicer", { columnName: "class" }).attach("root");
data.visual("table").attach("root");
```

Here, you will be able to slice the table according to the 'class' field.

Hopefully, this tutorial has given you a basic grasp of how to run scripts. We recommend you now read the API documentation to get a deeper understanding of how to write more complex notebooks.

## API

In order to work efficiently with the code and output sections, there is an API within the analytics-notebook. This API contains a number of classes and functions. The key classes are:

- DataFrame - for manipulating tabular data.
- List - for manipulating columnar data.
- Visual - for creating visuals.
- UI - for rendering to the output section.

### DataFrame

The DataFrame class can be thought of as a 2-dimensional table. DataFrames are the work-horse of the analytical-notebook application. Data can be read from any url and is automatically returned as a DataFrame. Any transformation or filtering operations on a DataFrame generally return another DataFrame. In this way, the script can chain calls together to create a more natural-language syntax.

### List

A List object can be considered as a 1 dimensional list of values or a single column from a DataFrame. Lists objects are typically used to process a column, often to aggregate the values in some way or to perform univariate analysis.

### Visual

The Visual class is used to create and render visuals. As mentioned above, a key feature of data-bound visuals is that when the underlying data changes, the visual is automatically redraw. This feature enables interactive dashboards to be built using this tool too.

### UI

The UI class is used for manipulating the output. Typically you don't need to use the UI class directly. It is called indirectly when you create visuals. For example, the normal pattern to render a visual is to create a Visual object from a DataFrame object using the visual() function, then attach to the DOM using the Visual.attach() function:

```
dataframe.visual({visual_renderer_function}, {options}).attach('root');
```

The one method from the UI class which you will typically use (once per script) is the UI.layout() function. This function is used to design the grid layout for the output so that visuals can be positioned in the style of a dashboard.

## Documentation

This documentation you're reading has been compiled using jsDoc. More information can be found from the home page: https://jsdoc.app/. The documentation has also been styled using the ink-docstrap template (https://www.npmjs.com/package/ink-docstrap).

## Examples

### Titanic Exploratory Analysis

The following script performs some simple exploratory analysis on the 'Titanic' dataset:

```javascript
// Create single 'root' panel and allow vertical scrollbar.
UI.layout({
  id: "root",
  fit: "width",
});

// Add custom 'caption' type to visuals library:
Visual.library.caption = function() {
  let options = this.options;
  elDiv = document.createElement("div");
  elDiv.style.marginTop = "20px";
  elDiv.style.marginBottom = "20px";
  elDiv.style.backgroundColor = "#ddeeff";
  elDiv.style.border = "1px solid #aabbcc";
  elDiv.style.fontWeight = 700;
  elDiv.style.padding = "10px";
  elDiv.innerHTML = options.html || "";
  return elDiv;
};

Visual.caption = (html) => {
  let viz = new Visual(null, "caption", { html }, null);
  return viz;
};

// Get the titanic dataset:
let data = DataFrame.examples.titanic();

// Get first 5 rows:
Visual.html("<header>Titanic Analysis</header>").attach("root");
Visual.caption(`Number of rows: ${data.count()}`).attach("root");
Visual.caption("Top 5 rows:").attach("root");
data.head(5).visual("table").attach("root");

// Get descriptive statistics:
Visual.caption("Let's get the data descriptive statistics:").attach("root");
data.describe().visual("table").attach("root");

// Some simple transformations and cleansing:
Visual.caption("Let's remove unwanted columns:").attach("root");
data = data.select(
  "sex",
  "pclass",
  "age",
  "fare",
  "sibsp",
  "parch",
  "survived"
);
data.head(5).visual("table").attach("root");

Visual.caption(
  "Age appears to be a string value - lets convert to a float:"
).attach("root");
data = data.cast({
  age: "float",
  fare: "float",
});

data.describe().visual("table").attach("root");

Visual.caption(
  "Lets convert the sex field to a numeric variable and also rename and tidy up some of the other columns."
).attach("root");
data = data.map((r) => {
  return {
    is_male: r.sex.toLowerCase() === "male" ? 1 : 0,
    class: r.pclass,
    fare: r.fare,
    age: r.age,
    relatives: r.sibsp + r.parch,
    survived: r.survived,
  };
});

data.head(5).visual("table").attach("root");
data.describe().visual("table").attach("root");

// Simple visualisations:
Visual.caption(
  "Pie chart showing passengers by sex (male=1, female=0):"
).attach("root");
data
  .visual("pie", {
    fnCategories: (r) => {
      return { is_male: r.is_male };
    },
    fnValues: (g) => {
      return { passengers: g.count() };
    },
  })
  .attach("root");

Visual.caption("Histogram of passenger ages:").attach("root");
data
  .visual("hist", {
    fnValues: (r) => {
      return { age: r.age };
    },
  })
  .attach("root");

Visual.caption("Scatterplot showing fare vs age variables:").attach("root");
data
  .visual("scatter", {
    fnXValues: (row) => {
      return { age: row.age };
    },
    fnYValues: (row) => {
      return { fare: row.fare };
    },
  })
  .attach("root");
```

### Anscombe's Quartet

This notebook illustrates Anscombe's Quartet (https://en.wikipedia.org/wiki/Anscombe%27s_quartet):

```javascript
UI.layout({
  id: "root",
  direction: "vertical",
  children: [
    {
      id: "top",
      direction: "horizontal",
      size: 10,
      children: [
        {
          id: "top-left",
        },
        {
          id: "top-right",
        },
      ],
    },
    {
      id: "bottom",
      direction: "horizontal",
      size: 10,
      children: [
        {
          id: "bottom-left",
        },
        {
          id: "bottom-right",
        },
      ],
    },
  ],
});
let anscombe = DataFrame.examples.anscombe();

let data = [
  { dataset: "1", panel: "top-left" },
  { dataset: "2", panel: "top-right" },
  { dataset: "3", panel: "bottom-left" },
  { dataset: "4", panel: "bottom-right" },
];

data.forEach((d) => {
  let dataset = anscombe.filter((r) => r.dataset === d.dataset);
  dataset
    .visual("scatter", {
      fnXValues: (r) => {
        return { x: r.x };
      },
      fnYValues: (r) => {
        return { y: r.y };
      },
      axes: {
        x: {
          min: 1,
          max: 20,
        },
        y: {
          min: 1,
          max: 16,
        },
      },
    })
    .attach(d.panel);
  Visual.html(`mean(x): ${dataset.list("x").mean()}`).attach(d.panel);
  Visual.html(`var(x): ${dataset.list("x").var()}`).attach(d.panel);
  Visual.html(`y mean: ${dataset.list("y").mean()}`).attach(d.panel);
  Visual.html(`var(y): ${dataset.list("y").var()}`).attach(d.panel);
  Visual.html(`corr(x,y): ${dataset.list("x").corr(dataset.list("y"))}`).attach(
    d.panel
  );
});
```

## Development / Source Code

The source code for this project is available from: https://github.com/davidbarone/analytics-notebook. It's built using webpack, so you'll need the npm toolchain set up. You'll also need the following packages installed in the global namespace:

- jsDoc

### Scripts

A number of scripts have been created for basic tasks:

- docs: Creates a full document web site using jsDoc and the in-docstrap template. Suitable for highest quality documentation.
- docslite: Creates a single-file documentation page via jsDoc-to-markdown and Showdown. This documentation is useful when you need a 'bundled' solution.
- build: Builds site in production mode.
- build-dev: Builds site in development mode.
- serve: runs the Webpack Dev Server with Hot Module Replacement (HMR).
- test: runs the test suite (using Jest) with code coverage metrics included

---

David Barone 04-Aug-2020

---
