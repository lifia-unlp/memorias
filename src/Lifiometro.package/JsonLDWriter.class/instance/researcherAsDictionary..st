writing
researcherAsDictionary: aResearcher
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Person';
		at: 'url'
			put:
			'http://memorias.lifia.info.unlp.edu.ar/researcher/'
				, aResearcher institutionalEmail;
		at: 'email' put: aResearcher institutionalEmail;
		at: 'givenName' put: aResearcher firstName;
		at: 'familyName' put: aResearcher lastName;
		yourself