const {DateTime} = require("luxon");

const summary = (sessions) => {
	(sessions || []).forEach((s) => {
		console.log(`************s.StartTime************`);
		console.log(s.StartTime);
		console.log(typeof s.StartTime);
		console.log(DateTime.fromSQL(s.StartTime));
		console.log(DateTime.fromSQL(s.StartTime).toFormat("ff"));
		console.log(`********END s.StartTime************`);
		console.log(
			`completed ${s.AppointmentType}, aptId:${s.AppointmentId} for trainer:${
				s.TrainerId
			}-${s.TrainerName} and client:${s.ClientId}-${
				s.ClientName
			} at: ${DateTime.fromSQL(s.StartTime).toFormat("ff")}`
		); 
		if (s.InArrears) {
			console.log(`Client:${0}, ID:{1} was in arrears`);
		}
	});
	console.log(
		`Number of sessions affected: ${(sessions && sessions.length) || 0}`
	);
}

module.exports = summary;