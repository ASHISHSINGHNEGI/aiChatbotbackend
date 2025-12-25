import swaggerJsdoc from "swagger-jsdoc";

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Support Agent API",
      version: "1.0.0",
      description:
        "API documentation for the E-commerce AI Support Chat Widget",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Local server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export { swaggerDocs };
