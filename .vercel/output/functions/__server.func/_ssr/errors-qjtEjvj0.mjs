//#region node_modules/.nitro/vite/services/ssr/assets/errors-qjtEjvj0.js
var NexaError = class extends Error {
	status;
	code;
	constructor(message, status = 400, code = "BAD_REQUEST") {
		super(message);
		this.name = "NexaError";
		this.status = status;
		this.code = code;
	}
};
function errorMessage(err) {
	if (err instanceof Error && err.message === "Unauthorized") return "Please sign in to continue.";
	if (err instanceof NexaError) return err.message;
	if (err instanceof Error && err.message) return err.message;
	return "Something went wrong. Try again.";
}
//#endregion
export { errorMessage as n, NexaError as t };
