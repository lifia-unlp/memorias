Class {
	#name : #AdministrationComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #callbacks }
AdministrationComponent >> callEnglishCritic [

	self call: GptEnglishCriticComponent new
]

{ #category : #callbacks }
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

{ #category : #callbacks }
AdministrationComponent >> editLinkedDataConfiguration [

	self call: LinkedDataConfigurationComponent new.
]

{ #category : #callbacks }
AdministrationComponent >> editPositionsAtCIC [

	| currentValues response |
	currentValues := LifiometroRepository singleton
		                 persistentConfiguration positionsAtCIC ifNil: [
		                 OrderedCollection new ].
	response := self call: (StringCollectionEditorComponent
			             strings: currentValues
			             title: 'Cargos de CICPBA'
			             comment: '').
	response ifNotNil: [
		LifiometroRepository singleton persistentConfiguration
			positionsAtCIC: response;
			save ]
]

{ #category : #callbacks }
AdministrationComponent >> editPositionsAtCONICET [

	| currentValues response |
	currentValues := LifiometroRepository singleton
		                 persistentConfiguration positionsAtCONICET ifNil: [
		                 OrderedCollection new ].
	response := self call: (StringCollectionEditorComponent
			             strings: currentValues
			             title: 'Cargos de CONICET'
			             comment: '').
	response ifNotNil: [
		LifiometroRepository singleton persistentConfiguration
			positionsAtCONICET: response;
			save ]
]

{ #category : #callbacks }
AdministrationComponent >> editPositionsAtUNLP [

	| currentValues response |
	currentValues := LifiometroRepository singleton
		                 persistentConfiguration positionsAtUNLP ifNil: [
		                 OrderedCollection new ].
	response := self call: (StringCollectionEditorComponent
			             strings: currentValues
			             title: 'Cargos de investigadores y docentes en UNLP'
			             comment: '').
	response ifNotNil: [
		LifiometroRepository singleton persistentConfiguration
			positionsAtUNLP: response;
			save ]
]

{ #category : #callbacks }
AdministrationComponent >> editScholarshipFundingSources [

	| defaultSources response otherSourcesInUse |
	defaultSources := LifiometroRepository singleton
		                  persistentConfiguration scholarshipFundingSources
		                  ifNil: [ OrderedCollection new ].
	otherSourcesInUse := LifiometroRepository singleton scholarships
		                     collect: #fundingAgency
		                     as: Set.
	otherSourcesInUse removeAllFoundIn: defaultSources.

	response := self call: (StringCollectionEditorComponent
			             strings: defaultSources
			             title:
			             'Fuentes de financiación de becas y estadias predefinidas'
			             comment:
				             'Actualmente estan en uso las siguientes fuentes de financiación no predefinidos: '
				             ,
				             (otherSourcesInUse collect: #printString) sorted
					             asCommaString).
	response ifNotNil: [ :updatedSources |
		LifiometroRepository singleton persistentConfiguration
			scholarshipFundingSources: updatedSources;
			save ]
]

{ #category : #callbacks }
AdministrationComponent >> editScholarshipTypes [

	| defaultTypes response otherTypesInUse |
	defaultTypes := LifiometroRepository singleton persistentConfiguration
		                scholarshipTypes ifNil: [ OrderedCollection new ].
	otherTypesInUse := LifiometroRepository singleton scholarships
		                   collect: #type
		                   as: Set.
	otherTypesInUse removeAllFoundIn: defaultTypes.

	response := self call: (StringCollectionEditorComponent
			             strings: defaultTypes
			             title: 'Tipos de becas predefinidos'
			             comment:
				             'Actualmente estan en uso los siguientes tipos no predefinidos: '
				             ,
				             (otherTypesInUse collect: #printString) sorted
					             asCommaString).
	response ifNotNil: [ :updatedTypes |
		LifiometroRepository singleton persistentConfiguration
			scholarshipTypes: updatedTypes;
			save ]
]

{ #category : #callbacks }
AdministrationComponent >> exploreObsoleteReferences [

	self call: ObsoleteReferencesExplorer  new
]

{ #category : #callbacks }
AdministrationComponent >> exportAsJsonLd [

	self requestContext respond: [ :response |
		response contentType: 'application/json'.
		response
			headerAt: 'Content-Disposition'
			put: 'attachment; filename="json-ld.json"'.
		response nextPutAll: (String streamContents: [ :stream |
				 stream nextPutAll: JsonLDWriter new json  ]) ]
]

{ #category : #callbacks }
AdministrationComponent >> fixTagNamesCase [

	| toFix |
	toFix := BibtexReference selectAll select: [ :each |
		         each bibtexEntry needsTagNameCaseFixig ].
	toFix do: [ :each |
		each bibtexEntry fixTagNameCase.
		each save ]
]

{ #category : #callbacks }
AdministrationComponent >> guessArticleAuthors [
	self call: GuessInvolvedResearchersComponent new
]

{ #category : #callbacks }
AdministrationComponent >> importFromDblp [
	self call: BibtexURLImporterComponent new
]

{ #category : #callbacks }
AdministrationComponent >> makeObsolete: aLifiaUser [

	aLifiaUser becomeObsolete.
	LifiometroRepository singleton saveUser: aLifiaUser
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
						with: 'Simulate error'.

					html break.
					html anchor
						callback: [ self fixTagNamesCase ];
						with: 'Change names of all existing bibtex entries to lowercase'.

					html break.
					html anchor
						callback: [ self call: MisingAbstractsCollectorComponent new ];
						with: 'Complete abstracts'.
					html break.
					html anchor
						callback: [ self restoreTrashedItems ];
						with: 'Restore trashed items'.
					html break.
					html anchor
						callback: [ self exploreObsoleteReferences ];
						with: 'Explore obsolete references'.
					html break.
					html anchor
						callback: [ self exportAsJsonLd ];
						with: 'Export JSON-LD' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderContentOn: html [

	html tbsPanel: [
		html tbsPanelBody: [
			self renderUsersListOn: html.
			self renderBulkActionsOn: html.
			self renderDefaultValuesOn: html.
			self renderStatsOn: html.
			self renderEnvironmentVarsOn: html ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderDefaultValuesOn: html [

	html tbsPanel
		beDefault;
		with: [
			html tbsPanelHeading: [ html label: 'Default values' ].
			html tbsPanelBody: [
					html anchor
						callback: [ self editScholarshipTypes ];
						with: 'Editar tipos de becas y estadias'.
					html break.
					html anchor
						callback: [ self editScholarshipFundingSources ];
						with: 'Editar fuentes de financiación de becas y estadias'.
					html break.
					html anchor
						callback: [ self editPositionsAtUNLP ];
						with: 'Editar tipos de cargos de UNLP'.
					html break.
					html anchor
						callback: [ self editPositionsAtCIC ];
						with: 'Editar tipos de cargos de CIC'.
					html break.
					html anchor
						callback: [ self editPositionsAtCONICET ];
						with: 'Editar tipos de cargos en CONICET'.
					html break.
					html anchor
						callback: [ self editLinkedDataConfiguration ];
						with: 'Editar configuracion de Linked data' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderDisabledUsersListOn: html [

	html tbsPanel
		beDefault;
		with: [
			html tbsPanelHeading: [ html label: 'Disabled users' ].
			html tbsPanelBody: [
					((LifiometroRepository singleton users reject: [ :each |
							  each enabled ]) asSortedCollection: [ :a :b |
							 a email <= b email ]) do: [ :each |
							self renderUser: each on: html ] ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderEnabledUsersListOn: html [

	html tbsPanel
		beDefault;
		with: [
			html tbsPanelHeading: [ html label: 'Enabled users' ].
			html tbsPanelBody: [
					((LifiometroRepository singleton users select: [ :each |
							  each enabled ]) asSortedCollection: [ :a :b |
							 a email <= b email ]) do: [ :each |
							self renderUser: each on: html ] ] ]
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
							html text: (OSEnvironment current at: 'DEBUG' ifAbsent: 'not set') ].
					html paragraph with: [
							html strong: 'DB_HOST: '.
							html text: (OSEnvironment current at: 'DB_HOST' ifAbsent: 'not set') ].
					html paragraph with: [
							html strong: 'DB: '.
							html text: (OSEnvironment current at: 'DB' ifAbsent: 'not set') ].
					html paragraph with: [
							html strong: 'MAILERSEND_APIKEY: '.
							html text: (OSEnvironment current at: 'MAILERSEND_APIKEY' ifAbsent: 'not set') ].
					html paragraph with: [
							html strong: 'EMAILS_SENDER: '.
							html text: (OSEnvironment current at: 'EMAILS_SENDER' ifAbsent: 'not set') ].
					html paragraph with: [
							html strong: 'ERROR_EMAILS_TO: '.
							html text: (OSEnvironment current at: 'ERROR_EMAILS_TO' ifAbsent: 'not set') ] ] ]
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

	html paragraph: [
		html
			strong: each email;
			text: ' - Admin: '.
		html anchor
			callback: [ self toggleAdminFor: each ];
			with: each isAdmin printString.
		html text: ' - Activado: '.
		html anchor
			callback: [ self toggleEnabledFor: each ];
			with: each enabled printString.

		html text: ' - Investigador: '.

		html anchor
			callback: [ self selectLifianFor: each ];
			with:
				(each lifian ifNil: [ 'not set' ] ifNotNil: [ :it | it fullName ]).

		each isPasswordSet
			ifTrue: [
				html anchor
					callback: [ self clearPasswordFor: each ];
					with: ' - Limpiar password' ]
			ifFalse: [
				html span
					style: 'color: red;';
					with: ' - Sin password' ].

		each enabled ifFalse: [
			html anchor
				callback: [ self makeObsolete: each ];
				with: ' - Borrar' ] ]
]

{ #category : #rendering }
AdministrationComponent >> renderUsersListOn: html [
	self renderEnabledUsersListOn: html.
	self renderDisabledUsersListOn: html.
]

{ #category : #callbacks }
AdministrationComponent >> restoreTrashedItems [

	self call: TrashedRestoringComponent new
]

{ #category : #callbacks }
AdministrationComponent >> selectLifianFor: aLifiaUser [

	self call: (AssignLifianToLifiaUserComponent new
			 lifiaUser: aLifiaUser;
			 yourself)
]

{ #category : #callbacks }
AdministrationComponent >> sendTestEmail [

	| email |
	MailerSendAPI singleton isProperlyConfigured ifFalse: [ ^ self ].
	email := MemoriasPlainTextEmail new
		         from: MailerSendAPI singleton emailsSender;
		         to: (Set with: MailerSendAPI singleton sendErrorEmailsTo);
		         subject: 'Este es un correo de pruebas';
		         text:
			         'Si te llega este correo es porque funciona la configuración';
		         yourself.
	MailerSendAPI singleton send: email
]

{ #category : #callbacks }
AdministrationComponent >> setMissingSlugs [

	LifiometroRepository singleton researchers
	, LifiometroRepository singleton projects
	, LifiometroRepository singleton thesis
	, LifiometroRepository singleton references do: [ :each |
		self session save: each ]
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
