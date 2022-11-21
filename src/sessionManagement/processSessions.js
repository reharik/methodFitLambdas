const  sqlQueries  = require('./sqlQueries');

const processSessions = async (unresolvedAppointments, sql, mssql) => {
	try {
		let sqlString = '';
		let i = 0;
		let appointmentIds = []
		let squery=[];
		let span=0;
		while(i<unresolvedAppointments.length) {
			const unresolved = unresolvedAppointments[i];
// this doesn't fukcing work cuz it's immeadiate and the query is building upa string.
			const sessionIdQuery = await mssql.request().query(sqlQueries.getSession(unresolved));
			const sessionId = sessionIdQuery.recordset[0]?.entityid;
			
			if(sessionId == null) {
				sqlString += sqlQueries.inArrears(unresolved);
			} else {
				sqlString += sqlQueries.updateSession(unresolved, sessionId);
			}

			appointmentIds.push(unresolved.AppointmentId);

			if(sqlString.length>3300 || i === unresolvedAppointments.length -1){
				sqlString += sqlQueries.updateAppointment(appointmentIds);
				// console.log(`************sqlString************`);
				// console.log(sqlString);
				// console.log(`********END sqlString************`);
				let transaction = new sql.Transaction(/* [pool] */)
				try {
					transaction = await transaction.begin();
					const request = new sql.Request(transaction)
					await request.query(sqlString);
					
					// const ids = unresolvedAppointments.slice(span, i+1).map(x => x.AppointmentId).join(',');			
					// // for debugging and comparison to sproc purposes
					// const sessionsQuery = await request.query(sqlQueries.completedSessions(ids));
					// squery = [...squery, ...sessionsQuery.recordset];

					await	transaction.commit();
					// console.log(`************"commit in success"************`);
					console.log("commit in success");
					// console.log(`********END "commit in success"************`);
				}catch(err) {
					console.log(`************err************`);
					console.log(err);
					console.log(`********END err************`);
					await transaction.rollback();
				}
				span = i;
				sqlString = ''
				appointmentIds=[];
			}
			i++;
		}
		// return squery;
	} catch (err) { 
		console.log(`************err.messagage************`);
		console.log(err);
		console.log(`********END err.messagage************`);
		throw err;
	}
	
	// not necessary since I'm rolling back so the query will be empty
	const request = mssql.request();
	const ids = unresolvedAppointments.map(x => x.AppointmentId).join(',');			
	const sessionsQuery = await request.query(sqlQueries.completedSessions(ids));
	return sessionsQuery.recordset;


}

module.exports = processSessions;