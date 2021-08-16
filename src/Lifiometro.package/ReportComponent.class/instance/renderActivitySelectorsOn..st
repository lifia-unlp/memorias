rendering-form
renderActivitySelectorsOn: html
	html
		tbsFormGroup: [ html
				label: 'Actividades a incluir';
				break.
			html checkbox
				value: pdh;
				callback: [ :value | pdh := value ].
			html space.
			html
				text: 'Alumnos doctorales';
				break.
			html checkbox
				value: masters;
				callback: [ :value | masters := value ].
			html space.
			html
				text: 'Alumnos de maestría (tesis)';
				break.
			html checkbox
				value: undergraduate;
				callback: [ :value | undergraduate := value ].
			html space.
			html
				text: 'Alumnos de especialización (trabajo final)';
				break.
			html checkbox
				value: undergraduate;
				callback: [ :value | specialization := value ].
			html space.
			html
				text: 'Alumnos de grado (tesina)';
				break.
			html checkbox
				value: scholarships;
				callback: [ :value | scholarships := value ].
			html space.
			html
				text: 'Becas';
				break.
			html checkbox
				value: projects;
				callback: [ :value | projects := value ].
			html space.
			html
				text: 'Proyectos';
				break.]