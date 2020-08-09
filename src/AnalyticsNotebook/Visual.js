import Watcher from "../reactive/Watcher.js";
import Observer from "../reactive/Observer.js";

/**
 * A visual represents any visual component rendered in the output, for example tables and charts.
 */
class Visual {
  /**
   * Creates a new visual. If the visual is created with a dataFrame object, the visual is 'data-bound'. Otherwise
   * the visual is 'non-data-bound'. Data-bound visuals automatically update whenver the underlying data changes.
   * @param {DataFrame} dataFrame - The base DataFrame object that the visual is created from.
   * @param {string} type - The type of visual from the visual library.
   * @param {Object} options - configuration for the rendering. This is visual-type specific.
   * @param {DataFrame~filterFunction} filterFunction - The function to filter the data. The filter will be applied to this visual only.
   */
  constructor(dataFrame, type, options, filterFunction) {
    this.dataFrame = dataFrame;
    this.type = type;
    this.options = options;
    this.filterFunction = filterFunction;
    this.panelId = null; // set by assign
    this.id = `Viz${++Visual.nextId}`;
    this.state = {}; // State of the visual. Preserves state between re-renders.
    walk(this);
    Visual.visuals.push(this);
  }

  /**
   * Attaches the visual to a panel in the output.
   * @param {String} panelId - The id of the panel to attach the visual to.
   */
  attach(panelId) {
    this.panelId = panelId;

    // Set data binding if data bound viz
    if (this.dataFrame) {
      const watcher1 = new Watcher(
        () => this.dataFrame.data,
        (val) => this.render()
      );
      const watcher2 = new Watcher(
        () => this.dataFrame.slicers,
        (val) => this.render()
      );
    } else {
      this.render();
    }
  }

  /**
   * Returns the data after all appropriate filters / contexts have been applied. All visuals
   * should get data from this function only.
   * @returns {Array} Data is returned in native Javascript Array format, which is more suited to libraries like D3.
   */
  boundData() {
    if (!this.dataFrame) {
      return undefined;
    } else {
      // Get the dataFrame bound data (which includes slicers)
      let data = this.dataFrame.boundData();
      // Apply visual filter if set
      if (this.filterFunction) {
        data = data.filter(this.filterFunction);
      }
      return data.data;
    }
  }

  /**
   * Sets the internal state of the visual.
   * @param {} key
   * @param {*} value
   */
  setState(key, value) {
    this.state = { ...this.state, [key]: value };
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
      if (c.panelId === id) {
        let renderFunction = Visual.library[c.type];

        // Call render function, binding this to the current visual.
        let content = renderFunction.call(c);
        content.id = c.id; // Assign the id to the node.
        let panelId = c.panelId;
        UI.content(content, panelId);
      }
    });
  }

  /**
   * Creates a static html-rendered visual. This visual is not bound to any data. Use html
   * visuals for static content like text and abstract shapes which does not change
   */
  static html(html) {
    let visual = new Visual(undefined, "html", { html });
    return visual;
  }
}

// object that contains the assignments of visual <-> panel
// Each property is an array of visuals. Id = Panel.id.
Visual.watchers = [];

// Registry of all visuals pushed
Visual.visuals = [];

/**
 * Registry of visual types rendering functions. These include data-bound and non-data bound renderers. Render functions are generally not called directly, but
 * are used by the internal framework when rendering visuals to the output panel. The visual type required is typically defined when using the
 * DataFrame.prototype.visual method. Render functions take no parameters. However, they automatically bind 'this' to the Visual, so all data and configuration
 * can be obtained from the parent Visual object.
 * - To get the data, call this.boundData()
 * - To get the configuration options, call this.options
 * - To add a slicer, call this.dataFrame.setSlicer(this, <filterFunction>)
 * - To remove a slicer, call this.dataFrame.unsetSlicer(this)
 * The format of the options object is renderer-specific.
 */
Visual.library = {};

/**
 * Stores the next id value. Ensures all visuals are allocated a unique id in the DOM.
 */
Visual.nextId = 0;

export default Visual;
