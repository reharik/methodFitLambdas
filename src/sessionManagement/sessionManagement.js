/*
 * File: /MethodFitLambdas/src/sessionManagement/sessionManagement.js
 * Project: methodfitlambdas
 * Created Date: 2020-08-30
 * Author: Raif
 *
 * Copyright (c) 2020 TaskRabbit, Inc
 */

const sql = require("mssql");
const {DateTime} = require("luxon");
const summary = require('./summary');
const processSessions = require('./processSessions');
const getUnresolvedAppointments = require('./getUnresolvedAppointments');

const sessionManagement = async (context) => {
	try {
		console.log(`Session Management: ${DateTime.now().toFormat("MMM Do YYYY h:mm A")}`);

		const mssql = await sql.connect(process.env.DB_CONNECTION);
		let unresolvedAppointments= await getUnresolvedAppointments(mssql);

		const completedSessions = unresolvedAppointments.length > 0
		? await processSessions(unresolvedAppointments, sql, mssql)
		: [];
		summary(completedSessions);
		context.done(null, "Success");

	} catch (err) {
		console.error(err);
		context.done(null, "Failed");
	}
};

module.exports = sessionManagement;


