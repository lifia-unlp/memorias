rendering
renderThesisOn: html
	html heading level2 with: 'Tesis y trabajos finales de carrera'.
	^ report thesis do: [ :each | self renderThesis: each on: html ]