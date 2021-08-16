rendering
renderScholarshipsOn: html
	html heading level2 with: 'Becas y pasantías'.
	report scholarships
		do: [ :each | self renderScholarship: each on: html ]