/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
const BooksService = require("./books.service");

const fakeBooks = [
  {
    _id: 1,
    name: "Harry Potter",
  },
];

const mockGetAll = jest.fn();

const MongoLibStub = {
  getAll: mockGetAll,
  create: () => {},
};

jest.mock("../lib/mongo.lib", () =>
  jest.fn().mockImplementation(() => ({
    getAll: mockGetAll,
    create: () => {},
  })),
);

describe("Test for BooksService", () => {
  let service;
  beforeEach(() => {
    service = new BooksService();
    jest.clearAllMocks();
  });

  describe("Test for getBooks", () => {
    test("Should return a list book", async () => {
      // Arrange
      mockGetAll.mockResolvedValue(fakeBooks);
      // Act
      const books = await service.getBooks({});
      console.log(books);

      // Assert
      expect(books.length).toEqual(1);
      expect(mockGetAll).toHaveBeenCalled(); // Verificar que se llamó a getAll
      expect(mockGetAll).toHaveBeenCalledTimes(1); // Verificar que se llamó una vez
      expect(mockGetAll).toHaveBeenCalledWith("books", {}); // Verificar que se llamó con los argumentos correctos
    });
  });
  describe("Test for getBooks", () => {
    test("Should return a list book", async () => {
      // Arrange
      mockGetAll.mockResolvedValue([
        {
          _id: 1,
          name: "Harry Potter 2",
        },
      ]);
      // Act
      const books = await service.getBooks({});
      console.log(books);

      // Assert
      expect(books[0].name).toEqual("Harry Potter 2");
    });
  });
});
