
class BadRequest extends Error {
	constructor(message="Bad Request!") {
		super(message);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BadRequest);
		}

		this.name = "BadRequest";
		this.code = 400;
	}
}

export default BadRequest;
