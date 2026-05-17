Class {
	#name : #MailerSendAPI,
	#superclass : #Object,
	#instVars : [
		'emailsSender',
		'sendErrorEmailsTo',
		'apiKey',
		'minSecondsBetweenRequests',
		'timestampOfLatestRequest'
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

   minSecondsBetweenRequests := 30. 
   timestampOfLatestRequest := DateAndTime epoch. 
]

{ #category : #accessing }
MailerSendAPI >> isProperlyConfigured [

	^ self apiKey isEmptyOrNil not & self emailsSender isEmptyOrNil not
]

{ #category : #api }
MailerSendAPI >> mightBeUnderAbuse [
   
  "I am under when a request occur in less than minSecondsBetweenRequests from the last one"

	^ DateAndTime now asSeconds - timestampOfLatestRequest asSeconds
	  < minSecondsBetweenRequests
]

{ #category : #accessing }
MailerSendAPI >> minSecondsBetweenRequests: seconds [

	minSecondsBetweenRequests := seconds
]

{ #category : #api }
MailerSendAPI >> send: aScolrEmail [

	self apiKey ifNil: [ self error: 'API not properly configured' ].
	self mightBeUnderAbuse ifTrue: [ ^ self . ].
	timestampOfLatestRequest := DateAndTime now.
	^ self sendWithoutChecks: aScolrEmail
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
MailerSendAPI >> sendWithoutChecks: aScolrEmail [

	| client |
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
