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

test("DataFrame.filter() should correctly filter rows", () => {
  expect(
    DataFrame.examples
      .iris()
      .filter((r) => r.class === "Iris-setosa")
      .count()
  ).toBe(50);
});

test("DataFrame.group() should group correctly", () => {
  let grouped = DataFrame.examples.iris().group(
    (g) => {
      return { class: g.class };
    },
    (a) => {
      return { observations: a.count() };
    }
  );

  expect(grouped.count()).toEqual(3); // 3 groups each with count property of 50
  expect(grouped[0].observations).toBe(50);
  expect(grouped[1].observations).toBe(50);
  expect(grouped[2].observations).toBe(50);
});

test("DataFrame.pivot() should pivot correctly", () => {
  let pivot = DataFrame.examples.anscombe().pivot(
    (g) => {
      return { observation: g.observation };
    },
    (p) => p.dataset,
    (a) => {
      return { x: a.list("x").mean(), y: a.list("y").mean() };
    }
  );

  expect(pivot.count()).toEqual(11); // 11 grouping columns
  expect(Object.getOwnPropertyNames(pivot[0]).length).toBe(5); // first row should have 5 columns
  expect(
    Object.getOwnPropertyNames(pivot[0]).indexOf("observation") >= 0
  ).toBeTruthy();
  expect(Object.getOwnPropertyNames(pivot[0]).indexOf("1") >= 0).toBeTruthy();
  expect(Object.getOwnPropertyNames(pivot[0]).indexOf("2") >= 0).toBeTruthy();
  expect(Object.getOwnPropertyNames(pivot[0]).indexOf("3") >= 0).toBeTruthy();
  expect(Object.getOwnPropertyNames(pivot[0]).indexOf("4") >= 0).toBeTruthy();

  expect(typeof pivot[0][1]).toBe("object");
});

export default {};
