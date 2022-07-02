| store |

"Install the app"
Metacello new
	baseline: 'Lifiometro';
	repository: 'github://lifia-unlp/memorias:main';
	onConflictUseLoaded;
	load.

"Disable loading of prefferences"	
PharoCommandLineHandler forcePreferencesOmission: true.

"Do some basic cleanUp"
Smalltalk cleanUp: true except: {} confirming: false.

"Remove all repositories from Monticello VCS"
MCRepositoryGroup allSubInstancesDo: [ :group | group repositories do: [ :repo | group removeRepository: repo ] ].

"Remove projects and credentials from Git VCS (Tested in Pharo 7)"
IceRepository registry removeAll.
store := IceCredentialStore current.
store allCredentials do: [ :each | each removeFrom: store ].

"Close all windows"
World closeAllWindowsDiscardingChanges.

"Disable deprecation warning"
Deprecation
	raiseWarning: false;
	showWarning: false.

"Enable the run without sources and changes files"
NoChangesLog install.
NoPharoFilesOpener install.

"Disable Monticello cache"
MCCacheRepository uniqueInstance disable. 

"Disable Epicea"
EpMonitor reset.

"Garbage collect"
5 timesRepeat: [ Smalltalk garbageCollect ].

"Server mode for Seaside"
WorldState serverMode: true.



