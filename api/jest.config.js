module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!(@faker-js)/)"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
