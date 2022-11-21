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
		console.log(`************unresolvedAppointments************`);
		console.log(unresolvedAppointments.length);
		console.log(unresolvedAppointments);
		console.log(`********END unresolvedAppointments************`);

		const completedSessions = unresolvedAppointments.length >0
		? await processSessions(unresolvedAppointments, sql, mssql)
		: [];
		console.log(`************completedSessions************`);
		console.log(completedSessions);
		console.log(`********END completedSessions************`);

		const codeSorted =completedSessions.sort((a,b) =>{
			if (a.EntityId[0] < b.EntityId[0]) {
				return -1;
			}
			if (a.EntityId[0] > b.EntityId[0]) {
				return 1;
			}
			return 0;
		})
		console.log(`************codeSorted************`);
		console.log(codeSorted);
		console.log(`********END codeSorted************`);
		const code = JSON.stringify(codeSorted, null, 4);
		// summary(completedSessions);


const fu = `	BEGIN TRANSACTION

if OBJECT_ID('#temp') is not null 

drop table #temp

select distinct 
				a.entityId as appointmentId,
											s.EntityId as sessionId
	into #temp
			from 	Appointment a
					inner join  appointment_Client ac  on a.EntityId = ac.AppointmentID
					left outer join Session s on ac.ClientID=s.ClientID and a.entityId=s.AppointmentId	and s.SessionUsed = 1 
			where a.EndTime>'2022-11-15 18:38:06.673' 
				and a.Completed = 1

update appointment set Completed = 0 where entityId in (select appointmentid from #temp)
update [Session] set SessionUsed = 0, AppointmentId = null where entityId in (select sessionId from #temp )

COMMIT TRANSACTION
` 

await mssql.request().query(fu);






		const completedSessionsSproc = await mssql.request().execute("SessionReconciliation");
		const sprocSorted =completedSessionsSproc.recordset.sort((a,b) =>{
			if (a.EntityId[0] < b.EntityId[0]) {
				return -1;
			}
			if (a.EntityId[0] > b.EntityId[0]) {
				return 1;
			}
			return 0;
		})
		const sproc = JSON.stringify(sprocSorted, null, 4);

		if(code !== sproc) {
			console.log(`************diff************`);
			console.log(completedSessions.length );
			console.log(code );
			console.log(completedSessionsSproc.recordset.length);
			console.log(sproc);
			console.log(`********END diff************`);
		} else {
			console.log(`************"SUCCESS!!!"************`);
			console.log("SUCCESS!!!");
			console.log(`********END "SUCCESS!!!"************`);
		}

		// summary(completedSessionsSproc);
		context.done(null, "Success");
	} catch (err) {
		console.error(err);
		context.done(null, "Failed");
	}
};

module.exports = sessionManagement;


