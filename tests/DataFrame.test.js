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

test("DataFrame.group() without aggretations should return distinct groups", () => {
  let grouped = DataFrame.examples.iris().group((g) => {
    return { class: g.class };
  });

  expect(grouped.count()).toEqual(3); // 3 groups each with count property of 50
  expect(Object.getOwnPropertyNames(grouped[0]).length).toBe(1);
  expect(Object.getOwnPropertyNames(grouped[0])[0]).toBe("class");
});

test("DataFrame.group() with aggregations should group and aggregate correctly", () => {
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

test("DataFrame.group() with pivot function should pivot correctly", () => {
  let pivot = DataFrame.examples.anscombe().group(
    (g) => {
      return { observation: g.observation };
    },
    (a) => {
      return { x: a.list("x").mean(), y: a.list("y").mean() };
    },
    (p) => p.dataset
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

test("DataFrame indexing and use of model calculations", () => {
  // This tests the DataFrame indexer [].
  // Also, it tests the use of calculations, and the
  // use of calculations that use other calculations.
  // This covers the Proxy code.

  let data = [
    { id: 1, name: "david", age: 41, sex: "m" },
    { id: 2, name: "peter", age: 25, sex: "m" },
    { id: 3, name: "jane", age: 33, sex: "f" },
    { id: 4, name: "ann", age: 51, sex: "f" },
    { id: 5, name: "carole", age: 34, sex: "f" },
    { id: 6, name: "ian", age: 26, sex: "m" },
    { id: 7, name: "margaret", age: 71, sex: "f" },
    { id: 8, name: "paul", age: 18, sex: "m" },
    { id: 9, name: "julie", age: 22, sex: "f" },
  ];

  let df = DataFrame.create(data);

  df = df
    .calculate({
      sexDesc: (r, df) => (r.sex === "m" ? "male" : "female"),
      ageBand: (r, df) => Math.floor(r.age / 10) * 10,
      ABC: (r, df) =>
        r.ageBand >= 50 ? "A" : r.sexDesc === "female" ? "B" : "C",
    })
    .measure({
      count: (g, df) => g.count(),
    });

  expect(df[3].ABC).toBe("A");
  expect(df[4].ABC).toBe("B");
  expect(df[5].ABC).toBe("C");
});

test("DataFrame joins", () => {
  let sales = DataFrame.create([
    { customer: "A1495", sku: "BH41", qty: 10, unitPrice: 1.45 },
    { customer: "G234", sku: "HF42", qty: 1, unitPrice: 2.0 },
    { customer: "F4824", sku: "AH52", qty: 5, unitPrice: 1.0 },
    { customer: "E472", sku: "IF14", qty: 20, unitPrice: 1.2 },
    { customer: "A2235", sku: "FI42", qty: 5, unitPrice: 1.8 },
    { customer: "J942", sku: "AV91", qty: 2, unitPrice: 2.5 },
    { customer: "B1244", sku: "FY14", qty: 1, unitPrice: 3 },
    { customer: "S95", sku: "FE56", qty: 5, unitPrice: 5 },
    { customer: "D424", sku: "FE39", qty: 1, unitPrice: 2.5 },
    { customer: "P1254", sku: "DD67", qty: 2, unitPrice: 3.0 },
  ]);

  let customers = DataFrame.create([
    { customer: "A1495", name: "Paul Allen" },
    { customer: "G234", name: "Tony George" },
    { customer: "F4824", name: "Dave Farthing" },
    { customer: "E472", name: "Simone Earl" },
    { customer: "A2235", name: "Fiona Abbot" },
    { customer: "J942", name: "Tracy Jones" },
    { customer: "B1244", name: "Stan Brown" },
    { customer: "S345", name: "Michael Smith" },
    { customer: "F254", name: "Dave Firth" },
    { customer: "J1344", name: "Stuart Jones" },
  ]);

  // The join types, and the expected row counts.
  let joinTests = {
    outer: 13,
    inner: 7,
    left: 10,
    right: 10,
  };

  Object.getOwnPropertyNames(joinTests).forEach((j) => {
    let join = sales.join(
      customers,
      j,
      (left, right) => {
        return left.customer === right.customer;
      },
      (left, right) => {
        return {
          customer: right.customer ?? left.customer ?? null,
          name: right.name ?? null,
          sku: left.customer ?? null,
          qty: left.qty ?? null,
          unitPrice: left.unitPrice ?? null,
        };
      }
    );

    expect(join.count()).toBe(joinTests[j]);
  });
});

test("Ensure model() returns all features of the model", () => {
  let mt = DataFrame.examples.mtcars();
  mt.calculate({
    brand: (r, df) => {
      let pos = r.model.indexOf(" ");
      if (pos !== -1) {
        return r.model.substring(0, pos);
      } else {
        return r.model;
      }
    },
  }).measure({
    count: (g, df) => g.count(),
  });

  expect(mt.model().length).toEqual(14); // 14 variables in model, including 'brand' and 'count'
  //["model","mpg","cyl","disp","hp","drat","wt","qsec","vs","am","gear","carb","brand","count"]
});

test("Ensure the cube() method aggregates selected columns from the model", () => {
  let mt = DataFrame.examples.mtcars();

  mt.calculate({
    brand: (r, df) => {
      let pos = r.model.indexOf(" ");
      if (pos !== -1) {
        return r.model.substring(0, pos);
      } else {
        return r.model;
      }
    },
  }).measure({
    count: (g, df) => g.count(),
  });

  // Create a cube from the raw data with just 2 attributes: brand + count.
  // There are 22 different brands, so should create a 22*2 DataFrame instance
  let cube = mt.cube("brand", "count");
  expect(cube.count()).toBe(22);
  expect(Object.getOwnPropertyNames(cube[0]).length).toBe(2);
});

export default {};
