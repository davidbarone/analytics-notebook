import PANEL_ALIGNMENT from "./PanelAlignment.js";
import PANEL_FIT from "./PanelFit.js";

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
        if (panel.grow === true) {
          zoom = 20;
        } else {
          zoom = 1;
        }
      }
      elInner.style.zoom = zoom;

      if (fit === PANEL_FIT.WIDTH || fit === PANEL_FIT.BOTH) {
        let aspectW = this.clientWidth / elInner.scrollWidth;
        if (aspectW < zoom) {
          zoom = aspectW;
        }
      }

      if (fit === PANEL_FIT.HEIGHT || fit === PANEL_FIT.BOTH) {
        let aspectH = this.clientHeight / elInner.scrollHeight;
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

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects. The last sources win.
 * @param {Object} target
 * @param {Object} ...sources
 */
Object.mergeDeep = function (target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        Object.mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return Object.mergeDeep(target, ...sources);
};

export default {};
