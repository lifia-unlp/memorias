Class {
	#name : #MailerSendAPI,
	#superclass : #Object,
	#instVars : [
		'abuseWindow',
		'emailsSender',
		'sendErrorEmailsTo',
		'apiKey'
	],
	#classInstVars : [
		'singleton'
	],
	#category : #'Lifiometro-Email'
}

{ #category : #accessing }
MailerSendAPI class >> apikeyFilename [

  ^'mailersend_apikey.secret'
]

{ #category : #singleton }
MailerSendAPI class >> singleton [

	^ singleton ifNil: [ singleton := self new ]
]

{ #category : #accessing }
MailerSendAPI >> apiKey [

	^ apiKey 
]

{ #category : #accessing }
MailerSendAPI >> apiKey: anObject [

	apiKey := anObject
]

{ #category : #accessing }
MailerSendAPI >> emailsSender [

	^ emailsSender
]

{ #category : #accessing }
MailerSendAPI >> emailsSender: anObject [

	emailsSender := anObject
]

{ #category : #initialization }
MailerSendAPI >> initialize [ 	

   abuseWindow := OrderedCollection new. 
]

{ #category : #accessing }
MailerSendAPI >> isProperlyConfigured [

	^ self apiKey isEmptyOrNil not & self emailsSender isEmptyOrNil not
]

{ #category : #api }
MailerSendAPI >> mightBeUnderAbuse [
	"Currently returns true only when emails in the abuse window have been sent within a 60 seconds timeframe, or the last two in less than 10"

	abuseWindow size <= 2 ifTrue: [ ^ false ].
	abuseWindow last timestamp asSeconds
	- abuseWindow nextToLast timestamp asSeconds > 10 ifTrue: [ ^ false ].
	abuseWindow last timestamp asSeconds
	- abuseWindow first timestamp asSeconds > 60 ifTrue: [ ^ false ].

	^ true
]

{ #category : #api }
MailerSendAPI >> send: aScolrEmail [

	| client |
	self apiKey ifNil: [ self error: 'API not properly configured' ].
	self mightBeUnderAbuse ifTrue: [ ^ self ].
	self updateAbuseWindowWith: aScolrEmail.
	client := ZnClient new
		          beOneShot;
		          url: 'https://api.mailersend.com/v1/email';
		          headerAt: 'Content-Type' put: 'application/json';
		          headerAt: 'X-Requested-With' put: 'XMLHttpRequest';
		          headerAt: 'Authorization' put: 'Bearer ' , self apiKey;
		          entity: aScolrEmail asZnEntity.
	client post.
	^ client response
]

{ #category : #accessing }
MailerSendAPI >> sendErrorEmailsTo [

	^ sendErrorEmailsTo
]

{ #category : #accessing }
MailerSendAPI >> sendErrorEmailsTo: anObject [

	sendErrorEmailsTo := anObject
]

{ #category : #api }
MailerSendAPI >> updateAbuseWindowWith: aScolrEmail [

	abuseWindow addLast: aScolrEmail.
	abuseWindow size > 10 ifTrue: [ abuseWindow removeFirst ]
]
