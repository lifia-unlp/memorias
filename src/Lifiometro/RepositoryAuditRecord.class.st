Class {
	#name : #RepositoryAuditRecord,
	#superclass : #Object,
	#instVars : [
		'what',
		'who',
		'when',
		'action'
	],
	#category : #'Lifiometro-Repository'
}

{ #category : #voyage }
RepositoryAuditRecord class >> isVoyageRoot [ 
   ^true
]

{ #category : #'instance creation' }
RepositoryAuditRecord class >> what: theObject who: theUser when: theDate action: aString [
	^ self new
		what: theObject
			who: theUser
			when: theDate
			action: aString;
		yourself
]

{ #category : #accessing }
RepositoryAuditRecord >> action [
	^ action
]

{ #category : #accessing }
RepositoryAuditRecord >> what [
	^ what
]

{ #category : #initialization }
RepositoryAuditRecord >> what: theObject who: theUser when: theDate action: aString [
	what := theObject.
	who := theUser.
	when := theDate.
	action := aString
]

{ #category : #accessing }
RepositoryAuditRecord >> when [
	^ when
]

{ #category : #accessing }
RepositoryAuditRecord >> who [
	^ who
]
