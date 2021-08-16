accept/cancel
allowedTypes
	^ Dictionary new
		at: 'scholarship' put: 'Becas';
		at: 'project' put: 'Financiación de proyectos';
		at: 'carrer' put: 'Carrera de investigador';
		at: 'travel' put: 'Viajes';
		at: 'events' put: 'Organización de eventos';
		at: 'other' put: 'Otros';
		yourself