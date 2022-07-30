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
apps add: ((WAAdmin register: MemoriasLandingComponent asApplicationAt: MemoriasLandingComponent relativeUrl) 
				sessionClass: MemoriasSession; 
				yourself). 
apps add: (WAAdmin register: ReportComponent  asApplicationAt: ReportComponent relativeUrl).
apps add: (WAAdmin register: ResearcherReportComponent  asApplicationAt: ResearcherReportComponent relativeUrl).
apps add: (WAAdmin register: PublicProjectsListComponent asApplicationAt: PublicProjectsListComponent relativeUrl).
apps add: (WAAdmin register: ProjectReportComponent asApplicationAt: ProjectReportComponent relativeUrl).
apps add: (WAAdmin register: PublicThesisListComponent asApplicationAt: PublicThesisListComponent relativeUrl).
apps add: (WAAdmin register: ThesisReportComponent asApplicationAt: ThesisReportComponent relativeUrl).

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

WAAdmin defaultDispatcher defaultName: MemoriasLandingComponent relativeUrl.

Transcript cr; show: 'Memorias starting  (dbhost: ', dbhost, ', db: ', db, ')'; cr; cr.