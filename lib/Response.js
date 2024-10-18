class Response {
  static successResponse(data, code = 200) {
    return { data, code };
  }
  static errorResponse(error) {
    return {
      code:code,
      error: {
        message: error.message,
        description: error.description,
      },
    };
  }
}

module.exports = Response