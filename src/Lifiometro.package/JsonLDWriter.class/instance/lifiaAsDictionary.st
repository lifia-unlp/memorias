writing
lifiaAsDictionary
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Organization';
		at: 'name' put: 'Centro de Investigación LIFIA';
		at: 'url' put: 'http://www.lifia.info.unlp.edu.ar/';
		yourself