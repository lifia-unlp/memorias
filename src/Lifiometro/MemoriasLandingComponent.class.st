"
| apps dbhost db dbuser dbpassword smtpServer |

dbhost := OSEnvironment current at: 'DB_HOST' ifAbsent: 'mongodb'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB_USER' ifAbsent: nil.
dbpassword := OSEnvironment current at: 'DB_PASSWORD' ifAbsent: nil.
smtpServer := OSEnvironment current at: 'SMTP' ifAbsent: nil.

""SMTP server for error reporting""
MailComposition setSmtpServer: smtpServer.

dbuser
	ifNil: [ (VOMongoRepository
			host: dbhost
			database: db) enableSingleton ]
	ifNotNil: [ (VOMongoRepository
			host: dbhost
			database: db
			username: dbuser
			password: dbpassword) enableSingleton ].

WAAdmin defaultServerManager adaptors
        do: [ :each | WAAdmin defaultServerManager unregister: each ].
ZnZincServerAdaptor startOn: 8080.

WAAdmin applicationDefaults
	removeParent: WADevelopmentConfiguration instance.

DoiToBibAPI ensureBibtexMimeTypeIsNotBinary.
ChronologyConstants useSpanishMonthNames.

WAAdmin applicationDefaults
	removeParent: WADevelopmentConfiguration instance.

apps := OrderedCollection new.
apps add: ((WAAdmin register: MemoriasLandingComponent asApplicationAt: 'memorias') 
				sessionClass: MemoriasSession; 
				yourself). 
apps add: (WAAdmin register: ReportComponent  asApplicationAt: ReportComponent relativeUrl ).
apps add: (WAAdmin register: ResearcherReportComponent  asApplicationAt: ResearcherReportComponent relativeUrl).
apps add: (WAAdmin register: PublicProjectsListComponent asApplicationAt: PublicProjectsListComponent relativeUrl ).
apps add: (WAAdmin register: ProjectReportComponent   asApplicationAt: ProjectReportComponent relativeUrl).

apps do: [:app | 
 smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
 app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary;
	addLibrary: TBSJasnyDeploymentLibrary;
	addLibrary: TBSVerticalTabsDeploymentLibrary;
	addLibrary: LifiaFileLibrary.	
].

WAAdmin defaultDispatcher defaultName: 'memorias'.

Transcript cr; show: 'Memorias starting  (dbhost: ', dbhost, ', db: ', db, ')'; cr; cr.
"
Class {
	#name : #MemoriasLandingComponent,
	#superclass : #WAComponent,
	#instVars : [
		'activeComponent',
		'loginComponent',
		'registerComponent'
	],
	#category : #'Lifiometro-Web-Login'
}

{ #category : #urls }
MemoriasLandingComponent class >> applicationName [
	^ 'gaf'
]

{ #category : #urls }
MemoriasLandingComponent class >> url [
	^ '/' , self applicationName
]

{ #category : #initialization }
MemoriasLandingComponent >> initialize [
	super initialize.
	loginComponent := LoginFormComponent new parent: self.
	registerComponent := RegisterFormComponent new parent: self.
	activeComponent := loginComponent
]

{ #category : #'login-register' }
MemoriasLandingComponent >> login: anEmailAddress withHashedPassword: aHashedPassword [
	(LifiometroRepository singleton userWithEmail: anEmailAddress)
		ifNil: [ activeComponent problem: 'El usuario no existe' ]
		ifNotNil: [ :it | 
			(it isValidPassword: aHashedPassword)
				ifTrue: [ self proceedWith: it ]
				ifFalse: [ activeComponent problem: 'Contraseña incorrecta' ] ]
]

{ #category : #'login-register' }
MemoriasLandingComponent >> proceedWith: aUser [
	self session currentUser: aUser.
	aUser lastConnected: DateAndTime now.
	LifiometroRepository singleton saveUser: aUser.
	aUser enabled
		ifTrue: [ self call: HomeComponent new ]
		ifFalse: [ self call: UserDisabledNoticeComponent new ]
]

{ #category : #'login-register' }
MemoriasLandingComponent >> register: anEmailAddress withHashedPassword: aHashedPassword andName: aName [
	| theNewUser |
	theNewUser := LifiaUser new
		email: anEmailAddress;
		hashedPassword: aHashedPassword;
		fullname: aName;
		yourself.
	LifiaUser selectAll
		ifEmpty: [ theNewUser
				isAdmin: true;
				enabled: true ].
	self proceedWith: theNewUser
]

{ #category : #rendering }
MemoriasLandingComponent >> renderContentOn: html [
	html
		tbsContainer: [ html break.
			html
				tbsJumbotron: [ html
						tbsRow: [ self renderPresentationColumnOn: html.
							self renderLoginColumnOn: html ] ] ].
	self renderFooterNoteOn: html.

]

{ #category : #rendering }
MemoriasLandingComponent >> renderFooterNoteOn: html [
	html
		tbsContainer: [ html
				small: [ html
						paragraph: [ html
								text:
									'Esta aplicación fue diseñada y desarrollada por investigadores, docentes y alumnos del '.
							html anchor
								url: 'http://www.lifia.info.unlp.edu.ar';
								target: '_blank';
								with:
									'Centro de Investigación LIFIA de la Facultad de Informática de la UNLP.'.
							html
								paragraph: [ html text: 'Esta aplicación se '.
									html anchor
										url: 'https://github.com/lifia-unlp/memorias';
										target: '_blank';
										with: 'encuentra disponible'.
									html text: ' bajo licencia GPL3' ] ] ] ].
]

{ #category : #rendering }
MemoriasLandingComponent >> renderLoginColumnOn: html [
	^ html
		tbsColumn: [ html render: activeComponent.
			self renderLoginOrRegisterOfferOn: html ]
		mediumSize: 6
]

{ #category : #rendering }
MemoriasLandingComponent >> renderLoginOrRegisterOfferOn: html [
	activeComponent == loginComponent
		ifTrue: [ html paragraph
				with: [ html text: 'Si aún no tiene cuenta, '.
					html anchor
						callback: [ activeComponent := registerComponent ];
						with: 'puede registrarse' ] ]
		ifFalse: [ html paragraph
				with: [ html text: 'Si ya tiene cuenta, '.
					html anchor
						callback: [ activeComponent := loginComponent ];
						with: 'puede ingresar con ella' ] ]
]

{ #category : #rendering }
MemoriasLandingComponent >> renderPresentationColumnOn: html [
	html
		tbsColumn: [ html image
				style: 'padding-bottom: 20px;';
				url: LifiaFileLibrary / #logolifiaPng.
			html paragraph
				class: 'lead';
				with:
					'Lleve registro de publicaciones, proyectos, becas, y dirección de recursos humanos de investigación, simplificando la generación de reportes y su publicación en la web.' ]
		mediumSize: 6
]
