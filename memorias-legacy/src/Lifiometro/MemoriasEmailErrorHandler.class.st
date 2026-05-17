"
I try to notify the admin-email if it has been configured in ReviewnatorDeployer

"
Class {
	#name : #MemoriasEmailErrorHandler,
	#superclass : #WAErrorHandler,
	#classVars : [
		'DateAndTimeOfLatestException',
		'LatestException'
	],
	#category : #'Lifiometro-Errors'
}

{ #category : #private }
MemoriasEmailErrorHandler >> emailTextForException: anException [

	^ String streamContents: [ :stream | 
		  anException signalerContext errorReportOn: stream ]
]

{ #category : #private }
MemoriasEmailErrorHandler >> handleDefault: anException [
	self requestContext respond: [ :response |
		response
			internalError;
			contentType: WAMimeType textHtml;
			nextPutAll: (self rendererClass builder
				fullDocument: true;
				rootBlock: [ :root | self updateHtmlRoot: root forException: anException ];
				render: [ :html | self renderContentForException: anException on: html ]) ]
]

{ #category : #private }
MemoriasEmailErrorHandler >> handleError: anException [

	(self isMuchNewerOrDifferent: anException) ifTrue: [
		self sendFailFor: anException ].
	^ super handleError: anException
]

{ #category : #private }
MemoriasEmailErrorHandler >> isMuchNewerOrDifferent: anException [

   "LatestException := nil"

	^ LatestException isNil or: [
		  (DateAndTime now - DateAndTimeOfLatestException) asDays > 1 or: [
			  LatestException description ~= LatestException description ] ]
]

{ #category : #private }
MemoriasEmailErrorHandler >> renderContentForException: anException on: html [

	html tbsAlert
		beDanger;
		with: [
			html strong: 'Apala papa ! Oh snap!'.

			html paragraph: ((self isMuchNewerOrDifferent: anException)
						 ifTrue: [
							 'I encountered an error. I already tried to notify the admins.' ]
						 ifFalse: [
							 'I encountered an error (again today). I already tried to notify the admins. I will stop notifying them for now. I will insist tomorrow.' ]).
			html paragraph:
					'I am almost sure you can safely go back to the home page of the application and resume your work.'.
			html paragraph:
					'Try not to insist with the actions that took you here.' ]
]

{ #category : #private }
MemoriasEmailErrorHandler >> rendererClass [
	^ WAHtmlCanvas
]

{ #category : #private }
MemoriasEmailErrorHandler >> sendFailFor: anException [

	| email |
	LatestException := anException.
	DateAndTimeOfLatestException := DateAndTime now.
	MailerSendAPI singleton isProperlyConfigured ifFalse: [ ^ self ].
	email := MemoriasPlainTextEmail new
		         from: MailerSendAPI singleton emailsSender;
		         to: (Set with: MailerSendAPI singleton sendErrorEmailsTo);
		         subject: (self titleForException: anException);
		         text: (self emailTextForException: anException);
		         yourself.
	MailerSendAPI singleton send: email
]

{ #category : #private }
MemoriasEmailErrorHandler >> titleForException: anException [
	^ anException description
]

{ #category : #private }
MemoriasEmailErrorHandler >> updateHtmlRoot: anHtmlRoot forException: anException [
	anHtmlRoot title: (self titleForException: anException)
]
