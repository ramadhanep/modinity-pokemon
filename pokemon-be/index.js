const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

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
  console.warn("openapi.json not found or invalid JSON. /docs will show empty.");
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
    docs: "/docs"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
