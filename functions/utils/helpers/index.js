exports.sendErrorMessage = (response, message) => {
  return response.status(400).send({error: message});
};

exports.sendErrorObject = (response, error) => {
  return response.status(400).send({error});
};

exports.sendSuccessMessage = (response, message) => {
  return response.status(200).send({success: message});
};
