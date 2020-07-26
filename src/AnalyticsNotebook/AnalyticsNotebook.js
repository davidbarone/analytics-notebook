var documentation = {
  title: "Analytics Notebook API Reference",
  description: `The Analytics Notebook is a data manipulation, analytical, and presentational tool which enables analysts and developers
to quickly gain a variety of insights from datasets. The interface consists of a code panel into which a script
can be entered and executed, and an output panel where the script output is rendered. Multiple panes can be created
in the output to generate complex reports and dashboards. Javascript is used for creating the scripts, and a library
of helper functions is available in the Analytics Notebook API for generating all kinds of analytical output from tables
to charts to statistical output.`,
  operations: [],
};

class sw {
  // Generates a help file
  static help() {
    UI.clear();
    let html = "<div class = 'help'>";
    html += `<h2 id="top">${sw.documentation.title}</h2>`;
    html += `<p>${sw.documentation.description}</p>`;

    // Get the index:
    html += "<h3>Index of Functions</h3>";

    // Get classes
    let classes = sw.documentation.operations
      .map((o) => o.class)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    // Display Index
    classes.forEach((c) => {
      html += `<h4>${c}</h4>`;
      let operations = sw.documentation.operations.filter((o) => o.class === c);
      operations.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
      });

      operations.forEach((o) => {
        html += `<a href='#${o.name}'>${o.name}</a> `;
      });
    });

    // The full list of functions
    html += "<h3>List of Functions</h3>";

    let operations = sw.documentation.operations;
    operations.sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });

    operations.forEach((o) => {
      html += `
<div id=${o.name} class="helpOperation">
    <div class="helpOperationHeader">
        <span>${o.class + (o.static ? "." : ".prototype.") + o.name}()</span>
        <span>Async: ${o.async}</span>
        <span>Returns: ${o.returns}</span>
    </div>
    <div class="helpOperationBody">
        <a href="#top" style="font-size: small">Top</a>
        <div>${o.description}</div>`;

      let signatures = o.signatures;
      signatures.forEach((s) => {
        html += `<div class="helpOperationSignature">`;

        let signature = `.${o.name}(${s
          .map((sig) => sig.parameterName)
          .join(", ")})`;
        html += `<div>${signature}</div>`;

        // each parameter
        s.forEach((p) => {
          html += `<div class="description"><b>${p.parameterName}</b> <i>${p.parameterType}</i>: ${p.parameterDescription}</div>`;
        });

        html += `</div>`;
      });

      // Examples
      let examples = o.examples;
      if (examples) {
        html += "<h3>Examples</h3>";
        examples.forEach((e) => {
          html += `<h4>${e.name}</h4><p>${e.description}</p><pre class=code>${e.code}</pre>`;
        });
      }

      html += `</div>`;
      html += `</div>`;
    });
    html += "</div>";

    UI.content(html);
  }

  /*
                static group(data, keyFunction) {
                    return data.reduce(function (acc, cur, idx, src) {
                (acc[keyFunction(cur)] = acc[keyFunction(cur)] || []).push(cur);
                        return acc;
                    }, {});
                };
    */

  static concatTypedArrays(a, b) {
    // a, b TypedArray of same type
    var c = new a.constructor(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }
}

sw.documentation = documentation;

////////////////////////////////////////////////////
// Extensions / Mixins
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// Array.prototype.toObject
//
// Converts a data frame to an object. The
// key column and value column must be specified.
// This useful transposer is utilised by the
// Visuals.pie method.
////////////////////////////////////////////////////
Array.prototype.toObject = function (keyColumn, valueColumn) {
  var obj = {};
  this.forEach((i) => {
    let key = i[keyColumn];
    let value = i[valueColumn];
    if (value !== undefined) obj[key] = value;
  });
  return obj;
};

////////////////////////////////////////////////////
// Array.prototype.toDataFrame
//
// Converts a plain JavaScript array to a DataFrame.
////////////////////////////////////////////////////
Array.prototype.toDataFrame = function () {
  return DataFrame.create(this);
};

////////////////////////////////////////////////////
// Array.prototype.pushUnique
//
// Pushes elements to array if they don't exist.
// Only works with string + number
// key column and value column must be specified.
// This useful transposer is utilised by the
// Visuals.pie method.
////////////////////////////////////////////////////
Array.prototype.pushUnique = function (...arr) {
  arr.forEach((a) => {
    this.indexOf(a) === -1 ? this.push(a) : {};
  });
  return this.length;
};

////////////////////////////////////////////////////
// Array.prototype.remove
//
// Removes an item from an array by value.
// If item does not exist, does nothing.
////////////////////////////////////////////////////
Array.prototype.remove = function (item) {
  let index = this.indexOf(item);
  if (index !== -1) this.splice(index, 1);
};

////////////////////////////////////////////////////
// Element.prototype.fit
//
// Fits content into an element using the zoom
// css3 property.
////////////////////////////////////////////////////
Element.prototype.fit = function () {
  if (this.id !== "output") {
    var elInner = this.firstChild;
    if (elInner) {
      // temporarily reset zoom to 1
      elInner.style.zoom = 1;
      aspectW = this.clientWidth / elInner.scrollWidth;
      aspectH = this.clientHeight / elInner.scrollHeight;
      let zoom = aspectW < aspectH ? aspectW : aspectH;
      elInner.style.zoom = zoom;

      // fine adjustments to cater for minor rounding issues
      // If scroll bars still present, reduce zoom slightly
      // till fits.
      let tries = 0;
      while (
        elInner.scrollWidth > elInner.clientWidth ||
        elInner.scrollHeight > elInner.clientHeight
      ) {
        elInner.style.zoom = elInner.style.zoom * 0.99;
        tries++;
        if (tries > 10) {
          break;
        }
      }
    }
  }
};
