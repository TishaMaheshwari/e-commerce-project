var tokenEngine = require('jsonwebtoken');

module.exports = function validateStaffPrivileges(request, response, nextStep) {
  var authorizationHeader = request.headers['authorization'] || '';
  var extractionArray = authorizationHeader.split(' ');
  var explicitToken = extractionArray[1];

  if (!explicitToken) {
    return response.status(401).json({ error_message: 'Access unauthorized. Token missing.' });
  }

  try {
    var authenticationPayload = tokenEngine.verify(explicitToken, process.env.TOKEN_SECRET || 'fashion_apparel_hub_secret_key_university_of_sindh_2026');
    if (authenticationPayload.role !== 'admin') {
      return response.status(403).json({ error_message: 'Access denied. Admin role required.' });
    }
    request.authorizedUser = authenticationPayload;
    nextStep();
  } catch (exceptionEvent) {
    return response.status(401).json({ error_message: 'Access token validation has expired.' });
  }
};