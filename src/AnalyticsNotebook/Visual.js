import Watcher from "../reactive/Watcher.js";
import Observer from "../reactive/Observer.js";
import UI from "./UI.js";
import VisualLibraryBase from "./VisualLibrary/Visual.library.base.js";

/**
 * A visual represents any visual component rendered in the output, for example tables and charts.
 */
class Visual {
  /**
   * Creates a new visual. If the visual is created with a dataFrame object, the visual is 'data-bound'. Otherwise the visual is 'non-data-bound' or static. Data-bound visuals automatically update whenver the underlying data changes.
   * Visuals are configured using an options object. The data bindings for the visual are set using a 'binding' property. A binding object consist of multiple properties, each containing an array of column names. The table below shows which bindings are required for the visuals included in the base system:
   * |Type          | Column | Row    | Value  | Color  | Size   | Detail |
   * |--------------|:------:|:------:|:------:|:------:|:------:|:------:|
   * | **bar**      | X      | X      | X      |        |        |        |
   * | **column**   | X      | X      |        |        |        |        |
   * | **pie**      | X      |        | X      |        |        |        |
   * | **table**    | X      |        |        |        |        |        |
   * | **crosstag** | X      | X      | X      |        |        |        |
   * | **hist**     | X      |        |        |        |        |        |
   * | **box**      | X      |        |        |        |        |        |
   * | **scatter**  | X      | X      |        | X      | X      | X      |
   * | **slicer**   | X      |        |        |        |        |        |
   * | **pairs**    | ?      |        |        |        |        |        |
   * | **html**     |        |        |        |        |        |        |
   *
   * @param {string} type - The type of visual from the visual library.
   * @param {DataFrame} dataFrame - The DataFrame instance that is bound to the visual.
   * @param {Visual~OptionsBase} options - Configuration for the visual. This is visual-type specific, but there are standard configuration options that all visuals have.
   * @param {DataFrame~filterFunction} filterFunction - The function to filter the data. The filter will be applied to this visual only.
   */
  constructor(type, dataFrame, options, filterFunction) {
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
  slicedData() {
    if (!this.dataFrame) {
      return undefined;
    } else {
      // Get the dataFrame bound data (which includes slicers)
      let data = this.dataFrame.slicedData();
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

        // merge with default base options (let visual do visual-specific stuff)
        c.options = Object.mergeDeep(
          {},
          VisualLibraryBase.defaultOptions,
          c.options
        );

        // for binding option, we ensure all properties are arrays.
        for (let key in c.options.binding) {
          if (typeof c.options.binding[key] === "string") {
            c.options.binding[key] = [c.options.binding[key]];
          } else if (Array.isArray(c.options.binding[key])) {
            // good to go.
          } else {
            throw `Binding for ${key} must be an Array of columns.`;
          }
        }

        // Call render function, passing the current visual.
        let content = renderFunction(c);
        let panelId = c.panelId;

        // Add core styles
        let elVisual = document.createElement("div");
        elVisual.id = c.id; // Assign the id to the visual node.
        elVisual.classList.add("visual");
        let elInner = document.createElement("div");
        elInner.classList.add("visual", "inner");
        elVisual.appendChild(elInner);

        let options = c.options;

        // Add title?
        if (options.title) {
          let elTitle = document.createElement("div");
          elTitle.innerText = options.title;
          elTitle.style.textAlign = "center";
          elTitle.style.fontWeight = 600;
          elInner.appendChild(elTitle);
        }

        elInner.appendChild(content);

        // Apply Visual styles
        if (options) {
          if (options.background) {
            elInner.style.backgroundColor = options.background;
          }
          if (options.border) {
            elInner.style.border = `${options.border.width}px solid ${options.border.color}`;
          }
          if (options.border && options.border.radius) {
            elInner.style.borderRadius = `${options.border.radius}px`;
          }
          if (options.inline) {
            elVisual.style.display = "inline-block";
          }
        }
        UI.content(elVisual, panelId);
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

  static create(type, dataFrame, options, filterFunction) {
    return new Visual(type, dataFrame, options, filterFunction);
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
 * - To get the data, call this.slicedData()
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
