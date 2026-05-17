Class {
	#name : #LinkedDataConfigurationComponent,
	#superclass : #WAComponent,
	#instVars : [
		'organizationName',
		'organizationUrl',
		'dataUrl'
	],
	#category : #'Lifiometro-Linked-Data'
}

{ #category : #callbacks }
LinkedDataConfigurationComponent >> accept [

	| configuration |
	configuration := LifiometroRepository singleton
		                 persistentConfiguration linkedDataConfiguration.
	configuration
		organizationName: organizationName;
		organizationUrl: organizationUrl;
		dataUrl: dataUrl.
	LifiometroRepository singleton persistentConfiguration save.
	self answer: nil.
]

{ #category : #callbacks }
LinkedDataConfigurationComponent >> cancel [

	self answer: nil
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> dataUrl [

	^ dataUrl
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> dataUrl: anObject [

	dataUrl := anObject
]

{ #category : #initialization }
LinkedDataConfigurationComponent >> initialize [

	| configuration |
	super initialize.

	configuration := LifiometroRepository singleton
		                 persistentConfiguration linkedDataConfiguration.

	organizationName := configuration organizationName.
	organizationUrl := configuration organizationUrl.
	dataUrl := configuration dataUrl
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> organizationName [

	^ organizationName
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> organizationName: anObject [

	organizationName := anObject
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> organizationUrl [

	^ organizationUrl
]

{ #category : #accessing }
LinkedDataConfigurationComponent >> organizationUrl: anObject [

	organizationUrl := anObject
]

{ #category : #rendering }
LinkedDataConfigurationComponent >> renderContentOn: html [

	html tbsForm: [
		html text: 'Organizacion: '.
		html textInput on: #organizationName of: self.
		html break.
		html text: 'Organizacion URL: '.
		html textInput on: #organizationUrl of: self.
		html break.

		html text: 'Data URL base: '.
		html textInput on: #dataUrl of: self.
		html break.

		html paragraph: [
			html tbsButton
				beDefault;
				callback: [ self cancel ];
				with: 'Cancel'.
			html space.
			html tbsButton
				bePrimary;
				callback: [ self accept ];
				with: 'Accept' ] ]
]
