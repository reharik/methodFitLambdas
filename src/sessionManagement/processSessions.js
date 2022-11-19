const  sqlQueries  = require('./sqlQueries');

const processSessions = async (unresolvedAppointments, sql, mssql) => {
	console.log(`************unresolvedAppointments************`);
	console.log(unresolvedAppointments);
	console.log(`********END unresolvedAppointments************`);
	try {
		let sqlString = '';
		let i = 0;
		let appointmentIds = []
		while(i<unresolvedAppointments.length) {
			const unresolved = unresolvedAppointments[i];

			if(unresolved.SessionUsed == null) {
				sqlString += sqlQueries.inArrears(unresolved);
			} else {
				const sessionIdQuery = await mssql.request().query(sqlQueries.getSession(unresolved));
				const sessionId = sessionIdQuery.recordset[0]?.entityid;
				if(!sessionId) {
					throw new Error("can't find sessionId for appointment where there should be one");
				}
				sqlString += sqlQueries.updateSession(unresolved, sessionId);
			}

			appointmentIds.push(unresolved.AppointmentId);

			if(sqlString.length>3300 || i === unresolvedAppointments.length -1){
				sqlString += sqlQueries.updateAppointment(appointmentIds);
				console.log(`************sqlString************`);
				console.log(sqlString);
				console.log(`********END sqlString************`);
				let transaction = new sql.Transaction(/* [pool] */)
				try {
					transaction = await transaction.begin();
					const request = new sql.Request(transaction)
					await request.query(sqlString);
					await	transaction.commit();
					console.log(`************"commit in success"************`);
					console.log("commit in success");
					console.log(`********END "commit in success"************`);
				}catch(err) {
					console.log(`************err************`);
					console.log(err);
					console.log(`********END err************`);
					await transaction.rollback();
				}
				sqlString = ''
				appointmentIds=[];
			}
			i++;
		}

	} catch (err) { 
		console.log(`************err.messagage************`);
		console.log(err);
		console.log(`********END err.messagage************`);
		throw err;
	}

	const request = mssql.request();
	const ids = unresolvedAppointments.map(x => x.AppointmentId).join(',');			
	const sessionsQuery = await request.query(sqlQueries.completedSessions(ids));
	return sessionsQuery.recordset;
}

module.exports = processSessions;