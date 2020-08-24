import "../src/AnalyticsNotebook/Extensions.js";
import DataFrame from "../src/AnalyticsNotebook/DataFrame.js";
import "../src/AnalyticsNotebook/DataFrame.examples.js";


test("Check that zero values are included", () => {
    // Javascript treats zero number value as falsy.
    // But we need to treat as truthy (i.e. include in all statistical + aggregations)

    // vs column is 0/1 field.
    let list = DataFrame.examples.mtcars().list('vs');

    expect(list.count()).toBe(32);  // mtcars dataset has 32 rows.
    expect(list.values().count()).toBe(32);  // values() should include 0
    expect(list.unique().count()).toBe(2);  // 0 & 1
    expect(list.mean()).toBe(.4375);
    expect(list.std().toFixed(5)).toEqual("0.50402");
    expect(list.corr(list)).toBe(1); // a.corr(a) should always equals 1


});