
const summary = (sessions) => {
	console.log(`************session************`);
	console.log(sessions);
	console.log(`********END session************`);
	((sessions && sessions.recordset) || []).forEach((s) => {
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
	console.log(
		`Number of sessions affected: ${(sessions && sessions.length) || 0}`
	);
}

module.exports = summary;