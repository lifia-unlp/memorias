Class {
	#name : #AdministrationComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #callbacks }
AdministrationComponent >> callEnglishCritic [

	self call: GptEnglishCriticComponent new
]

{ #category : #rendering }
AdministrationComponent >> cleanupTitlesAndAuthors [
	LifiometroRepository singleton references
		do: [ :each | 
			each cleanupLatexAccentsAndBraces.
			self session save: each ]
]

{ #category : #rendering }
AdministrationComponent >> clearPasswordFor: each [
	each
		clearPassword;
		save
]

{ #category : #rendering }
AdministrationComponent >> guessArticleAuthors [
	self call: GuessInvolvedResearchersComponent new
]

{ #category : #callbacks }
AdministrationComponent >> importFromDblp [
	self call: BibtexURLImporterComponent new
]

{ #category : #rendering }
AdministrationComponent >> renderActiveSessionsFor: app on: html [
	html
		paragraph:
			'Active sessions (' , app , '): '
				, (WADispatcher default handlerAt: app) sessions size greaseString
]

{ #category : #rendering }
AdministrationComponent >> renderBulkActionsOn: html [

	html tbsPanel
		beDefault;
		with: [
			html tbsPanelHeading: [ html label: 'Bulk actions' ].
			html tbsPanelBody: [
					html anchor
						callback: [ self importFromDblp ];
						with: 'Import from DBLP'.
					html break.
					html anchor
						callback: [ self cleanupTitlesAndAuthors ];
						with: 'Cleanup latex accents and braces'.
					html break.
					html anchor
						callback: [ self sendTestEmail ];
						with: 'Send test email'.
					html break.
					html anchor
						callback: [ self guessArticleAuthors ];
						with: 'Guess article authors'.

					html break.
					html anchor
						callback: [ self callEnglishCritic ];
						with: 'GPT English Critic'.


					html break.
					html anchor
						callback: [ 1 / 0 ];
						with: 'Simulate error' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderContentOn: html [
	html
		tbsPanel: [ html tbsPanelBody:
				[ self renderUsersListOn: html.
				self renderBulkActionsOn: html. 
				self renderStatsOn: html.
				self renderEnvironmentVarsOn: html ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderDisabledUsersListOn: html [
	 html tbsPanel
		beDefault;
		with: [ html tbsPanelHeading: [ html label: 'Disabled users' ].
			html
				tbsPanelBody: [ (LifiometroRepository singleton users reject: [ :each | each enabled ])
						do: [ :each | self renderUser: each on: html ] ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderEnabledUsersListOn: html [
	 html tbsPanel
		beDefault;
		with: [ html tbsPanelHeading: [ html label: 'Enabled users' ].
			html
				tbsPanelBody: [ (LifiometroRepository singleton users select: [ :each | each enabled ])
						do: [ :each | self renderUser: each on: html ] ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderEnvironmentVarsOn: html [

	html tbsPanel
		beDefault;
		with: [
			html tbsPanelHeading: [ html label: 'Environment variables' ].
			html tbsPanelBody: [
					html paragraph with: [
							html strong: 'DEBUG: '.
							html text: (OSEnvironment current at: 'DEBUG') ].
					html paragraph with: [
							html strong: 'DB_HOST: '.
							html text: (OSEnvironment current at: 'DB_HOST') ].
					html paragraph with: [
							html strong: 'DB: '.
							html text: (OSEnvironment current at: 'DB') ].
					html paragraph with: [
							html strong: 'MAILERSEND_APIKEY: '.
							html text: (OSEnvironment current at: 'MAILERSEND_APIKEY') ].
					html paragraph with: [
							html strong: 'EMAILS_SENDER: '.
							html text: (OSEnvironment current at: 'EMAILS_SENDER') ].
					html paragraph with: [
							html strong: 'ERROR_EMAILS_TO: '.
							html text: (OSEnvironment current at: 'ERROR_EMAILS_TO') ] ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderStatsOn: html [
	html tbsPanel
		beDefault;
		with: [ html tbsPanelHeading: [ html label: 'Statistics' ].
			html
				tbsPanelBody: [ {'memorias' . 'center-profile' . 'researcher-profile'.
					'project-profile'. 'project-list'}
						do: [ :app | self renderActiveSessionsFor: app on: html ].
					html
						paragraph:
							'Memory usage: '
								, (Smalltalk vm memorySize / 1048576) truncated greaseString
								, ' MB' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderUser: each on: html [
	html
		paragraph: [ html
				strong: each email;
				text: ' - Admin: '.
			html anchor
				callback: [ self toggleAdminFor: each ];
				with: each isAdmin printString.
			html text: ' - Activado: '.
			html anchor
				callback: [ self toggleEnabledFor: each ];
				with: each enabled printString.
			each isPasswordSet
				ifTrue: [ html anchor
						callback: [ self clearPasswordFor: each ];
						with: ' - Limpiar password' ]
				ifFalse: [ html span
						style: 'color: red;';
						with: ' - Sin password' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderUsersListOn: html [
	self renderEnabledUsersListOn: html.
	self renderDisabledUsersListOn: html.
]

{ #category : #callbacks }
AdministrationComponent >> sendTestEmail [
	| message |
	message := WAEmailMessage
		from: 'casco@lifia.info.unlp.edu.ar'
		to: 'casco@lifia.info.unlp.edu.ar'
		subject: 'Este es un correo de pruebas'.
	message
		body: 'Si te llega este correo es porque funciona la configuración'.
	message send
]

{ #category : #callbacks }
AdministrationComponent >> toggleAdminFor: aUser [

	aUser toggleAdmin.
	LifiometroRepository singleton saveUser: aUser 

]

{ #category : #callbacks }
AdministrationComponent >> toggleEnabledFor: aUser [
	aUser toggleEnabled.
	LifiometroRepository singleton saveUser: aUser
]
