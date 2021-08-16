rendering
accept
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	(newValues at: 'firstName')
		ifEmpty: [ errors add: 'El nombre es obligatorio' ].
	(newValues at: 'lastName')
		ifEmpty: [ errors add: 'El apellido es obligatorio' ].
	errors ifNotEmpty: [ ^ self ].
	super accept