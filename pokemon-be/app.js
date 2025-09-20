const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

// Ensure DB is initialized (tables created on require)
require("./db");

const favoritesRouter = require("./routes/favorites");
const teamRouter = require("./routes/team");

const app = express();
app.use(cors());
app.use(express.json());

const openapiPath = path.join(__dirname, "openapi.json");
let openapiDoc = {};
try {
  openapiDoc = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
} catch (e) {
  // no-op in tests or if file missing
}

// Swagger UI (interactive docs)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc, { explorer: true }));

app.use("/api/favorites", favoritesRouter);
app.use("/api/team", teamRouter);

app.get("/", (_req, res) => {
  res.send({
    ok: true,
    msg: "Pokemon BE running",
    endpoints: ["/api/favorites", "/api/team"],
    docs: "/docs",
  });
});

module.exports = app;

