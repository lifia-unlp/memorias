Class {
	#name : #MemoriasEmail,
	#superclass : #Object,
	#instVars : [
		'from',
		'to',
		'subject',
		'timestamp'
	],
	#category : #'Lifiometro-Email'
}

{ #category : #private }
MemoriasEmail >> asDictionary [

	| receivers |
	receivers := to collect: [ :anEmailAddress | 
		             Dictionary new
			             at: 'email' put: anEmailAddress;
			             yourself ].

	^ Dictionary new
		  at: 'from' put: (Dictionary new
				   at: 'email' put: from;
				   yourself);
		  at: 'subject' put: subject;
		  at: 'to' put: receivers;
		  yourself
]

{ #category : #accessing }
MemoriasEmail >> from [

	^ from
]

{ #category : #accessing }
MemoriasEmail >> from: anObject [

	from := anObject
]

{ #category : #initialization }
MemoriasEmail >> initialize [

	timestamp := DateAndTime now
]

{ #category : #accessing }
MemoriasEmail >> subject [

	^ subject
]

{ #category : #accessing }
MemoriasEmail >> subject: anObject [

	subject := anObject
]

{ #category : #accessing }
MemoriasEmail >> timestamp [

	^ timestamp
]

{ #category : #accessing }
MemoriasEmail >> to [

	^ to
]

{ #category : #accessing }
MemoriasEmail >> to: aCollectionOfEmailAddresses [

	to := aCollectionOfEmailAddresses
]
