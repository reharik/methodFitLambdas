/*
 * File: /MethodFitLambdas/src/sessionManagement/sessionManagement.js
 * Project: methodfitlambdas
 * Created Date: 2020-08-30
 * Author: Raif
 *
 * Copyright (c) 2020 TaskRabbit, Inc
 */

const sql = require("mssql");
const moment = require("moment");

const sessionManagement = async (context) => {
	try {
		const mssql = await sql.connect(process.env.DB_CONNECTION);
		console.log(`Session Management: ${moment().format("MMM Do YYYY h:mm A")}`);
		const sessions = await mssql.request().execute("SessionReconciliation2");
		(sessions.recordset || []).forEach((s) => {
			console.log(
				`completed ${s.appointmentType}, aptId:${s.appointmentId} for trainer:${
					s.trainerId
				}-${s.trainerName} and client:${s.clientId}-${
					s.clientName
				} on date: ${moment(s.startTime).format("MMM Do YYYY h:mm A")}`
			);
			if (s.inarrears) {
				console.log(`Client:${0}, ID:{1} was in arrears`);
				_logger.LogInfo(
					`Client:${s.clientName}, ID:${s.clientId} was in arrears`
				);
			}
		});
		console.log(`Number of sessions affected: ${sessions.length || 0}`);
		context.done(null, "Success");
	} catch (err) {
		console.error(err);
		context.done(null, "Failed");
	}
};

module.exports = sessionManagement;
