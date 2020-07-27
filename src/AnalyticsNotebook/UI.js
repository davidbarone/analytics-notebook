/**
 * Controls output to the output pane.
 */
class UI {
  // Each panel element holds an array of Visual objects
  // allowing for the panel to be redrawn if necessary.
  static panels = {};

  /**
   * Clears the output pane.
   * @example <caption>Clearing the UI output pane</caption>
   * UI.clear();
   */
  static reset() {
    let elOutput = document.getElementById("output");
    elOutput.innerHTML = "";
    UI.panels = {};
  }

  clear(id = null) {
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

    visuals.forEach((v) => {});
    UI.content();
  }

  /**
   * Creates a layout using panels. Each pane can have the following properties:
   * size
   * fit: none, width, height, both
   * id:
   * @param {Array} panels - An array specifying the panels to add.
   * @param {String} direction - The direction the panels are aligned. Must be 'horizontal' or 'vertical'.
   * @param {String} parentId - The parent id of the element to place the panels in.
   */
  static layout(panels, direction = "horizontal", parentId = null) {
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

    let el = document.getElementById(parentId);
    let root = false;

    if (!el) {
      // default to main output
      el = document.getElementById("output");
      root = true;
    }

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
          fit: "both",
        };
      } else if (typeof p === "object") {
        return {
          ...{
            id: "_",
            size: 1,
            fit: "both",
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
      let div = document.createElement("div");
      div.classList.add("visual", "leaf");

      // Add special border css class on top/left most panes.
      if (root) {
        if (direction === "horizontal") {
          div.classList.add("top");
          if (first) {
            div.classList.add("left");
          }
        }
        if (direction === "vertical") {
          div.classList.add("left");
          if (first) {
            div.classList.add("top");
          }
        }
      }
      first = false;

      div.id = p.id;

      if (direction === "vertical") {
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

      // add to metadata for re-rendering
      UI.panels[p.id] = [];

      // Finally render the new pane with a placeholder.
      div.appendChild(placeholder);
      el.appendChild(div);
    });
  }

  /**
   * Writes content to an output pane.
   * @param {*} content
   * @param {*} id
   */
  content(content, id = null) {
    // Note: all content goes into an inner div within visual
    // called div.visual.inner

    let el = document.getElementById(id);
    if (!el) {
      el = document.getElementById("output");
    }

    // If the panel already has content, set append to true.
    let append = false;
    let firstChild = el.firstChild;
    if (firstChild.classList.contains("visual")) {
      append = true;
    }

    if (!append) {
      el.innerHTML = "";
    }

    if (el.innerHTML === "") {
      let elInner = document.createElement("div");
      elInner.classList.add("visual", "inner");
      el.appendChild(elInner);
    }

    // We add all content to the inner.
    var elInner = el.firstChild;

    if (content instanceof Node) {
      elInner.appendChild(content);
    } else if (typeof content === "string") {
      var elDiv = document.createElement("div");
      elDiv.innerHTML = content;
      elInner.appendChild(elDiv);
    } else if (typeof content === "object") {
      let str = JSON.stringify(content, null, 2); // format the object with indentation
      var elDiv = document.createElement("pre");
      elDiv.innerText = str;
      elInner.appendChild(elDiv);
    } else {
      // e.g. number
      var elDiv = document.createElement("pre");
      elDiv.innerText = content;
      elInner.appendChild(elDiv);
    }

    // Automatically set the zoom property to fit to container
    // This ONLY applied for panes created by user.
    // The root pane does NOT zoom
    el.fit();
  }
}
