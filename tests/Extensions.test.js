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

  let result = Object.mergeDeep({}, first, second);

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

test("String.prototype.csvTextToArray parses CSV strings correctly #1", () => {
  let csv = `Name,Age,Country
  Fred,21,UK
  John,35,AUS`;

  expect(csv.csvToArray().length).toBe(3);
  expect(csv.csvToArray()[0][0]).toBe("Name");
  expect(csv.csvToArray()[1][1]).toBe("21");
});

test("String.prototype.csvTextToArray parses CSV strings correctly #2", () => {
  let csv = `Name,Age,Country
  Fred,21, UK
  "John" , 35,"AUS" `;

  expect(csv.csvToArray().length).toBe(3);
  expect(csv.csvToArray()[0][0]).toBe("Name");
  expect(csv.csvToArray()[1][1]).toBe("21");
});
