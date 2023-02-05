const processInArrears = require('./processInArrears');
const  sqlQueries  = require('./sqlQueries');

const processSessions = async (unresolvedAppointments, sql, mssql) => {
console.log(`************unresolvedAppointments************`);
console.log(JSON.stringify(unresolvedAppointments, null, 4));
console.log(`********END unresolvedAppointments************`);
	const inArrears = [];
	try {
		let sqlString = '';
		let i = 0;
		let summaryAppointmentIds = [];
		while(i<unresolvedAppointments.length) {
			const unresolved = unresolvedAppointments[i];

			const sessionIdQuery = await mssql.request().query(sqlQueries.getSession(unresolved));
			const sessionId = sessionIdQuery.recordset[0]?.EntityId;
			if(!sessionId) {
				inArrears.push(unresolved);
				i++;
				continue;
			}
			summaryAppointmentIds.push(unresolved.AppointmentId);
			sqlString += sqlQueries.updateSession(unresolved, sessionId);
			sqlString += sqlQueries.updateAppointment(unresolved.AppointmentId);
			let transaction = new sql.Transaction(/* [pool] */)
			try {
				transaction = await transaction.begin();
				const request = new sql.Request(transaction)
				await request.query(sqlString);
				await	transaction.commit();
			}catch(err) {
				console.log(`************err************`);
				console.log("[processSession] Error in transaction")
				console.log(err);
				console.log(`********END err************`);
				await transaction.rollback();
				throw(err);
			}
			sqlString = ''
			i++;
		}		

		if(inArrears.length>0) {
			const inArrearsIds = await processInArrears(inArrears,sql);
			summaryAppointmentIds = [...summaryAppointmentIds, ...inArrearsIds];
		}

		const request = mssql.request();
		const sessionsQuery = await request.query(sqlQueries.completedSessions(summaryAppointmentIds));
		return sessionsQuery.recordset;
	} catch (err) { 
		console.log(`************err.messagage************`);
		console.log("[processSessions] Error in iteration")
		console.log(err);
		console.log(`********END err.messagage************`);
		throw err;
	}
}

module.exports = processSessions;
