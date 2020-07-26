class Visual {
    constructor(dataFrame, renderer, options) {
        this.dataFrame = dataFrame;
        this.options = options;
        this.renderer = renderer;
        this.panelId = null;  // set by assign
        walk(this);
        Visual.collection.push(this);
    }

    // object that contains the assignments of visual <-> panel
    // Each property is an array of visuals. Id = Panel.id.
    static watchers = [];

    // Registry of all visuals pushed
    static collection = [];

    /// Assigns the visual to the DOM
    attach(panelId) {
        this.panelId = panelId;
        const watcher =
            new Watcher(
                () => this.dataFrame.data,
                (val) => this.render()
            );
    }

    render() {
        // clear the panel + redraw all visuals in the panel.
        let id = this.panelId;
        UI.clear(id);
        Visual.collection.forEach(c => {
            let content = c.renderer(c.dataFrame, c.options);
            let id = c.panelId;
            UI.content(content, id);
        });
    }
}

Visual.table = function (dataFrame, options) {
    let first = dataFrame.data[0];
    let columns = Object.getOwnPropertyNames(first);

    let html = "";

    html += "<table>";
    html += "<tr>";

    columns.forEach(c => html += `<th>${c}</th>`);
    html += "</tr>";

    dataFrame.data.forEach(r => {
        html += "<tr>";
        columns.forEach(c => {
            html += `<td>${r[c]}</td>`;
        })
        html += "</tr>";
    });
    html += "</table>";

    return html;
}

Visual.slicer = function (dataFrame, options) {
    let elDiv = document.createElement("div");
    if (options.title) {
        let elTitle = document.createElement("h5");
        elTitle.innerText = options.title;
        elDiv.appendChild(elTitle);
    }

    elSelect = document.createElement("select");
    let values = dataFrame.column(options.columnName).distinct();

    elSelect.addEventListener("change", function (evt) {
        // Slice the dataFrame
        let value = evt.target.value;
        if (value) {
            let slicer = {};
            slicer[options.columnName] = [value];
            dataFrame.slice(slicer);
        } else {
            dataFrame.reset();
        }
    });

    let elAll = document.createElement("option");
    elAll.value = null;
    elAll.text = "<select value>";
    elSelect.appendChild(elAll);

    // If slicer context already set, automatically set value
    let slicer = dataFrame.slicers[options.columnName];
    let selectedValue = null;
    if (slicer) {
        //values = values.filter(v => { slicer.includes(v) });
        //alert(values.length);
        selectedValue = values[0];
    }

    values.forEach(v => {
        let elOption = document.createElement("option");
        elOption.value = v;
        elOption.text = v;
        elOption.selected = (v === selectedValue);
        elSelect.appendChild(elOption);
    })


    elReset = document.createElement("button");
    elReset.innerText = "Clear";
    elReset.addEventListener('click', function (evt) {
        dataFrame.reset();
    });

    elDiv.appendChild(elSelect);
    elDiv.appendChild(elReset);
    return elDiv;
}


