export const globalError = (err, req, res, next) => {
  // If the response headers were already sent, delegate to the default Express handler.
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: err.status,
    message,
  });
};

