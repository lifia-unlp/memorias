| apps dbhost db dbuser dbpassword smtpServer debug |

debug := (OSEnvironment current at: 'DEBUG' ifAbsent: 'false') = 'true'.
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

debug ifFalse: [
	WAAdmin defaultServerManager adaptors
        do: [ :each | WAAdmin defaultServerManager unregister: each ].
	WAAdmin applicationDefaults
		removeParent: WADevelopmentConfiguration instance.
].

ZnZincServerAdaptor startOn: 8080.

DoiToBibAPI ensureBibtexMimeTypeIsNotBinary.
ChronologyConstants useSpanishMonthNames.

apps := OrderedCollection new.
apps add: ((WAAdmin register: MemoriasLandingComponent asApplicationAt: 'memorias') 
				sessionClass: MemoriasSession; 
				yourself). 
apps add: (WAAdmin register: ReportComponent  asApplicationAt: 'center-profile').
apps add: (WAAdmin register: ResearcherReportComponent  asApplicationAt: 'researcher-profile').
apps add: (WAAdmin register: PublicProjectsListComponent asApplicationAt: 'project-list').
apps add: (WAAdmin register: ProjectReportComponent   asApplicationAt: 'project-profile').
apps add: (WAAdmin register: PublicThesisListComponent asApplicationAt: 'thesis-list').
apps add: (WAAdmin register: ThesisReportComponent asApplicationAt: 'thesis-profile').

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