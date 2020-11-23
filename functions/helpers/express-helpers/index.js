exports.sendErrorMessage = (response, message) => {
  return response.status(200).send({ error: message });
};

exports.sendErrorObject = (response, error) => {
  return response.status(200).send({ error });
};

exports.sendSuccessMessage = (response, message) => {
  return response.status(200).send({ success: message });
};

exports.sendSuccessObject = (response, success) => {
  return response.status(200).send({ success });
};
