"
I try to notify the admin-email if it has been configured in ReviewnatorDeployer

"
Class {
	#name : #LifiometroEmailErrorHandler,
	#superclass : #WAEmailErrorHandler,
	#category : 'Lifiometro-Web'
}

{ #category : #private }
LifiometroEmailErrorHandler >> from [
	"ansers the WAEmailAddress instance used as a sender address"

	^ WAEmailAddress address: 'casco@lifia.info.unlp.edu.ar'
]

{ #category : #private }
LifiometroEmailErrorHandler >> handleDefault: anException [
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
LifiometroEmailErrorHandler >> renderContentForException: anException on: html [
	html tbsAlert
		beDanger;
		with: [ html strong: 'Oh snap!'.
			html text: ' I encounter an error. I already tried to notify the admins. Be sure to export your reviews, just in case.' ]
]

{ #category : #private }
LifiometroEmailErrorHandler >> rendererClass [
	^ WAHtmlCanvas
]

{ #category : #private }
LifiometroEmailErrorHandler >> titleForException: anException [
	^ anException description
]

{ #category : #private }
LifiometroEmailErrorHandler >> to [
	"answers the WAEmailAddress instance to which the error mail should be sent"

	^ WAEmailAddress address: 'casco@lifia.info.unlp.edu.ar'
]

{ #category : #private }
LifiometroEmailErrorHandler >> updateHtmlRoot: anHtmlRoot forException: anException [
	anHtmlRoot title: (self titleForException: anException)
]
