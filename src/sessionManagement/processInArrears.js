const  sqlQueries  = require('./sqlQueries');

const processInArrears = async (inArrears, sql) => {
	try {
		let sqlString = '';
		let i = 0;
		let appointmentIds = []
		console.log(`************inArrears************`);
		console.log(JSON.stringify(inArrears, null, 4));
		console.log(`********END inArrears************`);
		while(i<inArrears.length) {
			const unresolved = inArrears[i];
			sqlString += sqlQueries.inArrears(unresolved);
			sqlString += sqlQueries.updateAppointment(unresolved.AppointmentId);
			appointmentIds.push(unresolved.AppointmentId);
			let transaction = new sql.Transaction(/* [pool] */)
			try {
				transaction = await transaction.begin();
				const request = new sql.Request(transaction)
				await request.query(sqlString);
				await	transaction.commit();
			}catch(err) {
				console.log(`************err************`);
				console.log("[processInArrears] Error in transaction")
				console.log(err);
				console.log(`********END err************`);
				await transaction.rollback();
				throw(err);
			}
			sqlString = ''
			i++;
		}
		return appointmentIds;
	} catch (err) { 
		console.log(`************err.messagage************`);
		console.log("[processInArrears] Error in iteration")
		console.log(err);
		console.log(`********END err.messagage************`);
		throw err;
	}
}
module.exports = processInArrears;

