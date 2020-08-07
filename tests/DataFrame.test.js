import DataFrame from "../src/AnalyticsNotebook/DataFrame.js";
import "../src/AnalyticsNotebook/DataFrame.examples.js";

test("DataFrame.create creates a DataFrame object", () => {
  let data = [
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
    { a: 1, b: 2 },
  ];
  let df = DataFrame.create(data);

  expect(df).not.toBeNull();
});

test("Iris example returns 150 rows.", () => {
  expect(DataFrame.examples.iris().count()).toBe(150);
});

test("Titanic example returns 1309 rows.", () => {
  expect(DataFrame.examples.titanic().count()).toBe(1309);
});

test("Anscombe example returns 44 rows.", () => {
  expect(DataFrame.examples.anscombe().count()).toBe(44);
});

// DataFrame instace / prototype methods

test("DataFrame.count() should return correct number of rows", () => {
  expect(DataFrame.examples.iris().count()).toBe(150);
});

test("DataFrame.head() should return first n rows", () => {
  expect(DataFrame.examples.iris().head(10).count()).toBe(10);
});

test("DataFrame.map() should transform a DataFrame", () => {
  let mapped = DataFrame.examples.iris().map((r) => {
    return { a: 10, b: 20 };
  });

  expect(mapped.count()).toBe(150);
  expect(mapped[0]).toEqual({ a: 10, b: 20 });
});

test("DataFrame indexing should return the correct row", () => {
  expect(DataFrame.examples.iris()[0]).toEqual({
    sepal_length_cm: 5.1,
    sepal_width_cm: 3.5,
    petal_length_cm: 1.4,
    petal_width_cm: 0.2,
    class: "Iris-setosa",
  });
});

test("DataFrame.forEach() should work correctly", () => {
  let count = 0;
  DataFrame.examples.iris().forEach((row) => {
    count++;
  });
  expect(count).toBe(150);
});

export default {};
