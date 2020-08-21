import Visual from "../Visual.js";
import VisualLibraryBase from "./Visual.library.base.js";

/**
 * Renderer that renders static HTML content.
 * @param {Visual} visual - The Visual object used for rendering.
 * @returns {Node}
 * @example <caption>Displaying HTML content</caption>
 * Visual.html('hello world').attach('root');
 */
Visual.library.html = function (visual) {
    let dataFrame = visual.dataFrame;
    let options = visual.options;
    let elDiv = document.createElement("div");
    let html = options.html || "";
    elDiv.innerHTML = html;
    return elDiv;
};
