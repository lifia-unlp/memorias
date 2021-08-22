| app dbhost db dbuser dbpassword smtpServer |

dbhost := OSEnvironment current at: 'DB_HOST' ifAbsent: 'mongodb'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB_USER' ifAbsent: nil.
dbpassword := OSEnvironment current at: 'DB_PASSWORD' ifAbsent: nil.
smtpServer := OSEnvironment current at: 'SMTP' ifAbsent: 'localhost'.

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

app := WAAdmin register: MemoriasLandingComponent asApplicationAt: 'memorias'.
WAAdmin applicationDefaults
	removeParent: WADevelopmentConfiguration instance.
WAAdmin defaultDispatcher defaultName: 'memorias'.
app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary;
	addLibrary: TBSJasnyDeploymentLibrary;
	addLibrary: TBSVerticalTabsDeploymentLibrary;
	addLibrary: LifiaFileLibrary;
	sessionClass: MemoriasSession;
	exceptionHandler: LifiometroEmailErrorHandler.

app := WAAdmin register: ReportComponent  asApplicationAt: 'center-profile'.
app
	addLibrary: TBSDeploymentLibrary;
	exceptionHandler: LifiometroEmailErrorHandler.

app := WAAdmin register: ResearcherReportComponent  asApplicationAt: 'researcher-profile'.
app
        addLibrary: TBSDeploymentLibrary;
        exceptionHandler: LifiometroEmailErrorHandler.
	
app := WAAdmin register: ProjectReportComponent   asApplicationAt: 'project-profile'.
app
        addLibrary: TBSDeploymentLibrary;
        exceptionHandler: LifiometroEmailErrorHandler.

Transcript cr; show: 'Memorias starting  (dbhost: ', dbhost, ', db: ', db, ')'; cr; cr.