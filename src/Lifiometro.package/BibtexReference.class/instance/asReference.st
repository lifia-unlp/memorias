accessing
asReference
	bibtexEntry type = 'article'
		ifTrue: [ ^ self authors , ', "' , self title , '," ' , self journal
				, ', vol. ' , self volume , ', pp. ' , self pages , ', '
				, self month , '. ' , self year , '.' ].
	bibtexEntry type = 'inproceedings'
		ifTrue: [ ^ self authors , ', "' , self title , '", in ' , self booktitle
				, ', ' , self month , ', ' , self year , ', ' , self editors
				, ', Eds., ' , self publisher , '. pp. ' , self pages ].
	bibtexEntry type = 'inbook'
		ifTrue: [ ^ self authors , ': ' , self title , '. In: ' , self booktitle
				, '. (' , self year , '), ' , self pages ].
	bibtexEntry type = 'book'
		ifTrue: [ ^ (self authors ifEmpty: [ self editors , ' (eds) ' ]) , ', '
				, self title , ', ' , self publisher , ', ' , self year ].
	^ self title ifEmpty: [ 'Something is not right' ]