const {DateTime} = require("luxon");

const summary = (sessions) => {
	console.log(`************session************`);
	console.log(sessions);
	console.log(`********END session************`);
	(sessions || []).forEach((s) => {
		console.log(
			`completed ${s.AppointmentType}, aptId:${s.AppointmentId} for trainer:${
				s.TrainerId
			}-${s.TrainerName} and client:${s.ClientId}-${
				s.ClientName
			} on date: ${DateTime.fromISO(s.StartTime).toFormat("ff")}`
		); 
		if (s.Inarrears) {
			console.log(`Client:${0}, ID:{1} was in arrears`);
		}
	});
	console.log(
		`Number of sessions affected: ${(sessions && sessions.length) || 0}`
	);
}

module.exports = summary;