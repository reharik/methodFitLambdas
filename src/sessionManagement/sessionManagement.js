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
const validateUnresolvedAppointments = require('./validateUnresolvedAppointments');

const sessionManagement = async (context) => {
	try {
		console.log(`Session Management: ${DateTime.now().toFormat("MMM Do YYYY h:mm A")}`);

		const mssql = await sql.connect(process.env.DB_CONNECTION);

		let unresolvedAppointments= await getUnresolvedAppointments(mssql);
		console.log(`************unresolvedAppointments************`);
		console.log(unresolvedAppointments);
		console.log(`********END unresolvedAppointments************`);
		const invalidUnresolvedAppointments = await validateUnresolvedAppointments(mssql,unresolvedAppointments);
		if(invalidUnresolvedAppointments) {
			console.log(`************ERROR************`);
			console.log(invalidUnresolvedAppointments);
			console.log(`********END ERROR************`);
			unresolvedAppointments = unresolvedAppointments.filter(x=> invalidUnresolvedAppointments.ids.include(x.AppointmentId))
		}
		const completedSessions = unresolvedAppointments.length >0
		? await processSessions(unresolvedAppointments, sql, mssql)
		: [];
		const code = JSON.stringify(completedSessions, null, 4);
		// summary(completedSessions);

		const completedSessionsSproc = await mssql.request().execute("SessionReconciliation");
		const sproc = JSON.stringify(completedSessionsSproc.recordset, null, 4);

		if(!code === sproc) {
			console.log(`************diff************`);
			console.log(code +"\n\n/n/n" +sproc);
			console.log(`********END diff************`);
		} else {
			console.log(`************"SUCCESS!!!"************`);
			console.log("SUCCESS!!!");
			console.log(`********END "SUCCESS!!!"************`);
		}

		summary(completedSessionsSproc);
		context.done(null, "Success");
	} catch (err) {
		console.error(err);
		context.done(null, "Failed");
	}
};

module.exports = sessionManagement;


