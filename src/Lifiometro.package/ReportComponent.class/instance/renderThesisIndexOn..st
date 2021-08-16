rendering
renderThesisIndexOn: html
	html
		listItem: [ html anchor
				url: '#phd';
				with: 'Doctorado' ].
	html
		listItem: [ html anchor
				url: '#masters';
				with: 'Maestría (tesis)' ].
	html
		listItem: [ html anchor
				url: '#specialization';
				with: 'Especialización (trabajo final)' ].
	html
		listItem: [ html anchor
				url: '#undergraduate';
				with: 'Grado (tesina)' ]