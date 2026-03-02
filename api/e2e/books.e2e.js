/* eslint-disable no-promise-executor-return */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const request = require("supertest");

const { MongoClient } = require("mongodb");

const { config } = require("../src/config");

const DB_NAME = config.dbName;
const MONGO_URI = config.dbUrl;

const createApp = require("../src/app");

describe("Test for books", () => {
  let app = null;
  let server = null;
  let client = null;
  let database = null;

  // Helper para reintentar conexión a MongoDB
  async function connectWithRetry(uri, dbName, maxRetries = 10, delayMs = 2000) {
    let lastErr;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const cli = new MongoClient(uri);
        await cli.connect();
        const db = cli.db(dbName);
        // Prueba una operación simple para asegurar conexión
        await db.command({ ping: 1 });
        return { cli, db };
      } catch (err) {
        lastErr = err;
        console.log(`MongoDB connection attempt ${i + 1} failed:`, err.message);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
    throw lastErr;
  }

  beforeAll(async () => {
    console.log("MONGO_URI:", MONGO_URI);
    console.log("DB_NAME:", DB_NAME);
    app = createApp();
    server = app.listen(3001);
    // Reintenta la conexión a MongoDB
    const result = await connectWithRetry(MONGO_URI, DB_NAME);
    client = result.cli;
    database = result.db;
    if (!database) throw new Error("Database connection failed");
  }, 60000);

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    if (database) {
      await database.dropDatabase();
    }
    if (client) {
      await client.close();
    }
  });
  test("should return a list books", async () => {
    // Arrange
    const seedData = await database.collection("books").insertMany([
      {
        name: "Book 1",
        year: 1995,
        author: "Sofia",
      },
      {
        name: "Book 2",
        year: 2000,
        author: "Nicolas",
      },
    ]);
    console.log(seedData);

    // Act
    return request(app)
      .get("/api/v1/books")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        // Permite tanto array plano como { data: [...] } o { books: [...] }
        const books = Array.isArray(body) ? body : body.data || body.books;
        expect(Array.isArray(books)).toBe(true);
        expect(books).toHaveLength(seedData.insertedCount);
      });
  });
});
