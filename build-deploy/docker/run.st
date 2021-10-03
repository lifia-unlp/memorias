| apps dbhost db dbuser dbpassword smtpServer |

dbhost := OSEnvironment current at: 'DB_HOST' ifAbsent: 'mongodb'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB_USER' ifAbsent: nil.
dbpassword := OSEnvironment current at: 'DB_PASSWORD' ifAbsent: nil.
smtpServer := OSEnvironment current at: 'SMTP' ifAbsent: nil.

"SMTP server for error reporting"
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
apps add: (WAAdmin register: ReportComponent  asApplicationAt: 'center-profile').
apps add: (WAAdmin register: ResearcherReportComponent  asApplicationAt: 'researcher-profile').
apps add: (WAAdmin register: PublicProjectsListComponent asApplicationAt: 'project-list').
apps add: (WAAdmin register: ProjectReportComponent   asApplicationAt: 'project-profile').

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