accept/cancel
accept
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	(newValues at: 'title')
		ifEmpty: [ errors add: 'Debe espedíficar un título' ].
	(newValues at: 'student')
		ifEmpty: [ errors add: 'Debe especifica rel nombre del alumno' ].
	(newValues at: 'director')
		ifEmpty: [ errors add: 'Debe especificar el nombre del director' ].
	(newValues at: 'career')
		ifEmpty: [ errors add: 'Debe especificar la carrera' ].
	(newValues at: 'level')
		ifEmpty: [ errors add: 'Debe especificar el nivel' ].
	errors ifNotEmpty: [ ^ self ].
	super accept