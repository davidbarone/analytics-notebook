let linear = function (dataFrame, independent, dependent) {
  let r = dataFrame.list(independent).corr(dataFrame.list(dependent));
  let sy = dataFrame.list(dependent).std();
  let sx = dataFrame.list(independent).std();

  let b1 = (r * sy) / sx;

  let xbar = dataFrame.list(independent).mean();
  let ybar = dataFrame.list(dependent).mean();

  let b0 = ybar - b1 * xbar;

  console.log(`b0: ${b0}`);
  console.log(`b1: ${b1}`);
};
