// Script to compile documentation

const jsdoc2md = require("jsdoc-to-markdown");
var fs = require("fs");
var path = require("path");
var showdown = require("showdown");

// Run jsdoc-to-markdown to create single .md file for all documentation
jsdoc2md.render({ files: "src/**/*.js" }).then((output) =>
  // write to /docs/index.md
  fs.writeFile("docs/index.md", output, () => {
    // convert .md to HTML using showdown
    var readmeFile = path.resolve(__dirname, "../README.md");
    var filename = path.resolve(__dirname, "../docs/index.md");
    var outFile = path.resolve(
      __dirname,
      "../dist/AnalyticsNotebook.Docs.html"
    );
    var md = "";
    var style = `
<style>
  html {
    font-family: Arial, Helvetica, sans-serif;
  }

  table,
  th,
  td {
    border: solid 1px #ddeeee;
    padding: 4px;
  }

  table {
    padding: 2px;
    border-collapse: collapse;
    border-spacing: 0;
  }

  th {
    background-color: #336699;
    color: #efefef;
    text-align: center;
    font-weight: 600;
  }

  h1 {
    background-color: #437FC7;
    color: #333;
    padding: 20px;
    text-align: center;
    border-left: 12px solid #bbddff;
  }

  h2,h3 {
    margin-top: 1em;
  }

  h2 {
    background-color: #6DAFFE;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #999;
    border-bottom: 1px solid #999;
  }

  h3 {
    background-color: #EDF6FF;
    padding: 8px;
    border-left: 12px solid #999;
  }

  </style>
  `;

    fs.readFile(readmeFile, "utf8", function (err, contents) {
      md =
        contents +
        `
# API Reference
`;
      fs.readFile(filename, "utf8", function (err, contents) {
        md = md + contents;
        let converter = new showdown.Converter();
        converter.setFlavor("github");
        let html = `<html><head>${style}</head><body>${converter.makeHtml(
          md
        )}</body></html>`;
        // write output as html
        html = html.replace(/(&amp;nbsp;)/g, " "); // Showdown bug: https://github.com/showdownjs/showdown/issues/669
        fs.writeFile(outFile, html, "utf8", function (err) {});
      });
    });
  })
);
