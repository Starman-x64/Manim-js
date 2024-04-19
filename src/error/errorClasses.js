class ValueError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValueError";
  }
}
class NotImplementedError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotImplementedError";
  }
}
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export { ValueError, NotImplementedError, ValidationError };