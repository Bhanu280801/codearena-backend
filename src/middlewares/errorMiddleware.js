const notFoundMiddleware = (req, res) => {
  return res.status(404).json({
    message: "Route not found"
  });
};

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  console.error("Unhandled error:", {
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });

  return res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : error.message
  });
};

module.exports = {
  notFoundMiddleware,
  errorMiddleware
};
