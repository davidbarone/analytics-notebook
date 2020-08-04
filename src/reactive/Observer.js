import Dep from "./Dep.js";

// See https://github.com/vuejs/vue/blob/61187596b9af48f1cb7b1848ad3eccc02ac2509d/src/core/observer/index.js
// for full implementation

/* Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
window.walk = function (obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]]);
  }
};

window.defineReactive = function (obj, key, val) {
  if (val !== null && typeof val === "object") {
    walk(val); // Add reactivity to all children of val
  }

  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.depend();
      return val;
    },
    set: function reactiveSetter(newVal) {
      val = newVal;
      dep.notify();
    },
  });
};

export default {};
