require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./docs/swagger");
const authRoutes = require("./backend/routes/auth.routes");
const departmentsRoutes = require("./backend/routes/departments.routes");
const doctorsRoutes = require("./backend/routes/doctors.routes");
const patientsRoutes = require("./backend/routes/patients.routes");
const diseasesRoutes = require("./backend/routes/diseases.routes");
const dashboardRoutes = require("./backend/routes/dashboard.routes");
const errorMiddleware = require("./backend/middleware/error.middleware");

const app = express();

app.use(express.json());
// Allow requests from local dev servers (e.g. Live Server on port 5500)
const corsOptions = {
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MRMS backend is running.",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/diseases", diseasesRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorMiddleware);

module.exports = app;
