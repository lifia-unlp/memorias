"
WAAdmin register: LoginFormComponent asApplicationAt: 'test'
"
Class {
	#name : #LoginFormComponent,
	#superclass : #WAComponent,
	#instVars : [
		'email',
		'problem',
		'parent',
		'password'
	],
	#category : 'Lifiometro-Web-Login'
}

{ #category : #callbacks }
LoginFormComponent >> accept [
	self problemsExist
		ifTrue: [ ^ self ].
	parent login: email address withHashedPassword: (self hash: password).
	email := ''.
	password := ''
]

{ #category : #accessing }
LoginFormComponent >> email [
	^ email
]

{ #category : #accessing }
LoginFormComponent >> email: anObject [
	email := anObject
]

{ #category : #callbacks }
LoginFormComponent >> hash: aString [
	^ (SHA256 new hashMessage: aString asByteArray) asString
]

{ #category : #accessing }
LoginFormComponent >> parent: anObject [
	parent := anObject
]

{ #category : #accessing }
LoginFormComponent >> password [
	^ password
]

{ #category : #accessing }
LoginFormComponent >> password: aString [
	password := aString
]

{ #category : #accessing }
LoginFormComponent >> problem [
	^ problem
]

{ #category : #accessing }
LoginFormComponent >> problem: anObject [
	problem := anObject
]

{ #category : #callbacks }
LoginFormComponent >> problemsExist [
	problem := nil.
	password isEmpty | email isNil
		ifTrue:
			[ problem := 'No olvide ingresar una dirección de correo y contraseña válidas.'.
			^ true ].
	^ false
]

{ #category : #rendering }
LoginFormComponent >> renderButtonsOn: html [
	html
		paragraph: [ html tbsButton
			   id: 'login';
				bePrimary;
				callback: [ self accept ];
				with: 'Ingresar' ]
]

{ #category : #rendering }
LoginFormComponent >> renderContentOn: html [
	html
		tbsForm: [ self renderProblemOn: html.
			self renderInputElementsOn: html.
			self renderButtonsOn: html ]
]

{ #category : #rendering }
LoginFormComponent >> renderEmailInputOn: html [
	html
		tbsFormGroup: [ html label
				for: 'email';
				with: [ html text: 'E-mail' ].
			html emailInput
				id: 'email';
				tbsFormControl;
				on: #email of: self ]
]

{ #category : #rendering }
LoginFormComponent >> renderInputElementsOn: html [
	self renderEmailInputOn: html.
	self renderPasswordInputOn: html
]

{ #category : #rendering }
LoginFormComponent >> renderPasswordInputOn: html [
	html
		tbsFormGroup: [ html label
				for: 'password';
				with: [ html text: 'Contraseña' ].
			html passwordInput 
				id: 'password';
				tbsFormControl;
				on: #password of: self ]
]

{ #category : #rendering }
LoginFormComponent >> renderProblemOn: html [
	problem
		ifNotNil: [ html paragraph
				style: 'color: red;';
				with: problem ]
]
