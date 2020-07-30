# analytics-notebook

The analytics-notebook is an analytical and statistical notebook application written in JavaScript, and is inspired by similar notebooks such as Jupyter notebooks, and https://observablehq.com/. Like the aforementioned applications, the intention for this application is to allow developers, analysts, researchers and statisticians to make sense out of data.

This application differs slightly from other notebooks in that instead of having multiple code blocks or cells entered inline within the output, analytics-notebook has a single code section and a single output section. The output section can be divided up into multiple visual 'panels' using the API, and visuals can be directed to these panels.

## Application Layout

The analytics-notebook application has 2 main sections.

- Code section
- Output section

### Code Section

The code section is where the script is entered or loaded. Scripts are coded using Javascript, and there is an API available to help with common analytical tasks like data manipulation. To run a script simply click the run button, or ctrl-enter. Any output of the script will be rendered to the output section.

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

## API

In order to work efficiently with the code and output sections, there is an API within the analytics-notebook. This API contains a number of classes and functions. The key classes are:
- DataFrame - for manipulating tabular data.
- List - for manipulating columnar data.
- Visual - for creating visuals.
- UI - for rendering to the output section.

### DataFrame

The DataFrame class can be thought of as a 2-dimensional table. DataFrames are the work-horse of the analytical-notebook application. Data can be read from any url and is automatically returned as a DataFrame. Any transformation or filtering operations on a DataFrame generally return another DataFrame. In this way, the script can chain calls together to create a more natural-language syntax.

### List

A List object can be considered as a 1 dimensional list of values or a single column from a DataFrame. Lists objects are typically used to process a column, often to aggregate the values in some way.

### Visual

The Visual class is used to create and render visuals. As mentioned above, a key feature of data-bound visuals is that when the underlying data changes, the visual is automatically redraw. This feature enables interactive dashboards to be built using this tool too.

### UI

The UI class is used for manipulating the output. Typically you don't need to use the UI class directly. It is called indirectly when you create visuals. For example, the normal pattern to render a visual is to create a Visual object from a DataFrame object using the visual() function, then attach to the DOM using the Visual.attach() function:

```
dataframe.visual({visual_renderer_function}, {options}).attach('root');
```
## Documentation

This documentation you're reading has been compiled using jsDoc. More information can be found from the home page: https://jsdoc.app/. The documentation has also been styled using the ink-docstrap template (https://www.npmjs.com/package/ink-docstrap).

## Examples

### Titanic Exploratory Analysis

The following script performs some simple exploratory analysis on the 'Titanic' dataset:

```javascript
// Create single 'root' panel and allow vertical scrollbar.
UI.layout({
  id: 'root',
  fit: 'width'
});

// Add custom 'caption' renderer to render text nicely:
Visual.renderer.caption = (dataFrame, options) => {
  elDiv = document.createElement('div');
  elDiv.style.marginTop = '20px';
  elDiv.style.marginBottom = '20px';
  elDiv.style.backgroundColor = '#ddeeff';
  elDiv.style.border = '1px solid #aabbcc';
  elDiv.style.fontWeight = 700;
  elDiv.style.padding = '10px';
  elDiv.innerHTML = options.html || '';
  return elDiv;
}

Visual.caption = (html) => {
  let viz = new Visual(undefined, Visual.renderer.caption, {html});
  return viz;
}

// Get the titanic dataset:
let data = DataFrame.examples.titanic();

// Get first 5 rows:
Visual.html('<header>Titanic Analysis</header>').attach('root');
Visual.caption(`Number of rows: ${data.count()}`).attach('root');
Visual.caption('Top 5 rows:').attach('root');
data.head(5).visual(Visual.renderer.table).attach('root');

// Get descriptive statistics:
Visual.caption('Let\'s get the data descriptive statistics:').attach('root');
data.describe().visual(Visual.renderer.table).attach('root');

// Some simple transformations and cleansing:
Visual.caption('Let\'s remove unwanted columns:').attach('root');
data = data.select('sex','pclass','age', 'fare', 'sibsp', 'parch', 'survived');
data.head(5).visual(Visual.renderer.table).attach('root');

Visual.caption('Age appears to be a string value - lets convert to a float:').attach('root');
data = data.cast({
    age: 'float',
    fare: 'float'
});

data.describe().visual(Visual.renderer.table).attach('root');

Visual.caption('Lets convert the sex field to a numeric variable and also rename and tidy up some of the other columns.').attach('root');
data = data.map(r=> { return {
  is_male: r.sex.toLowerCase()==='male' ? 1 : 0,
  class: r.pclass,
  fare: r.fare,
  age: r.age,
  relatives: r.sibsp + r.parch,
  survived: r.survived
}});

data.head(5).visual(Visual.renderer.table).attach('root');
data.describe().visual(Visual.renderer.table).attach('root');

// Simple visualisations:
Visual.caption('Pie chart showing passengers by sex (male=1, female=0):').attach('root');
data.visual(Visual.renderer.pie, {
    fnCategories: (r)=> { return { is_male: r.is_male }},
    fnValues: (g)=> { return { passengers: g.count() }}
}).attach('root');

Visual.caption('Histogram of passenger ages:').attach('root');
data.visual(Visual.renderer.hist, {
    fnValues: (r) => { return { age: r.age }}
}).attach('root');

Visual.caption('Scatterplot showing fare vs age variables:').attach('root');
data.visual(Visual.renderer.scatter, {
  fnXValues: (row)=>{ return { age: row.age }},
  fnYValues: (row)=>{ return { fare: row.fare }}
}).attach('root');
```