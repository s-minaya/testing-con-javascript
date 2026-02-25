function sum(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return null;
  }
  return a / b;
}

function percentage(a, b) {
  return (a * b) / 100;
}
module.exports = {
  sum,
  multiply,
  divide,
  percentage,
};
