const validateRequest = (req, res, next, schema, requestParamterType) => {
  const options = {
    abortEarly: true, // include all errors
    allowUnknown: false, // ignore unknown props
    stripUnknown: true // remove unknown props
  };
  let requestData = {};
  if (requestParamterType === 'body') {
    requestData = req.body;
  } else if (requestParamterType === 'query') {
    requestData = req.query;
  } else {
    requestData = req.params;
  }
  const { error, value } = schema.validate(requestData, options);
  if (!error) {
    if (requestParamterType === 'body') {
      req.body = value;
    } else if (requestParamterType === 'query') {
      req.query = value;
    } else {
      req.params = value;
    }
    return next();
  }
  const { details } = error;
  const message = details.map(i => i.message).join(',');
  return commonErrorHandler(req, res, message, 422);
};

const commonErrorHandler = async (req, res, message, statusCode = 500, error = null) => {
  if (req.files) {
    Object.keys(req.files).forEach(function (file) {
      if (req.files[file].path) {
        fs.unlink(req.files[file].path, function (err) {
          console.log(err);
        });
      }
    });
  }
  let errorMessage = 'Something went wrong. Please try again';
  if (message) {
    errorMessage = message;
  }
  if (error && error.message) {
    errorMessage = error.message;
  }
  req.error = error;
  const response = {
    statusCode,
    data: {},
    message: errorMessage
  };
  res.status(statusCode).json(response);
};

module.exports = {
  validateRequest
};
