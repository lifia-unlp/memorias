rendering-thesis
renderThesisReportOn: html
	undergraduate | masters | pdh
		ifTrue: [ html heading
				level1;
				id: 'thesis';
				with: 'Dirección de tesis y trabajos finales' ].
	pdh
		ifTrue: [ html heading
				level2;
				id: 'phd';
				with: 'Doctorado'.
			report phdThesis do: [ :each | self renderThesis: each on: html ] ].
	masters
		ifTrue: [ html heading
				level2;
				id: 'masters';
				with: 'Maestría (tesis)'.
			report mastersThesis
				do: [ :each | self renderThesis: each on: html ] ].
	masters
		ifTrue: [ html heading
				level2;
				id: 'specialization';
				with: 'Especialización (trabajo final)'.
			report specializationThesis
				do: [ :each | self renderThesis: each on: html ] ].
	undergraduate
		ifTrue: [ html heading
				level2;
				id: 'undergraduate';
				with: 'Grado (tesina)'.
			report undergraduateThesis
				do: [ :each | self renderThesis: each on: html ] ]