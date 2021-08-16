
| app dbhost db dbuser dbpassword |

dbhost := OSEnvironment current at: 'DB-HOST' ifAbsent: 'localhost'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB-USER' ifAbsent: nil.
db := OSEnvironment current at: 'DB-PASSWORD' ifAbsent: nil.

dbuser
	ifNil: [ (VOMongoRepository
			host: dbhost
			database: db]
	ifNotNil: [ (VOMongoRepository
			host: dbhost
			database: db
			username: dbuser
			password: dbpassword) enableSingleton ].

WAAdmin defaultServerManager adaptors
        do: [ :each | WAAdmin defaultServerManager unregister: each ].
ZnZincServerAdaptor startOn: 8000.

WAAdmin applicationDefaults
	removeParent: WADevelopmentConfiguration instance.

DoiToBibAPI ensureBibtexMimeTypeIsNotBinary.
ChronologyConstants useSpanishMonthNames.

app := WAAdmin register: MemoriasLandingComponent asApplicationAt: 'lifia'.
WAAdmin applicationDefaults
	removeParent: WADevelopmentConfiguration instance.
WAAdmin defaultDispatcher defaultName: 'lifia'.
app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary;
	addLibrary: TBSJasnyDeploymentLibrary;
	addLibrary: TBSVerticalTabsDeploymentLibrary;
	addLibrary: LifiaFileLibrary;
	sessionClass: MemoriasSession;
	exceptionHandler: LifiometroEmailErrorHandler.

app := WAAdmin register: ReportComponent  asApplicationAt: 'memoria-publica'.
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

