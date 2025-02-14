Class {
	#name : #MockMailerSendAPI,
	#superclass : #MailerSendAPI,
	#instVars : [
		'sentEmails'
	],
	#category : #'Lifiometro-Email'
}

{ #category : #accessing }
MockMailerSendAPI >> apiKey [

	^ 'mock-key'
]

{ #category : #api }
MockMailerSendAPI >> initialize [
	super initialize .
	minSecondsBetweenRequests := 2.
	sentEmails := OrderedCollection new. 
]

{ #category : #api }
MockMailerSendAPI >> sendWithoutChecks: aScolrEmail [

		sentEmails add: aScolrEmail  
]

{ #category : #accessing }
MockMailerSendAPI >> sentEmails [

	^ sentEmails
]
