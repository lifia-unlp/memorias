Smalltalk vm maxExternalSemaphoresSilently: 1024.
"Install the app"
Metacello new
	baseline: 'Lifiometro';
	repository: 'github://lifia-unlp/memorias:migration-pharo10';
	onConflictUseLoaded;
	onWarningLog;
	load.
"Disable loading of preferences"	
PharoCommandLineHandler forcePreferencesOmission: true.
"Disable Epicea"
EpMonitor reset.
