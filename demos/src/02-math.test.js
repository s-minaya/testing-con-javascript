const { sum, multiply, divide, percentage } = require("./02-math");

describe("Test for math functions", () => {
  describe("Test for sum", () => {
    test("adds 1 + 3 should be 4", () => {
      const rta = sum(1, 3);
      expect(rta).toBe(4);
    });
  });

  describe("Test for multiply", () => {
    test("should be 4", () => {
      const rta = multiply(1, 4);
      expect(rta).toBe(4);
    });
  });

  describe("Test for divide", () => {
    test("should divide for zero", () => {
      const rta = divide(6, 0);
      expect(rta).toBeNull();
      const rta2 = divide(5, 0);
      expect(rta2).toBeNull();
    });
  });

  describe("Test for percentage", () => {
    test("should calculate percentage", () => {
      const rta = percentage(20, 80);
      expect(rta).toBe(16);
    });
  });
});
