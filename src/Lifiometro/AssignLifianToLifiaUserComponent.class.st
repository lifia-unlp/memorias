Class {
	#name : #AssignLifianToLifiaUserComponent,
	#superclass : #WAComponent,
	#instVars : [
		'lifiaUser'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #accessing }
AssignLifianToLifiaUserComponent >> lifiaUser [

	^ lifiaUser
]

{ #category : #accessing }
AssignLifianToLifiaUserComponent >> lifiaUser: anObject [

	lifiaUser := anObject
]

{ #category : #rendering }
AssignLifianToLifiaUserComponent >> renderContentOn: html [

	html paragraph: [
		html anchor
			callback: [ self answer ];
			with: 'Cancel' ].

	html paragraph: [
		html strong: 'User''s email: '.
		html text: lifiaUser email ].

	html paragraph: [
		html strong: 'Corresponding Researcher: '.
		html text:
			(lifiaUser lifian
				 ifNil: [ 'not set' ]
				 ifNotNil: [ :it | it fullName ]) ].


	html heading
		level: 3;
		with: 'You can ... '.
	html anchor
		callback: [
			lifiaUser
				lifian: nil;
				save.
			self answer ];
		with: 'Clear it'.
	html heading
		level: 3;
		with: 'Or you can set it to:'.

	html unorderedList: [
		(LifiometroRepository singleton lifians asSortedCollection: [ :a :b |
			 a fullName < b fullName ]) do: [ :each |
			html listItem: [
				html anchor
					callback: [
						lifiaUser
							lifian: each;
							save.
						self answer ];
					with: each fullName ] ] ]
]
