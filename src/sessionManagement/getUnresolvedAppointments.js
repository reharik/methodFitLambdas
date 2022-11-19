const  sqlQueries  = require('./sqlQueries');

const getUnresolvedAppointments = async (mssql) => {
	try {
		const query = sqlQueries.getUnresolvedAppointment();
		const unresolvedAppointmentsQuery = await mssql.request().query(query);
		return unresolvedAppointmentsQuery.recordset;
	}catch(err) {
		console.log(`************err.message************`);
		console.log(err);
		console.log(`********END err.message************`);
		throw err;
	}
}

module.exports = getUnresolvedAppointments;