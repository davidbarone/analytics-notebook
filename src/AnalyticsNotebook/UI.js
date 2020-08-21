import Visual from "./Visual.js";
import PANEL_ALIGNMENT from "./PanelAlignment.js";
import PANEL_FIT from "./PanelFit.js";

/**
 * Controls rendering to the output section.
 */
class UI {
  /**
   * Clears / resets the output completely.
   * @example <caption>Clearing the UI output pane</caption>
   * UI.reset();
   */
  static reset() {
    let elOutput = document.getElementById("output");
    elOutput.innerHTML = "";
    UI.panels = {};
    Visual.visuals = [];

    // Create default panel. This can be overridden by UI.layout
    UI.layout("root");
  }

  /**
   * Clears a single panel. Typically used internally to redraw parts of the output when
   * data is being interactively sliced.
   * @param {String} id - The id of the panel to clear.
   */
  static clear(id) {
    // Note: all content goes into an inner div within visual
    // called div.visual.inner

    let el = document.getElementById(id);
    if (!el) {
      el = document.getElementById("output");
    }

    // Get inner div
    let elInner = el.firstChild;
    elInner.innerHTML = "";
  }

  static add(visual, panel) {
    if (!UI.panels.panel) {
      UI.panels = [];
    }

    UI.panels.push(visual);
  }

  // Refreshes content within a panel
  static refresh(panel) {
    let visuals = panels[panel];

    visuals.forEach((v) => { });
    UI.content();
  }

  /**
   * A definition of a single panel in the output pane.
   * @typedef {Object} UI~Panel
   * @property {String} id - The id of the panel. Must be globally unique.
   * @property {Number} size - The relative size of the panel. The number has no dimensions and is relative to its sibling sizes.
   * @property {PanelAlignment} alignment - The alignment of child panels within this panel.
   * @property {PanelFit} fit - Specifies how child items / visuals are fitted within this panel.
   * @property {UI~Panel[]} children - Optional array of child panel objects
   */

  /**
   * Creates a layout using panels. Panels are containers for visuals. A panel layout is typically
   * used to create a dashboard or report.
   * @param {UI~Panel[]} panels - An array of panels. A single panel can also be specified.
   * @param {String} parentId - The parent id of the element to place the panels in.
   * @example <caption>Creating a simple layout</caption>
   * UI.layout({
   *   id: 'root',
   *   direction: 'vertical',
   *   children: [
   *     {
   *       id: 'top',
   *       size: 1
   *     },
   *     {
   *       id: 'middle',
   *       size: 1
   *     },
   *     {
   *       id: 'bottom',
   *       size: 2,
   *       children: [
   *         {
   *           id: 'bottom-left'
   *         },
   *         {
   *           id: 'bottom-right'
   *         }
   *       ]
   *     }
   *   ]
   * });
   */
  static layout(panels, parentId = null) {
    /* 
      Calculation of panel borders
      ----------------------------
      A dashboard can be made up of horizontal + vertical panel sets. Ensuring that a single-width
      border separates all panels is tricky. Naive implementations results in a double width border
      between 2 non-edge panes. This algorithm attempts to fix this as folows:
      
      css types:
      ----------
      div.visual - all panes get this. Contains attributes for:
      - Float
      - boxSizing
      - overflow
      
      div.visual.leaf - pane that contains actual content
      - border bottom
      - border right
      
      div.visual.left - for all left edge panes - adds:
       - border left
      
      div.visual.top - for all top edge panes - adds:
       - border top
      
      When add a new layout into existing pane:
       - remove 'leaf' css
      
      Check for first panel added to output
      - If first panel is horizontal:
      - - All child panes add 'top' css
      - - Add left to first child
      - If first panel is vertical
      - - All child panes add 'left' css
      - - Add top to first child
      */

    // Parent
    let direction = "horizontal"; // default
    let root = false;
    if (!parentId) {
      // root
      parentId = "output";
      root = true;
      UI.panels = {};
    } else {
      if (!UI.panels[parentId]) {
        throw `Parent id ${parentId} not found.`;
      }

      // parent direction
      direction = UI.panels[parentId].direction;
    }

    let el = document.getElementById(parentId);

    // clear the contents of the parent and reset style
    el.innerHTML = "";
    el.classList.remove("leaf");
    el.classList.add(direction);

    // Ensure the panels parameter is an array. Single
    // panel can be passed in too.
    if (!Array.isArray(panels)) {
      panels = [panels];
    }

    // Ensure each panel item has full set of properties
    // Users can omit properties, and can even just specify
    // a string value which is the id.
    // Default values are:
    // size: 1,
    // fit: both
    panels = panels.map((p) => {
      if (typeof p === "string") {
        return {
          id: p,
          size: 1,
          fit: PANEL_FIT.BOTH,
          grow: false,
          direction: PANEL_ALIGNMENT.HORIZONTAL,
          children: [],
        };
      } else if (typeof p === "object") {
        return {
          ...{
            size: 1,
            fit: PANEL_FIT.BOTH,
            grow: false,
            direction: PANEL_ALIGNMENT.HORIZONTAL,
            children: [],
          },
          ...p,
        };
      }
    });

    let total = panels.reduce((acc, cur) => {
      return acc + cur.size;
    }, 0);

    let first = true;
    panels.forEach((p) => {
      // Cache the panel object
      if (!p.id) {
        throw "Panel id not set.";
      }

      if (UI.panels[p.id]) {
        throw `Panel id ${p.id} already used. Id values must be unique.`;
      }

      UI.panels[p.id] = p;

      let div = document.createElement("div");
      div.classList.add("panel", "leaf");

      // Add special border css class on top/left most panes.
      if (root) {
        if (direction === PANEL_ALIGNMENT.HORIZONTAL) {
          div.classList.add("top");
          if (first) {
            div.classList.add("left");
          }
        }
        if (direction === PANEL_ALIGNMENT.VERTICAL) {
          div.classList.add("left");
          if (first) {
            div.classList.add("top");
          }
        }
      }
      first = false;

      div.id = p.id;

      if (direction === PANEL_ALIGNMENT.VERTICAL) {
        div.style.height = `${(p.size * 100) / total}%`;
        div.style.width = "100%";
      } else {
        div.style.width = `${(p.size * 100) / total}%`;
        div.style.height = "100%";
      }

      let placeholder = document.createElement("div");
      placeholder.style.backgroundColor = "#ccc";
      placeholder.style.margin = "0";
      placeholder.style.padding = "4px";
      placeholder.innerText = p.id;
      placeholder.style.height = "100%";
      placeholder.style.boxSizing = "border-box";

      // Finally render the new pane with a placeholder.
      div.appendChild(placeholder);
      el.appendChild(div);

      // Recursive bit
      if (p.children && p.children.length > 0) {
        UI.layout(p.children, p.id);
      }
    });
  }

  /**
   * Writes content and visuals to an output panel. Note this method should not be used by users. To display visuals, use the Visual.attach() method to attach the visual to the DOM.
   * @param {object} content
   * @param {string} id
   */
  static content(content, id = null) {
    // Note: all content / visuals goes into an inner div within panel
    // called div.panel.inner

    let el = document.getElementById(id);
    if (!el) {
      throw `Panel [${id}] does not exist. Cannot write content.`;
    }

    // If the panel already has content, set append to true.
    let append = false;
    let firstChild = el.firstChild;
    if (
      firstChild.classList.contains("panel") &&
      firstChild.classList.contains("inner")
    ) {
      append = true;
    }

    if (!append) {
      el.innerHTML = "";
      let elInner = document.createElement("div");
      elInner.classList.add("panel", "inner");
      el.appendChild(elInner);
    }

    // We add all content to the inner.
    var elInner = el.firstChild;
    elInner.appendChild(content);

    // Automatically set the zoom property to fit to container
    // This ONLY applied for panes created by user.
    // The root pane does NOT zoom
    el.fit();
  }
}

/**
 * The collection of panels in the current output. Each panel can hold zero or more visuals.
 */
UI.panels = {};

export default UI;
