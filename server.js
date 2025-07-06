const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const figlet = require("figlet");
const colors = require("colors");
const swaggerUi = require("swagger-ui-express");
const swaggerSetup = require("./helpers/swaggerSetup");
const { SwaggerTheme, SwaggerThemeNameEnum } = require("swagger-themes");
const errorHandler = require("./middlewares/errorHandler");
const fallbackRoute = require("./middlewares/fallback");
const connectDB = require("./config/db");
const appRoutes = require("./routes/index");

const app = express();
dotenv.config();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;
const theme = new SwaggerTheme();
const themeOptions = {
  explorer: true,
  customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
};

// Configurations
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Routes
app.use("/api/v1", appRoutes);

// Initialize SwaggerJS
const swaggerSpec = swaggerSetup("v1");
app.use("/api-docs", swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec, themeOptions));

// Fallback Route
app.use(fallbackRoute);

// Error Handling Middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB(mongoURI);
    console.log(`Connected to the database`);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    figlet.text("DevTinder", (err, data) => {
      if (err) {
        console.dir(err);
        return;
      }
      console.log(data.rainbow.bold);
    });
  } catch (err) {
    console.log(`Error: ${err}`);
    process.exit(1);
  }
};

startServer();
