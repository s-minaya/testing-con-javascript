/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const { generateManyBooks } = require("../fakes/book.fake");
const BooksService = require("./books.service");

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
    jest.clearAllMocks();
    service = new BooksService();
  });

  describe("getBooks method", () => {
    test("should return an array with the same length as the fake data and call the DB once", async () => {
      // Arrange
      const fakeBooks = generateManyBooks(20);
      mockGetAll.mockResolvedValue(fakeBooks);

      // Act
      const books = await service.getBooks({});
      console.log(books);

      // Assert
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toEqual(fakeBooks.length);
      expect(mockGetAll).toHaveBeenCalledTimes(1);
      expect(mockGetAll).toHaveBeenCalledWith("books", {});
    });

    test("should return the same first book object provided by the fake generator", async () => {
      // Arrange
      const fakeBooks = generateManyBooks(4);
      mockGetAll.mockResolvedValue(fakeBooks);

      // Act
      const books = await service.getBooks({});
      console.log(books);
      // Debug information in case of failure
      // console.log('books', books);

      // Assert
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBeGreaterThan(0);
      expect(books[0]).toBeDefined();
      expect(books[0].name).toEqual(fakeBooks[0].name);
    });
  });
});
