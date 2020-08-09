import "../src/AnalyticsNotebook/Extensions.js";

test("Object.mergeDeep merges 2 objects correctly", () => {
  let first = {
    a: 1,
    b: {
      c: "hello",
    },
  };
  let second = {
    b: {
      c: "another",
      d: "world",
    },
    c: {
      foo: "bar",
    },
  };

  let result = Object.mergeDeep(first, second);

  expect(result).toEqual({
    a: 1,
    b: {
      c: "another",
      d: "world",
    },
    c: {
      foo: "bar",
    },
  });
});
