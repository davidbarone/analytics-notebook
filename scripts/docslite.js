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

    fs.readFile(readmeFile, "utf8", function (err, contents) {
      md = contents;
      fs.readFile(filename, "utf8", function (err, contents) {
        md = md + contents;
        let converter = new showdown.Converter();
        converter.setFlavor("vanilla");
        converter.setOption("tables", true);  // format tables
        converter.setOption("ghCompatibleHeaderId", true);  // header links
        let html = `<html><body>${converter.makeHtml(
          md
        )}</body></html>`;
        // write output as html
        html = html.replace(/(&amp;nbsp;)/g, " "); // Showdown bug: https://github.com/showdownjs/showdown/issues/669
        fs.writeFile(outFile, html, "utf8", function (err) { });
      });
    });
  })
);
