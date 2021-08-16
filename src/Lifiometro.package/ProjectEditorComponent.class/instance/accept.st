callbacks
accept
	[ (newValues at: 'startDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de inicio deben válida en formato dd/mm/aa' ].
	[ (newValues at: 'endDate') asDate ]
		on: Error
		do: [ errors add: 'La fecha de fin deben válida en formato dd/mm/aa' ].
	(newValues at: 'title')
		ifEmpty: [ errors add: 'El título es obligatorio' ].
	errors ifNotEmpty: [ ^ self ].
	super accept