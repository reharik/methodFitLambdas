const validateUnresolvedAppointments = async (mssql, unresolvedAppointments) => {
	const sqlQueries  = require('./sqlQueries');
	const ids = unresolvedAppointments.map(x=>x.AppointmentId)
	try {
		const query = sqlQueries.validateUnresolvedAppointments(ids);
		console.log(`************query************`);
		console.log(query);
		console.log(`********END query************`);
		const validationErrors = await mssql.request().query(query);
		const errors = validationErrors.recordset;
		if(errors.length>0){
		let message = "THE FOLLOWING APPOINTMENTS WERE RETURNED BY FOR PAYMENT BUT HAVE ALREADY BEEN PAID!";
		errors.map(x=> {
			message += `
trainerName = ${x.TrainerFirstName} ${x.TrainerLastName},
ClientName  = ${x.FirstName} ${x.LastName},
AppointmentDate = ${x.AppointmentDate},
AppointmentType = ${x.Type}
--------------------------------------------------------
`});
			return {message, ids: errors.map(x=> x.AppointmentId)};
		};
	}catch(err) {
		console.log(`************err.message************`);
		console.log(err);
		console.log(`********END err.message************`);
		throw err;
	}
}

module.exports = validateUnresolvedAppointments;