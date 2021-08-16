utility
allowedTypes
	^ Dictionary new
		at: 'inproceedings' put: 'Conference article';
		at: 'article' put: 'Journal article';
		at: 'book' put: 'Book';
		at: 'inbook' put: 'Book part';
		at: 'misc' put: 'Other';
		yourself