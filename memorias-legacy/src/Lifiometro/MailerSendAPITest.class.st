Class {
	#name : #MailerSendAPITest,
	#superclass : #TestCase,
	#instVars : [
		'mockMailerSendAPI'
	],
	#category : #'Lifiometro-Email'
}

{ #category : #tests }
MailerSendAPITest >> setUp [

	mockMailerSendAPI := MockMailerSendAPI new.
	mockMailerSendAPI minSecondsBetweenRequests: 2.
	
]

{ #category : #tests }
MailerSendAPITest >> testSend_noAbuse [

	mockMailerSendAPI send: MemoriasEmail new .
	3 second wait.
	mockMailerSendAPI send: MemoriasEmail new .
	self assert: mockMailerSendAPI sentEmails size equals: 2
]

{ #category : #tests }
MailerSendAPITest >> testSend_underAbuse_abuseWindowMax [

	mockMailerSendAPI send: MemoriasEmail new .
	1 second wait.
	mockMailerSendAPI send: MemoriasEmail new .
	self assert: mockMailerSendAPI sentEmails size equals: 1
]
