Class {
	#name : #LifiaUser,
	#superclass : #Object,
	#instVars : [
		'fullname',
		'email',
		'lastConnected',
		'isAdmin',
		'enabled',
		'hashedPassword',
		'lifian',
		'tags'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #'instance creation' }
LifiaUser class >> email: anEmail [
	^ self new
		email: anEmail;
		yourself
]

{ #category : #testing }
LifiaUser class >> isVoyageRoot [
	^ true 
]

{ #category : #utility }
LifiaUser >> becomeObsolete [

	self
		email: '';
		lifian: nil;
		fullname: 'Obsolete User'
]

{ #category : #password }
LifiaUser >> clearPassword [
	hashedPassword := nil
]

{ #category : #accessing }
LifiaUser >> email [
	^ email
]

{ #category : #accessing }
LifiaUser >> email: anObject [
	email := anObject
]

{ #category : #accessing }
LifiaUser >> enabled [
	self isAdmin
		ifTrue: [ ^ true ].
	^ enabled ifNil: [ enabled := false ]
]

{ #category : #accessing }
LifiaUser >> enabled: anObject [
	enabled := anObject
]

{ #category : #accessing }
LifiaUser >> fullname [
	^ fullname
]

{ #category : #accessing }
LifiaUser >> fullname: anObject [
	fullname := anObject
]

{ #category : #password }
LifiaUser >> hashedPassword [
	^ hashedPassword
]

{ #category : #password }
LifiaUser >> hashedPassword: anObject [
	hashedPassword := anObject
]

{ #category : #initialization }
LifiaUser >> initialize [
	isAdmin := false.
	enabled := false.
]

{ #category : #accessing }
LifiaUser >> isAdmin [

	"Lazy initialize tor backwards compatibility"
	isAdmin ifNil: [ isAdmin := false ].

	^ isAdmin
]

{ #category : #accessing }
LifiaUser >> isAdmin: anObject [
	isAdmin := anObject
]

{ #category : #password }
LifiaUser >> isPasswordSet [
	^ hashedPassword notNil
]

{ #category : #password }
LifiaUser >> isValidPassword: aHashedPassword [
	"If password is not set, set it on the first check"

	hashedPassword ifNil: [ hashedPassword := aHashedPassword ].
	^ hashedPassword = aHashedPassword
]

{ #category : #accessing }
LifiaUser >> lastConnected [
	^ lastConnected
]

{ #category : #accessing }
LifiaUser >> lastConnected: anObject [
	lastConnected := anObject
]

{ #category : #accessing }
LifiaUser >> lifian [

	^ lifian
]

{ #category : #accessing }
LifiaUser >> lifian: anObject [

	lifian := anObject
]

{ #category : #accessing }
LifiaUser >> tags [

	^ tags
]

{ #category : #accessing }
LifiaUser >> tags: anObject [

	tags := anObject
]

{ #category : #accessing }
LifiaUser >> toggleAdmin [
	isAdmin := self isAdmin not
]

{ #category : #accessing }
LifiaUser >> toggleEnabled [
	enabled := self enabled not
]
