class sw {
  // Generates a help file
  static help() {
    /*
    var win = window.open(
      "./docs/index.html",
      "Help",
      "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top=" +
        (screen.height - 400) +
        ",left=" +
        (screen.width - 840)
    );
*/
    UI.layout("root");
    document.getElementById("root").innerHTML =
      '<object type="text/html" style="width: 100%; height: 100%" data="./docs/index.html" ></object>';
  }

  static concatTypedArrays(a, b) {
    // a, b TypedArray of same type
    var c = new a.constructor(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }
}

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
Array.prototype.pushUnique = function ([...arr]) {
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

/**
 * Fits content into a panel element using the zoom css3 property.
 */
Element.prototype.fit = function () {

  // Get the metadata for the panel:
  let panel = UI.panels[this.id];
  let fit = panel.fit;
  if (this.id !== "output") {
    var elInner = this.firstChild;
    if (elInner) {
      // temporarily reset zoom to 10
      let zoom = 1;
      if (fit !== PANEL_FIT.NONE) {
        // For all 'resize' fit modes, start with zoom 10, so content grows/shrinks
        // If fit = none, then NO resizing at all
        zoom = 1;
      }
      elInner.style.zoom = zoom;

      if (fit === PANEL_FIT.WIDTH || fit === PANEL_FIT.BOTH) {
        aspectW = this.clientWidth / elInner.scrollWidth;
        if (aspectW < zoom) {
          zoom = aspectW;
        }
      }

      if (fit === PANEL_FIT.HEIGHT || fit === PANEL_FIT.BOTH) {
        aspectH = this.clientHeight / elInner.scrollHeight;
        if (aspectH < zoom) {
          zoom = aspectH;
        }
      }

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
