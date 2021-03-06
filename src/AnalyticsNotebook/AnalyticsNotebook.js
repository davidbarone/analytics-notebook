import UI from "./UI.js";
import PANEL_FIT from "./PanelFit.js";

var notebooks = [];
var dragging = false; //set to true when vertical drag bar between config + output panes being moved.
var draggingH = false; //set to true when vertical drag bar between config + output panes being moved.
var showNotebookLoadSave = false;

// IO URLS
var urlCategories = "https://[enter endpoint...]";
var urlNotebooks = "https://[enter endpoint...]";
var docsPath = "AnalyticsNotebook.Docs.html";

function showHelp() {
  document.getElementById("waiting").classList.add("show");

  setTimeout(() => {
    UI.layout({ id: "root", fit: "width" });

    fetch("./AnalyticsNotebook.Docs.html")
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var body = doc.querySelector("body");

        // add to root
        UI.content(body, "root");
        document.getElementById("waiting").classList.remove("show");
      });
  });

  /*
  document.getElementById(
    "root"
  ).innerHTML = `<object type="text/html" style="width: 100%; height: 100%" data="./AnalyticsNotebook.Docs.html" ></object>`;
    */
}

function runCode() {
  document.getElementById("waiting").classList.add("show");

  setTimeout(() => {
    // clear output + console
    UI.reset();
    let elConsole = document.getElementById("console");
    elConsole.innerHTML = "";
    var code = document.getElementById("code").value;
    code = `
async function notebookCode() {
  ${code}
};

notebookCode().then(r=> {
  // remove the waiting css
  document.getElementById("waiting").classList.remove("show");  
}).catch(err => {
  console.log(err.message);
  document.getElementById("waiting").classList.remove("show");  
});
`;
    var scriptElem = document.createElement("script");
    scriptElem.text = code;
    document.head.appendChild(scriptElem);
    // and immediately remove script upon completion
    document.head.removeChild(scriptElem);
  }, 100);
}

function slider() {
  var button = document.getElementById("slider");
  var config = document.getElementById("config");
  var output = document.getElementById("output");
  var text = button.innerText;
  if (text === ">") {
    // show
    button.innerText = "<";
    config.style.width = "500px";
  } else {
    // hide
    button.innerText = ">";
    config.style.width = "0px";
  }
  resizePanelContents();
}

async function getCategories() {
  var url = urlCategories;
  var result = await fetch(url, {
    credentials: "include",
  });
  var data = await result.json();
  elCategories = document.getElementById("categories");
  elCategories.innerHTML = "";
  var option = document.createElement("option");
  option.text = "[Please select...]";
  option.value = null;
  elCategories.add(option);
  data.forEach((c) => {
    var option = document.createElement("option");
    option.text = c;
    option.value = c.toLowerCase();
    elCategories.add(option);
  });
}

async function getNotebooks(category) {
  var url = `${urlNotebooks}/${category}`;
  var result = await fetch(url, {
    credentials: "include",
  });
  notebooks = await result.json();
  elNotebooks = document.getElementById("notebooks");
  elNotebooks.innerHTML = "";
  var option = document.createElement("option");
  option.text = "[Please select...]";
  option.value = null;
  elNotebooks.add(option);
  notebooks.forEach((n) => {
    var option = document.createElement("option");
    option.text = n.notebook;
    option.value = n.notebook.toLowerCase();
    elNotebooks.add(option);
  });
}

function loadNotebook() {
  // Get name
  let elNotebook = document.getElementById("notebooks");
  let name = elNotebook.options[elNotebook.selectedIndex].text;
  let selectedNotebook = notebooks.filter((n) => {
    return n.notebook.toLowerCase() === name.toLowerCase();
  })[0];
  let elCode = document.getElementById("code");
  elCode.value = selectedNotebook.script;
  let elSaveAs = document.getElementById("saveAs");
  elSaveAs.value = name;
}

function saveNotebook() {
  let elCategory = document.getElementById("categories");
  let category = elCategory.options[elCategory.selectedIndex].text;
  let notebook = document.getElementById("saveAs").value;
  let overwrite = document.getElementById("overwrite").checked;
  let code = document.getElementById("code").value;
  var url = `${urlNotebooks}/${category}/${notebook}/${overwrite}`;
  fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain",
    },
    body: code,
  }).then(
    async (response) => {
      if (!response.ok) {
        response.text().then((text) => alert(text));
      } else {
        alert("Saved successfully");
        await getNotebooks(category);
        document.getElementById("notebooks").value = notebook.toLowerCase();
      }
    },
    (error) => {
      alert(error);
    }
  );
}

function deleteNotebook() {
  let category = document.getElementById("categories").value;
  let notebook = document.getElementById("notebooks").value;

  if (confirm(`Are you sure you wish to delete notebook: [${notebook}]?`)) {
    var url = `${urlNotebooks}/${category}/${notebook}`;
    fetch(url, {
      method: "DELETE",
      credentials: "include",
    }).then(
      (response) => {
        if (!response.ok) {
          response.text().then((text) => alert(text));
        } else {
          alert("Notebook deleted");
          getNotebooks(category);
          document.getElementById("saveAs").value = "";
        }
      },
      (error) => {
        alert(error);
      }
    );
  }
}

let resizePanelContents = function (el) {
  var elPanes = document.querySelectorAll("div.panel.leaf");
  elPanes.forEach((el) => {
    el.fit();
  });
};

// on DOM loaded
document.addEventListener("DOMContentLoaded", async function () {
  // Create default root panel in output
  UI.reset();

  if (showNotebookLoadSave) {
    // Get categories
    await getCategories();

    document
      .getElementById("categories")
      .addEventListener("change", function () {
        getNotebooks(document.getElementById("categories").value);
      });

    document.getElementById("load").addEventListener("click", function (evt) {
      document.getElementById("code").innerHTML = "";
      loadNotebook();
      evt.preventDefault();
    });

    document.getElementById("save").addEventListener("click", function (evt) {
      saveNotebook();
      evt.preventDefault();
    });

    document.getElementById("delete").addEventListener("click", function (evt) {
      deleteNotebook();
      evt.preventDefault();
    });
  } else {
    let elFile = document.getElementById("file");
    elFile.style.display = "none";
  }

  // When window resizes, adjust all pane contents if set to 'fit'
  window.addEventListener("resize", (evt) => {
    resizePanelContents();
  });

  document
    .getElementById("dragBar")
    .addEventListener("mousedown", function (evt) {
      evt.preventDefault();
      let elDragBar = document.getElementById("dragBar");
      if (evt.target === elDragBar) {
        dragging = true;
      }
    });

  document
    .getElementById("dragBarH")
    .addEventListener("mousedown", function (evt) {
      evt.preventDefault();
      let elDragBarH = document.getElementById("dragBarH");
      if (evt.target === elDragBarH) {
        draggingH = true;
      }
    });

  document.addEventListener("mousemove", function (evt) {
    if (dragging) {
      let elConfig = document.getElementById("config");
      let leftOffset = elConfig.parentNode.offsetLeft;
      elConfig.style.width = evt.clientX - leftOffset + "px";
      resizePanelContents();
    } else if (draggingH) {
      let elConsole = document.getElementById("console");
      let height =
        elConsole.parentNode.clientHeight +
        elConsole.parentNode.offsetTop -
        evt.clientY;
      elConsole.style.height = height + "px";
      resizePanelContents();
    } else {
      return false;
    }
  });

  document.addEventListener("mouseup", function (evt) {
    dragging = false;
    draggingH = false;
  });

  // Handler for keydown - check for ctrl/enter to run code
  document.getElementById("code").addEventListener("keydown", (evt) => {
    if (evt.keyCode == 13 && evt.ctrlKey) {
      runCode();
    }
  });

  document.getElementById("run").addEventListener("click", (evt) => {
    runCode();
  });

  document.getElementById("help").addEventListener("click", (evt) => {
    showHelp();
  });

  document.getElementById("slider").addEventListener("click", (evt) => {
    slider();
  });

  // redirect console.log to console pane in DOM
  var consolePane = document.getElementById("console");
  console.log = function (message) {
    if (typeof message == "object") {
      consolePane.innerHTML +=
        (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
    } else {
      consolePane.innerHTML += `${message}<br />`;
    }
  };
  window.onerror = function (message, url, lineNo, columnNo, error) {
    document.getElementById("waiting").classList.remove("show");
    if (typeof message == "object") {
      consolePane.innerHTML += `<div style="color:red;">${url}: [${lineNo}, ${columnNo}]: ${error}, ${
        JSON && JSON.stringify ? JSON.stringify(message) : message
      }<br /></div>`;
    } else {
      consolePane.innerHTML += `<div style="color:red;">${url}: [${lineNo}, ${columnNo}]: ${error}, ${message}<br /></div>`;
    }
    return true;
  };
  window.onunhandledrejection = function (e) {
    document.getElementById("waiting").classList.remove("show");
    consolePane.innerHTML += `<div style="color:red;">${e.reason}<br /></div>`;
    return true;
  };

  // Parse url - if category + notebook passed in, set + run
  let queryString = location.search;
  let urlParams = new URLSearchParams(queryString);
  if (
    showNotebookLoadSave &&
    urlParams.has("category") &&
    urlParams.has("notebook")
  ) {
    let category = urlParams.get("category").toLowerCase();
    let notebook = urlParams.get("notebook").toLowerCase();
    let elCategories = document.getElementById("categories");
    elCategories.value = category;
    await getNotebooks(category);
    document.getElementById("notebooks").value = notebook;
    loadNotebook();
    runCode();
    slider();
  }
  if (urlParams.has("script")) {
    let elCode = document.getElementById("code");
    code.innerHTML = urlParams.get("script");
    runCode();
  }
});

export default {
  showHelp,
  runCode,
  slider,
  getCategories,
  getNotebooks,
  loadNotebook,
  saveNotebook,
  deleteNotebook,
  resizePanelContents,
};
