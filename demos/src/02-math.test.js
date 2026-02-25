const { sum, multiply, divide, percentage } = require("./02-math");

test("adds 1 + 3 should be 4", () => {
  const rta = sum(1, 3);
  expect(rta).toBe(4);
});

test("should be 4", () => {
  const rta = multiply(1, 4);
  expect(rta).toBe(4);
});

test("should divide for zero", () => {
  const rta = divide(6, 0);
  expect(rta).toBeNull();
  const rta2 = divide(5, 0);
  expect(rta2).toBeNull();
});

test("should calculate percentage", () => {
  const rta = percentage(20, 80);
  expect(rta).toBe(16);
});
