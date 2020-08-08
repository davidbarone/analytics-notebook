import Watcher from "../reactive/Watcher.js";
import Observer from "../reactive/Observer.js";

/**
 * A visual represents any visual component rendered in the output, for example tables and charts.
 */
class Visual {
  /**
   * Creates a new visual.
   * @param {DataFrame} dataFrame - Data being bound to the visual.
   * @param {string} type - The type of visual from the visual library.
   * @param {Object} options - configuration for the rendering. This is renderer-specific.
   */
  constructor(dataFrame, type, options) {
    this.dataFrame = dataFrame;
    this.type = type;
    this.renderer = Visual.library[type];
    this.options = options;
    this.panelId = null; // set by assign
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
      const watcher = new Watcher(
        () => this.dataFrame.data,
        (val) => this.render()
      );
    } else {
      this.render();
    }
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
        let content = c.renderer(c.dataFrame, c.options);
        let id = c.panelId;
        UI.content(content, id);
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
 * Registry of visual types / renderers. These include data-bound and non-data bound renderers. Renderer functions are generally not called directly, but
 * are used by other functions, for example the DataFrame.visual() function. Renderer functions are called during the screen rendering process, and
 * 2 arguments are passed to render functions. A DataFrame object which is the data to be rendered, and an options object which provides
 * customisation rules for the renderer. The format of the options object is renderer-specific.
 */
Visual.library = {};

export default Visual;
