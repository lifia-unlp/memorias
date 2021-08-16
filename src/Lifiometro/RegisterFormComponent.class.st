Class {
	#name : #RegisterFormComponent,
	#superclass : #LoginFormComponent,
	#instVars : [
		'repeatPassword',
		'fullname'
	],
	#category : 'Lifiometro-Web-Login'
}

{ #category : #callbacks }
RegisterFormComponent >> accept [
	problem := nil.
	self passwordsMatch
		ifFalse: [ problem := 'Las contraseñas no coinciden.'.
			^ self ].
	(LifiometroRepository singleton userWithEmail: email address) notNil
		ifTrue: [ problem := 'Ya existe un usuario con ese email.'.
			^ self ].
	parent
		register: email address
		withHashedPassword: (self hash: password)
		andName: fullname
]

{ #category : #accessing }
RegisterFormComponent >> fullname [
	^ fullname
]

{ #category : #accessing }
RegisterFormComponent >> fullname: anObject [
	fullname := anObject
]

{ #category : #testing }
RegisterFormComponent >> passwordsMatch [
	^ password = repeatPassword
]

{ #category : #testing }
RegisterFormComponent >> renderButtonsOn: html [
	html
		paragraph: [ html tbsButton
			   id: 'login';
				bePrimary;
				callback: [ self accept ];
				with: 'Registrarse' ]
]

{ #category : #rendering }
RegisterFormComponent >> renderFullnameInputOn: html [
	html
		tbsFormGroup: [ html label
				for: 'fullname';
				with: [ html text: 'Nombre completo' ].
			html textInput 
				id: 'fullname';
				tbsFormControl;
				on: #fullname of: self ]
]

{ #category : #rendering }
RegisterFormComponent >> renderInputElementsOn: html [
	super renderInputElementsOn: html.
	self renderRepeatPasswordInputOn: html.
	self renderFullnameInputOn: html
]

{ #category : #rendering }
RegisterFormComponent >> renderRepeatPasswordInputOn: html [
	html
		tbsFormGroup: [ html label
				for: 'repeatPassword';
				with: [ html text: 'Contraseña (nuevamente)' ].
			html passwordInput
				id: 'repeatPassword';
				tbsFormControl;
				on: #repeatPassword of: self ]
]

{ #category : #accessing }
RegisterFormComponent >> repeatPassword [
	^ repeatPassword
]

{ #category : #accessing }
RegisterFormComponent >> repeatPassword: anObject [
	repeatPassword := anObject
]
