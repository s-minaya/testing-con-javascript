/* eslint-disable no-console */
/* eslint-disable implicit-arrow-linebreak */

const request = require("supertest");
const { MongoClient } = require("mongodb");
const { config } = require("../src/config");
const createApp = require("../src/app");

const DB_NAME = config.dbName;
const MONGO_URI = config.dbUrl;

describe("Test for books (E2E)", () => {
  let app;
  let server;
  let client;
  let database;

  // Helper para reintentar conexión a MongoDB (CI-safe)
  async function connectWithRetry(uri, dbName, maxRetries = 20, delayMs = 3000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const cli = new MongoClient(uri, {
          serverSelectionTimeoutMS: 2000,
        });

        await cli.connect();
        const db = cli.db(dbName);
        await db.command({ ping: 1 });

        return { cli, db };
      } catch (error) {
        lastError = error;
        console.log(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    throw lastError;
  }

  beforeAll(async () => {
    app = createApp();
    server = app.listen(3001);

    const connection = await connectWithRetry(MONGO_URI, DB_NAME);
    client = connection.cli;
    database = connection.db;
  }, 60000);

  afterEach(async () => {
    // Mantiene los tests aislados
    if (database) {
      await database.collection("books").deleteMany({});
    }
  });

  afterAll(async () => {
    if (database) {
      await database.dropDatabase();
    }

    if (client) {
      await client.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test("should return a list of books", async () => {
    // Arrange
    const seedResult = await database.collection("books").insertMany([
      { name: "Book 1", year: 1995, author: "Sofia" },
      { name: "Book 2", year: 2000, author: "Nicolas" },
    ]);

    // Act
    const response = await request(app).get("/api/v1/books").expect(200);

    // Assert
    const body = response.body;
    const books = Array.isArray(body) ? body : body.data || body.books;

    expect(Array.isArray(books)).toBe(true);
    expect(books).toHaveLength(seedResult.insertedCount);
  });
});
