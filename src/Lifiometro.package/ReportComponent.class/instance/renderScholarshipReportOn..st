rendering-scholarhips
renderScholarshipReportOn: html
	scholarships
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becarios'.
	report scholarships
		do: [ :each | self renderScholarship: each on: html ]