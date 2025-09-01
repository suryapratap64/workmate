// Add global to window for simple-peer
if (typeof global === "undefined") {
  window.global = window;
}

// Add process.nextTick
if (typeof process === "undefined") {
  window.process = {
    env: { NODE_ENV: "production" },
    nextTick: function (fn) {
      setTimeout(fn, 0);
    },
    version: "",
    platform: "",
  };
}

// Add Buffer for simple-peer
if (typeof global.Buffer === "undefined") {
  global.Buffer = require("buffer/").Buffer;
}
