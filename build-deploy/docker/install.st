"Install the app"
Metacello new
	baseline: 'Lifiometro';
	repository: 'github://lifia-unlp/memorias:main';
	onConflictUseLoaded;
	load.
"Disable loading of preferences"	
PharoCommandLineHandler forcePreferencesOmission: true.
"Disable Epicea"
EpMonitor reset.