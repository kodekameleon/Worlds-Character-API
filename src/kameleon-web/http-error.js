export function HttpError(httpStatusCode, message, additionalInfo) {
  return {httpStatusCode, message, ...additionalInfo};
}
