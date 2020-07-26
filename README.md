# analytics-notebook

This is an analytical and statistical notebook application inspired by similar notebooks such as Jupyter notebooks, and https://observablehq.com/. Like the aforementioned applications, the intention for this application is to allow developers, analysts, researchers and statisticians to make sense out of data.
This application differs slightly from other notebooks in that instead of having multiple code panes entered inline into the output, analytics-notebook has a single code input pane and a single output pane. The output pane can be divided up into multiple visual 'panels', and visuals can be directed to these panels. This approach enables
dashboards to be developed.

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
