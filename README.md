# 🧪 JavaScript Testing

> Proyecto de aprendizaje donde implementé una estrategia de testing completa sobre una arquitectura Node.js + MongoDB, cubriendo desde análisis estático hasta pruebas E2E automatizadas con CI/CD en GitHub Actions.

---

## 📋 Tabla de contenidos

1. [Stack & Herramientas](#stack--herramientas)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [La pirámide del testing](#la-pirámide-del-testing)
4. [Pruebas estáticas](#1-pruebas-estáticas--análisis-estático)
5. [Pruebas unitarias](#2-pruebas-unitarias)
6. [Mocking, Stubs y Spies](#mocking-stubs-y-spies)
7. [Pruebas de integración](#3-pruebas-de-integración)
8. [Pruebas E2E](#4-pruebas-end-to-end-e2e)
9. [Pruebas de UI](#5-pruebas-de-ui)
10. [CI/CD con GitHub Actions](#cicd-con-github-actions)
11. [Coverage Report](#coverage-report)
12. [Metodologías](#metodologías)
13. [Glosario](#glosario)

---

## Stack & Herramientas

| Categoría | Herramienta | Uso |
|---|---|---|
| **Unit / Integration** | [Jest](https://jestjs.io/) | Framework principal de testing |
| **API Testing** | [Supertest](https://www.npmjs.com/package/supertest) | Pruebas de integración sobre HTTP |
| **UI / E2E Browser** | [Playwright](https://playwright.dev/) | Automatización de navegadores |
| **Datos falsos** | [@faker-js/faker](https://fakerjs.dev/) | Generación dinámica de fixtures |
| **Análisis estático** | ESLint + Prettier | Calidad de código sin ejecutarlo |
| **Tipado estático** | TypeScript / TSLint | Detección de errores en tiempo de escritura |
| **Base de datos** | MongoDB + Docker | Entorno de pruebas aislado |
| **CI/CD** | GitHub Actions | Automatización del pipeline de calidad |

---

## Arquitectura del proyecto

```
/
├── api/                         # Backend Express + MongoDB
│   ├── src/
│   │   ├── app.js               # Configuración de Express
│   │   ├── config/              # Variables de entorno
│   │   ├── routes/              # Endpoints REST
│   │   ├── services/
│   │   │   ├── books.service.js
│   │   │   └── books.service.test.js   # ← Unit tests
│   │   ├── lib/
│   │   │   └── mongo.lib.js
│   │   └── fakes/
│   │       └── book.fake.js     # Fixtures con Faker
│   └── e2e/
│       ├── jest-e2e.json
│       ├── hello.e2e.js         # ← Integration test
│       ├── books.integration.js # ← Integration test con mock
│       └── books.e2e.js         # ← E2E test con MongoDB real
│
├── webapp/
│   └── test/
│       └── example.spec.js      # ← UI test con Playwright
│
├── demos/
│   └── src/                     # Ejercicios de Jest básico
│
└── .github/
    └── workflows/
        └── api-ci.yml           # ← Pipeline CI/CD
```

---

## La pirámide del testing

```
         /\
        /E2E\           ← Pocos, lentos, costosos → máxima confianza
       /──────\
      / Integr.\        ← Validan que las partes trabajen juntas
     /──────────\
    / Unit Tests  \     ← Muchos, rápidos, baratos → base sólida
   /______________\
  / Static Analysis\    ← Feedback instantáneo mientras escribes
 /──────────────────\
```

Cada capa protege lo que la anterior no cubre. El objetivo no es elegir una, sino combinarlas de forma inteligente.

> **Deuda técnica:** En fases tempranas (tracción) se prioriza velocidad sobre cobertura. A medida que el producto escala, invertir en testing reduce el costo de mantenimiento exponencialmente.

---

## 1. Pruebas estáticas / Análisis estático

No ejecutan el código. Lo analizan en tiempo de escritura para detectar malas prácticas, errores de sintaxis y problemas de estilo.

### Instalación

```bash
npm init @eslint/config@latest
```

### Scripts en `package.json`

```json
"scripts": {
  "lint": "eslint src/**",
  "lint:fix": "eslint src/** --fix"
}
```

### Ejemplo de `.eslintrc.js`

```js
module.exports = {
  env: { browser: true, commonjs: true, es2021: true, node: true, jest: true },
  extends: ["airbnb-base"],
  parserOptions: { ecmaVersion: "latest" },
  rules: {
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    quotes: ["error", "double"],
  },
};
```

---

## 2. Pruebas unitarias

Verifican que **una unidad aislada** (función, clase, método) se comporte exactamente como se espera.

### Instalación

```bash
npm install --save-dev jest
```

### Script

```json
"test": "jest"
```

### Estructura básica

```js
// src/01-sum.js
function suma(a, b) { return a + b; }
module.exports = suma;

// src/01-sum.test.js
const sum = require('./01-sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

### Caja negra vs. Caja blanca

| | Caja Negra | Caja Blanca |
|---|---|---|
| **Enfoque** | ¿Qué hace? | ¿Cómo lo hace? |
| **Conocimiento del código** | No necesario | Necesario |
| **Detecta** | Resultados incorrectos | Ramas, condiciones no probadas |
| **Ejemplo** | `expect(suma(2,3)).toBe(5)` | Probar cada `if/else` en `clasificarEdad` |

### Matchers principales

```js
expect(value).toBe(3)                  // Igualdad estricta (primitivos)
expect(obj).toEqual({ name: "test" })  // Igualdad profunda (objetos)
expect(value).toBeNull()
expect(value).toBeDefined()
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(str).toMatch(/pattern/)
expect(arr).toContain("item")
expect(arr).toHaveLength(3)
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith("arg1", "arg2")
expect(fn).toHaveBeenCalledTimes(1)
```

### Setup & Teardown

Permite aislar escenarios de prueba para que no se contaminen entre sí.

```js
describe('BooksService', () => {
  let service;

  beforeAll(() => { /* Levantar DB, conexiones */ });
  afterAll(() => { /* Cerrar DB, conexiones */ });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BooksService();   // Estado limpio en cada test
  });

  afterEach(() => { /* Limpiar datos insertados */ });

  test('should do something', () => { ... });
});
```

| Hook | Cuándo se ejecuta |
|---|---|
| `beforeAll` | Una vez antes de todos los tests del bloque |
| `afterAll` | Una vez después de todos los tests del bloque |
| `beforeEach` | Antes de **cada** test |
| `afterEach` | Después de **cada** test |

---

## Mocking, Stubs y Spies

### Conceptos

| Concepto | Definición |
|---|---|
| **Dummy** | Datos ficticios para rellenar parámetros requeridos |
| **Fake** | Implementación simplificada que sustituye un sistema real (ej. DB en memoria) |
| **Stub** | Respuesta preparada para simular el comportamiento de una dependencia |
| **Spy** | Stub que además registra cómo fue llamado (veces, argumentos) |
| **Mock** | Stub + Spy, puede tener comportamiento pre-programado |

### Implementación con Jest

```js
// 1. Definir el spy
const mockGetAll = jest.fn();

// 2. Suplantar el módulo completo
jest.mock("../lib/mongo.lib", () =>
  jest.fn().mockImplementation(() => ({
    getAll: mockGetAll,
    create: jest.fn(),
  }))
);

// 3. En el test: configurar respuesta y espiar
test('should return books', async () => {
  // Arrange
  mockGetAll.mockResolvedValue(fakeBooks);

  // Act
  const books = await service.getBooks({});

  // Assert
  expect(books.length).toBe(fakeBooks.length);
  expect(mockGetAll).toHaveBeenCalledTimes(1);
  expect(mockGetAll).toHaveBeenCalledWith("books", {});
});
```

### Generación dinámica de fixtures con Faker

```bash
npm install @faker-js/faker --save-dev
```

```js
// fakes/book.fake.js
const { faker } = require("@faker-js/faker");

const generateOneBook = () => ({
  _id: faker.string.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
});

const generateManyBooks = (size = 10) => {
  return Array.from({ length: size }, generateOneBook);
};

module.exports = { generateOneBook, generateManyBooks };
```

---

## 3. Pruebas de integración

Validan que múltiples componentes trabajen correctamente en conjunto (routing → service → lib), **sin tocar la base de datos real** (usando mocks en la capa de persistencia).

### Instalación

```bash
npm install supertest --save-dev
```

### Configuración (`e2e/jest-e2e.json`)

```json
{
  "moduleFileExtensions": ["js"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e.js$",
  "transformIgnorePatterns": ["node_modules/(?!(@faker-js)/)"],
  "transform": { "^.+\\.js$": "babel-jest" }
}
```

### Script

```json
"test:e2e": "jest --config ./e2e/jest-e2e.json --forceExit"
```

### Ejemplo

```js
const request = require("supertest");
const createApp = require("../src/app");
const { generateManyBooks } = require("../src/fakes/book.fake");

const mockGetAll = jest.fn();
jest.mock("../src/lib/mongo.lib", () =>
  jest.fn().mockImplementation(() => ({ getAll: mockGetAll, create: jest.fn() }))
);

describe("GET /api/v1/books", () => {
  let app, server;

  beforeAll(() => { app = createApp(); server = app.listen(3001); });
  afterAll(async () => { await server.close(); });

  test("should return a list of books", () => {
    const fakeBooks = generateManyBooks(3);
    mockGetAll.mockResolvedValue(fakeBooks);

    return request(app)
      .get("/api/v1/books")
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toEqual(fakeBooks.length);
      });
  });
});
```

---

## 4. Pruebas End-to-End (E2E)

Recorren **todo el stack real**, incluyendo la base de datos. Se usan con un entorno de MongoDB dedicado (Docker), nunca con producción.

### Levantar entorno de pruebas

```bash
# docker-compose.yml — servicio separado para E2E
docker-compose up -d mongo-e2e
```

### Patrón: Seed → Act → Assert → Cleanup

```js
describe("GET /api/v1/books (E2E)", () => {
  let app, server, client, database;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(3001);
    client = new MongoClient(MONGO_URI);
    await client.connect();
    database = client.db(DB_NAME);
  }, 60000);

  afterEach(async () => {
    await database.collection("books").deleteMany({});  // Aislamiento entre tests
  });

  afterAll(async () => {
    await database.dropDatabase();
    await client.close();
    await new Promise(resolve => server.close(resolve));
  });

  test("should return seeded books from real DB", async () => {
    // Arrange — seed
    const seedResult = await database.collection("books").insertMany([
      { name: "Book 1", year: 1995, author: "Sofia" },
      { name: "Book 2", year: 2000, author: "Nicolas" },
    ]);

    // Act
    const { body } = await request(app).get("/api/v1/books").expect(200);

    // Assert
    expect(body).toHaveLength(seedResult.insertedCount);
  });
});
```

---

## 5. Pruebas de UI

Automatizan interacciones reales en el navegador. Ideales para validar flujos de usuario completos.

### Instalación

```bash
npm install -D @playwright/test
npx playwright install  # Descarga los navegadores
```

### Ejemplo básico

```js
const { test, expect } = require('@playwright/test');

test('homepage has correct title', async ({ page }) => {
  await page.goto('https://qa.myapp.dev/');
  const title = page.locator('.navbar__title');
  await expect(title).toHaveText('My App');
});
```

> **Buena práctica:** Las pruebas de UI nunca apuntan a producción. Se usa un subdominio de QA conectado a una API y base de datos de prueba.

---

## CI/CD con GitHub Actions

Pipeline completo que ejecuta linter, unit tests y E2E en cada push, en paralelo.

```yaml
# .github/workflows/api-ci.yml
name: API CI

on:
  push:
    paths:
      - "api/**"
      - ".github/workflows/api-ci.yml"

defaults:
  run:
    working-directory: ./api

jobs:
  linter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: 16, cache: npm, cache-dependency-path: api/package-lock.json }
      - run: npm ci
      - run: npm run lint

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: 16, cache: npm, cache-dependency-path: api/package-lock.json }
      - run: npm ci
      - run: npm run test

  e2e:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:4.4
        env:
          MONGO_INITDB_ROOT_USERNAME: test
          MONGO_INITDB_ROOT_PASSWORD: test123
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:e2e
        env:
          MONGO_DB_NAME: demo
          MONGO_URL: mongodb://test:test123@127.0.0.1:27017/demo?authSource=admin
```

---

## Coverage Report

Genera un informe visual que muestra qué porcentaje del código está cubierto por tests.

```bash
npm run test -- --coverage
```

Abre `coverage/lcov-report/index.html` con Live Server para ver línea a línea qué falta cubrir.

---

## Metodologías

| Metodología | Descripción |
|---|---|
| **TDD** (Test Driven Development) | Primero se escribe el test, luego el código que lo hace pasar. Asegura que todo el código nació con un propósito verificable. |
| **BDD** (Behavior Driven Development) | Se define el comportamiento esperado antes de implementar, usando lenguaje natural como base. |
| **AAA** (Arrange – Act – Assert) | Estructura de cada test: prepara el estado → ejecuta la acción → verifica el resultado. |

### Falsos positivos y negativos

- **Falso positivo:** el test falla pero el código está bien. El test está mal escrito.
- **Falso negativo (Happy Path):** el test pasa pero hay un bug que no fue cubierto. Solución: probar también los casos límite y de error, no solo los escenarios ideales.

---

## Glosario

| Término | Definición |
|---|---|
| `SUT` | *System Under Test* — El componente que estamos probando |
| `describe` | Agrupa tests relacionados en una *test suite* |
| `lifecycle hooks` | `beforeAll`, `afterAll`, `beforeEach`, `afterEach` |
| `setup hooks` | Preparan el entorno antes de los tests |
| `teardown hooks` | Limpian y liberan recursos después de los tests |
| `mock` | Objeto/función falsa que reemplaza una dependencia real |
| `stub` | Respuesta preparada para simular un comportamiento |
| `spy` | Stub que registra cómo fue invocado |
| `fake` | Implementación simplificada funcional (ej. DB en memoria) |
| `seed` | Datos iniciales insertados en la DB antes de un test E2E |
| `happy path` | Escenario ideal donde todo funciona correctamente |
| `coverage` | Porcentaje del código ejecutado durante los tests |
| `e2e` | *End-to-End* — Prueba que recorre todo el sistema |

---

## Comandos rápidos

```bash
# Unit tests
npm run test

# Unit tests con coverage
npm run test -- --coverage

# Ejecutar un archivo específico
npm run test -- 05-person

# Lint
npm run lint
npm run lint:fix

# Integration + E2E tests
npm run test:e2e

# Docker — levantar MongoDB para E2E
docker-compose up -d mongo-e2e
docker-compose ps
docker-compose down

# Playwright UI tests
npx playwright test
```

---

*Proyecto desarrollado como práctica de testing full-stack con JavaScript — cubriendo todas las capas de la pirámide de testing e integración continua.*
