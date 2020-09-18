/**
 * Generator function to convert plain array into list of objects.
 */
let arrayToObjectList = function (arr) {
  let columns = arr[0];
  let results = [];
  for (let i = 1; i < arr.length; i++) {
    let row = {};
    for (let j = 0; j < columns.length; j++) {
      row[columns[j]] = arr[i][j];
      results.push(row);
    }
  }
  return results;
};

let Csv = function (str) {
  let arr = str.csvToArray();
  let ar = arrayToObjectList(arr);
  let objList = arrayToObjectList(arr);
  console.log(objList);
  let df = DataFrame.create(objList);
  alert(df.model());
  return df;
};

export default {
  Csv,
};
