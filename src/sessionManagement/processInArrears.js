const  sqlQueries  = require('./sqlQueries');

const processInArrears = async (inArrears, sql) => {
	try {
		let sqlString = '';
		let i = 0;
		let appointmentIds = []

		while(i<inArrears.length) {
			const unresolved = inArrears[i];
			sqlString += sqlQueries.inArrears(unresolved);
			appointmentIds.push(unresolved.AppointmentId);

			if(sqlString.length>3300 || i === inArrears.length -1){
				sqlString += sqlQueries.updateAppointment(appointmentIds);
				let transaction = new sql.Transaction(/* [pool] */)
				try {
					transaction = await transaction.begin();
					const request = new sql.Request(transaction)
					await request.query(sqlString);
					await	transaction.commit();
				}catch(err) {
					console.log(`************err************`);
					console.log(err);
					console.log(`********END err************`);
					await transaction.rollback();
					throw(err);
				}
				span = i;
				sqlString = ''
				appointmentIds=[];
			}
			i++;
		}		
		return appointmentIds;
	} catch (err) { 
		console.log(`************err.messagage************`);
		console.log(err);
		console.log(`********END err.messagage************`);
		throw err;
	}
}
module.exports = processInArrears;

