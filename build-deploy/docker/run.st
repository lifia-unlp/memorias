| app dbhost db dbuser dbpassword smtpServer |

dbhost := OSEnvironment current at: 'DB-HOST' ifAbsent: 'mongodb'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB-USER' ifAbsent: nil.
dbpassword := OSEnvironment current at: 'DB-PASSWORD' ifAbsent: nil.
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

app := WAAdmin register: MemoriasLandingComponent asApplicationAt: 'memorias'. 
smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
WAAdmin defaultDispatcher defaultName: 'memorias'.
app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary;
	addLibrary: TBSJasnyDeploymentLibrary;
	addLibrary: TBSVerticalTabsDeploymentLibrary;
	addLibrary: LifiaFileLibrary;
	sessionClass: MemoriasSession.	

app := WAAdmin register: ReportComponent  asApplicationAt: 'center-profile'.
smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
app 	addLibrary: TBSDeploymentLibrary.

app := WAAdmin register: ResearcherReportComponent  asApplicationAt: 'researcher-profile'.
smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
app addLibrary: TBSDeploymentLibrary.
	
app := WAAdmin register: ProjectReportComponent   asApplicationAt: 'project-profile'.
smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
app addLibrary: TBSDeploymentLibrary.

app := WAAdmin register: PublicProjectsListComponent asApplicationAt: 'project-list'.
smtpServer ifNotNil: [ app	
	exceptionHandler: LifiometroEmailErrorHandler].
app addLibrary: TBSDeploymentLibrary.

Transcript cr; show: 'Memorias starting  (dbhost: ', dbhost, ', db: ', db, ')'; cr; cr.