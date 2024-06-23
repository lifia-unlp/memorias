| apps dbhost db dbuser dbpassword adminEmail mailedSendApiKey debug |

debug := (OSEnvironment current at: 'DEBUG' ifAbsent: 'false') = 'true'.
dbhost := OSEnvironment current at: 'DB_HOST' ifAbsent: 'mongodb'.
db := OSEnvironment current at: 'DB' ifAbsent: 'lifiometro'.
dbuser := OSEnvironment current at: 'DB_USER' ifAbsent: nil.
dbpassword := OSEnvironment current at: 'DB_PASSWORD' ifAbsent: nil.
mailedSendApiKey := OSEnvironment current at: 'MAILERSEND_APIKEY' ifAbsent: nil.
adminEmail := OSEnvironment current at: 'ADMIN_EMAIL' ifAbsent: nil.

MailerSendAPI singleton apiKey: mailedSendApiKey .
MailerSendAPI singleton adminEmail: adminEmail .

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
apps add: ((WAAdmin register: ReportComponent asApplicationAt: ReportComponent relativeUrl)
				sessionClass: MemoriasSession; 
				yourself). 
apps add: (WAAdmin register: ResearcherReportComponent  asApplicationAt: ResearcherReportComponent relativeUrl).
apps add: (WAAdmin register: PublicProjectsListComponent asApplicationAt: PublicProjectsListComponent relativeUrl).
apps add: (WAAdmin register: ProjectReportComponent asApplicationAt: ProjectReportComponent relativeUrl).
apps add: (WAAdmin register: PublicThesisListComponent asApplicationAt: PublicThesisListComponent relativeUrl).
apps add: (WAAdmin register: ThesisReportComponent asApplicationAt: ThesisReportComponent relativeUrl).

apps do: [:app | 
 MailerSendAPI singleton isProperlyConfigured ifTrue: [ app	
	exceptionHandler: MemoriasEmailErrorHandler].
 app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary;
	addLibrary: TBSJasnyDeploymentLibrary;
	addLibrary: TBSVerticalTabsDeploymentLibrary;
	addLibrary: LifiaFileLibrary.	
].

WAAdmin defaultDispatcher defaultName: MemoriasLandingComponent relativeUrl.

"Temporary hack to update the database; remove in the next release"
RepositoryAuditRecord selectAll do: [:each | each action: each action asString; save ].

Transcript cr; show: 'Memorias starting  (dbhost: ', dbhost, ', db: ', db, ')'; cr; cr.
