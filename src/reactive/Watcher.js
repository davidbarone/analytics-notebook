import Dep from "./Dep.js";

// See https://github.com/vuejs/vue/blob/be9ac624c81bb698ed75628fe0cbeaba4a2fc991/src/core/observer/watcher.js
// for full implementation

class Watcher {
  constructor(getter, cb) {
    this.getter = getter; // function that returns a value based on reactive properties
    this.cb = cb; // function that is run on value updates, and is passed value and old value
    this.value = this.get();
    this.cb(this.value, null);
  }

  get() {
    Dep.pushTarget(this);
    const value = this.getter();
    Dep.popTarget();
    return value;
  }

  addDep(dep) {
    dep.addSub(this);
  }

  update() {
    const value = this.get();
    const oldValue = this.value;
    this.value = value;
    this.cb(value, oldValue);
  }
}

export default Watcher;
