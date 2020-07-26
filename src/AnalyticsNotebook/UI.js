////////////////////////////////////////////////////
//
// UI
//
// Provides UI functions in workbench. Includes:
//
// layout()
// content()
// clear()
////////////////////////////////////////////////////

/**
 * Provides high-level user-interface functionality
 */
class UI {
  // Each panel element holds an array of Visual objects
  // allowing for the panel to be redrawn if necessary.
  static panels = {};

  /**
   * Clears the output pane.
   */
  static clear() {
    UI.panels = [];
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

  static layout() {
    alert("ersd");
  }
}

////////////////////////////////////////////////////
// UI.clear
////////////////////////////////////////////////////
documentation.operations.push({
  class: "UI",
  static: true,
  name: "clear",
  async: false,
  returns: "",
  description: "Clears the output pane.",
  signatures: [],
  examples: [
    {
      name: "Clearing the output pane.",
      description: `The following example illustrates how to clear the output pane.`,
      code: `UI.clear();`,
    },
  ],
});
UI.clear = function () {
  let elOutput = document.getElementById("output");
  elOutput.innerHTML = "";
  UI.panels = {};
};

////////////////////////////////////////////////////
// UI.layout
////////////////////////////////////////////////////
documentation.operations.push({
  class: "UI",
  static: true,
  name: "layout",
  async: false,
  returns: "",
  description:
    "Creates a layout structure on the output pane allowing multiple visuals to be placed onto it.",
  signatures: [
    [
      {
        parameterName: "panels",
        parameterType: "string",
        parameterDescription:
          "A string id value for the pane to create. Specifying the id alone will result in a single panel being created in the output pane.",
      },
    ],
    [
      {
        parameterName: "panels",
        parameterType: "object",
        parameterDescription: `A single panel can be specified, but additional information can be included. The following object shows the default values which can be overridden:
<pre>
{
    id: '_',        // The name of the panel
    size: 1,        // The size of the panel. Specify either absolute dimensions (e.g. 20px), or a flex value, e.g. 1
    fit: 'both'     // A value denoting how content should be scaled within the panel. The possible values are shown below.
}
</pre>
<p>
    <b>fit</b>
    The possible values for the <b>fit</b> property are:
    <ul>
        <li><b>none</b> - No scaling. If content overflows a panel, scrollbars will be added on both x and y axes.</li>
        <li><b>width</b> - Fit width. The content will be fit to the panel horizontally. If content overflows vertically, a vertical scrollbar will be added.</li>
        <li><b>height</b> - Fit height. The content will be fit to the panel vertically. If content overflows horizontally, a horizontal scrollbar will be added.</li>
        <li><b>both</b> - Fit both. The content will be fit entirely into the panel. This is the default setting.</li>
    </ul>
</p>`,
      },
    ],
    [
      {
        parameterName: "panels",
        parameterType: "Array",
        parameterDescription:
          "An array of panels. These can be either string values or object configurations. Multiple panels will then be created.",
      },
    ],
    [
      {
        parameterName: "panels",
        parameterType: "Any",
        parameterDescription: "The panel configuration.",
      },
      {
        parameterName: "direction",
        parameterType: "string",
        parameterDescription:
          "The direction / alignment of the panels within their parent. Can be set to 'horizontal' or 'vertical'.",
      },
    ],
    [
      {
        parameterName: "panels",
        parameterType: "Any",
        parameterDescription: "The panel configuration.",
      },
      {
        parameterName: "direction",
        parameterType: "string",
        parameterDescription:
          "Either the value [vertical] or [horizontal]. This defines how the layout will be drawn.",
      },
      {
        parameterName: "parentId",
        parameterType: "string",
        parameterDescription:
          "The id of the parent container to place the panels. Must be an existing element. If omitted, or null entered, the main layout will be added to the main output pane.",
      },
    ],
  ],
  examples: [
    {
      name: "Creating a simple dashboard layout.",
      description: `The following example illustrates how to create a 5-panel dashboard.`,
      code: `UI.layout(['top','bottom'], 'vertical');
UI.layout(['top-a','top-b','top-c'], 'horizontal', 'top');
UI.layout([{id: 'bottom-a', size: 1}, {id: 'bottom-b', size: 2}], 'horizontal', 'bottom');`,
    },
  ],
});
UI.layout = function (panels, direction = "horizontal", parentId = null) {
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
};

////////////////////////////////////////////////////
// UI.content
////////////////////////////////////////////////////
documentation.operations.push({
  class: "UI",
  static: true,
  name: "content",
  async: false,
  returns: "",
  description: "Outputs content to a panel on the output pane.",
  signatures: [
    [
      {
        parameterName: "content",
        parameterType: "Any",
        parameterDescription:
          "The content to write to the output. The content will be rendered in different ways depending on the type of object:<ul><li><b>string</b> - content rendered as Html content</li><li><b>Node</b> - Html node element placed directly into output. Note that the Visuals class returns Node objects.</li><li><b>object</b> - object content stringified prior to rendering</li><li><b>number</b> - numeric and other primitive types written directly.</li></ul>",
      },
    ],
    [
      {
        parameterName: "content",
        parameterType: "Any",
        parameterDescription:
          "The content to write to the output. The content will be rendered in different ways depending on the type of object:<ul><li><b>string</b> - content rendered as Html content</li><li><b>Node</b> - Html node element placed directly into output. Note that the Visuals class returns Node objects.</li><li><b>object</b> - object content stringified prior to rendering</li><li><b>number</b> - numeric and other primitive types written directly.</li></ul>",
      },
      {
        parameterName: "id",
        parameterType: "string",
        parameterDescription:
          "The id of the parent pane to add the content. If the id is omitted, the content will be rendered to the main output pane.",
      },
    ],
    [
      {
        parameterName: "content",
        parameterType: "Any",
        parameterDescription:
          "The content to write to the output. The content will be rendered in different ways depending on the type of object:<ul><li><b>string</b> - content rendered as Html content</li><li><b>Node</b> - Html node element placed directly into output. Note that the Visuals class returns Node objects.</li><li><b>object</b> - object content stringified prior to rendering</li><li><b>number</b> - numeric and other primitive types written directly.</li></ul>",
      },
      {
        parameterName: "id",
        parameterType: "string",
        parameterDescription:
          "The id of the parent pane to add the content. If the id is omitted, the content will be rendered to the main output pane.",
      },
      {
        parameterName: "append",
        parameterType: "boolean",
        parameterDescription:
          "If set to true, the content will be appended to existing content in the pane. Otherwise, the existing content will be replaced.",
      },
    ],
  ],
  examples: [
    {
      name: "Writing content to multiple panes.",
      description: `The following example illustrates how to write content to different panes..`,
      code: `UI.layout(['top','bottom'], 'vertical');
UI.layout(['top-a','top-b','top-c'], 'horizontal');
UI.layout(['bottom-a','bottom-b'], 'horizontal');
            
UI.content("This is the top-left panel", 'top-a');
UI.content(["red","orange","yellow","green","blue","indigo","violet"], 'top-c');
UI.content("&lt;h1&gt;Title&lt;/h1&gt;This is the bottom-right panel", 'bottom-b');`,
    },
  ],
});
UI.content = function (content, id = null) {
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
};

UI.clear = function (id = null) {
  // Note: all content goes into an inner div within visual
  // called div.visual.inner

  let el = document.getElementById(id);
  if (!el) {
    el = document.getElementById("output");
  }

  // Get inner div
  let elInner = el.firstChild;
  elInner.innerHTML = "";
};
