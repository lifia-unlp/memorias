| app |
(VOMongoRepository 
    host: 'localhost' database: 'memorias' username: 'memoriasadm' password: '1234')
	enableSingleton.
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