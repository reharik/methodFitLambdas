const {DateTime} = require('luxon');
const nowISO =  DateTime.now().minus({"hours":5}).toISO()
const now = nowISO.substring(0,nowISO.indexOf("+"));

 const sqlQueries = {
	getUnresolvedAppointment: () => `select distinct 
	a.entityId as AppointmentId,
	ac.ClientId,
	a.TrainerId,
	a.AppointmentType
from Appointment a
		inner join appointment_Client ac on a.EntityId = ac.AppointmentID
			and a.Completed = 0	
			and a.EndTime< CONVERT(datetime2, '${now}', 126)
`,
	inArrears:(unresolved) => `insert into Session (
IsDeleted,
CompanyId,
Cost,
AppointmentType,
SessionUsed,
TrainerPaid,
TrainerCheckNumber,
InArrears,
ClientID,
AppointmentId,
TrainerId,
TrainerVerified,
CreatedDate,
CreatedById,
ChangedDate,
ChangedById
)
values (
0,
1,
0,
'${unresolved.AppointmentType}',
1,
0,
0,
1,
${unresolved.ClientId},
${unresolved.AppointmentId},
${unresolved.TrainerId},
0,
'${now}',
17,
'${now}',
17);
;`,
	getSession: (unresolved) => `select top 1 EntityId from session
where ClientID=${unresolved.ClientId}
and AppointmentType='${unresolved.AppointmentType}'
and SessionUsed=0
order by createddate
;`,
	updateSession: (unresolved, sessionId)=>`update Session set
SessionUsed=1,
appointmentId = ${unresolved.AppointmentId},
trainerId = ${unresolved.TrainerId},
changedDate = '${now}',
changedById = 17
WHERE entityId = ${sessionId};
;`,
	updateAppointment: (appointmentId) => `update Appointment set 
Completed=1,
ChangedById=17,
ChangedDate='${now}'
where entityId = ${appointmentId}
;`,
	completedSessions: (unresolvedAppointmentIds) =>`SELECT
a.AppointmentType,
a.EntityId as AppointmentId,
u.EntityId as TrainerId, 
u.firstname + ' ' +u.lastname as TrainerName, 
c.EntityId as ClientId,				
c.firstName +' '+ c.lastname as ClientName ,
a.StartTime,
s.InArrears
FROM appointment a 
inner join session s on a.entityId = s.appointmentId
inner join [user] u on a.trainerId = u.entityId
inner join appointment_client ac on a.entityId = ac.AppointmentId
inner join client c on ac.clientId= c.entityId and c.EntityId = s.ClientId
WHERE a.entityId in (${unresolvedAppointmentIds})
;`,
} 

module.exports =sqlQueries