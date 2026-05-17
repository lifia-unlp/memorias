"
(VOMongoRepository host: 'localhost' database: 'lifiometro')
	enableSingleton.
	

VOMemoryRepository new enableSingleton 
"
Class {
	#name : #ManifestLifiometro,
	#superclass : #PackageManifest,
	#category : 'Lifiometro-Manifest'
}
