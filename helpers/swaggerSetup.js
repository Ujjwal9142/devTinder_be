const swaggerJSDoc = require("swagger-jsdoc");

module.exports = (apiVersion) => {
  // Swagger Setup
  let swaggerDefinition = {
    info: {
      title: "REST API for DevTinder",
      version: `${apiVersion}.0.0`,
      description: "These are the REST APIs for DevTinder",
    },
    host: "localhost:5000",
    basePath: `/api/${apiVersion}`,
    schemes: ["http"],
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    consumes: ["application/json", "multipart/form-data"],
    produces: ["application/json"],
  };

  // options for the swagger docs
  let options = {
    swaggerDefinition, // import swaggerDefinitions
    apis: [`./docs/${apiVersion}/**/*.yaml`], // path to the API docs
  };

  // initialize swagger-jsdoc
  return (swaggerSpec = swaggerJSDoc(options));
};