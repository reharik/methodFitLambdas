"use strict";

const sessionManagement = require("src/sessionManagement/sessionManagement");

module.exports.sessionManagement = async (event, context) => {
	const result = await sessionManagement(context);
	return {
		statusCode: 200,
		body: result, //;JSON.stringify(result, null, 2),
	};
};
