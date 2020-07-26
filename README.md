This is an analytical and statistical notebook application inspired by similar notebooks such as Jupyter notebooks, and https://observablehq.com/. Like the aforementioned applications, the intention for this application is to allow developers, analysts, researchers and statisticians to make sense out of data.
This application differs slightly from other notebooks in that instead of having multiple code panes entered inline into the output, analytics-notebook has a single code input pane and a single output pane. The output pane can be divided up into multiple visual 'panels', and visuals can be directed to these panels. This approach enables
dashboards to be developed.

## App Layout

The analytics-notebook application has 2 main panes.

- Code pane
- Output pane

### Code Pane

The code pane is where a script can be entered or loaded. Javascript is the language used.

### Output Pane

The output pane is used to render any output from the code. The output can be

- Raw Data
- Values
- Tables
- Charts / Visuals

## Main Classes

The analytics notebook contains a number of key classes:

- DataFrame
- List
- Visual

### DataFrame

The DataFrame class can be thought of as a 2-dimensional table. DataFrames are the work-horse of the analytical-notebook application. Any data read from the internet is returned as a DataFrame, and any
transformation or filtering operations on a DataFrame generally return another DataFrame.

### List

A List object can be considered as a 1 dimensional list of values. When a single column of a DataFrame
is selected, it is returned as a List object.

### Visual

The Visual class is used to render visuals.

## Documentation

jsDoc has been used to generate documentation. Having done a bit of research, this project appeared to be the most comprehensive and well used documentation
library out there. More information can be found from the home page: https://jsdoc.app/.

To get started with jsDoc, you'll need to install via npm:

```javascript
npm install -g jsdocs
```

(I noticed on my PC that I had to also allow PowerShell scripts to run).

I've added a 'docs' script, so the entire documentation can be easily rebuilt using:

```javascript
npm run docs
```

The documentation should be created in the /docs folder.

## Examples

### Titanic Dashboard

The following script displays a simple dashboard for the 'Titanic' dataset:

```

```
