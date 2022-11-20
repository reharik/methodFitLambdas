const {DateTime} = require('luxon');

 const sqlQueries = {
	getUnresolvedAppointment: () => `select distinct 
	a.entityId as AppointmentId,
	ac.ClientId,
	a.TrainerId,
	s.InArrears,
	s.SessionUsed,
	a.AppointmentType
from Appointment a
		inner join appointment_Client ac on a.EntityId = ac.AppointmentID
			and a.Completed = 0	
			and a.EndTime< CONVERT(datetime2, '${new Date().toISOString()}', 126)
		left outer join Session s on ac.ClientID=s.ClientID
			and a.AppointmentType=s.AppointmentType and s.SessionUsed = 0
`,
	inArrears:(unresolved) => `insert into Session (
IsDeleted,
CompanyId,
cost,
AppointmentType,
SessionUsed,
TrainerPaid,
TrainerCheckNumber,
InArrears,
ClientID,
appointmentId,
trainerId,
TrainerVerified,
createdDate,
createdById,
changedDate,
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
'${new Date().toISOString()}',
17,
'${new Date().toISOString()}',
17);
;`,
	getSession: (unresolved) => `select top 1 entityid from session
where ClientID=${unresolved.ClientId}
and AppointmentType='${unresolved.AppointmentType}'
and SessionUsed=0
order by createddate
;`,
	updateSession: (unresolved, sessionId)=>`update Session set
SessionUsed=1,
appointmentId = ${unresolved.AppointmentId},
trainerId = ${unresolved.TrainerId},
changedDate = '${new Date().toISOString()}',
changedById = 17
WHERE entityId = ${sessionId};
;`,
	updateAppointment: (appointmentIds) => `update Appointment set 
Completed=1,
ChangedById=17,
ChangedDate='${new Date().toISOString()}'
where entityId in (${appointmentIds.join(",")})
;`,
	completedSessions: (unresolvedAppointmentIds) =>`SELECT
a.AppointmentType,
a.entityId,
u.entityId, 
u.firstname + ' ' +u.lastname as trainerName, 
c.entityId,				
c.firstName +' '+ c.lastname as clientName ,
a.startTime,
s.inarrears
FROM appointment a 
inner join session s on a.entityId = s.appointmentId
inner join [user] u on a.trainerId = u.entityId
inner join appointment_client ac on a.entityId = ac.AppointmentId
inner join client c on ac.clientId= c.entityId
WHERE a.entityId in (${unresolvedAppointmentIds})
;`,
	validateUnresolvedAppointments: (appoi*ntmentIds) => 
`select u.FirstName as TrainerFirstName,
u.LastName as TrainerLastName,
ts.* from TrainerSessions ts
inner join [user] u on u.EntityId = ts.TrainerId
where ts.appId in (${appointmentIds})
and ts.appointmentDate > CONVERT(datetime2, '${DateTime.now().minus({"month":1}).toISO()}', 126)
and ts.
`
} 

module.exports =sqlQueries