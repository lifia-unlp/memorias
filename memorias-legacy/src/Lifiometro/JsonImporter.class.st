Class {
	#name : #JsonImporter,
	#superclass : #WAComponent,
	#instVars : [
		'importedDictionaries',
		'file'
	],
	#category : #'Lifiometro-Tools'
}

{ #category : #rendering }
JsonImporter >> loadFile [

	importedDictionaries := STONJSON fromString:
		                        file rawContents utf8Decoded.
	importedDictionaries := importedDictionaries select: [ :each |
		                        (each at: 'abstract') notEmpty ].
	self answer: importedDictionaries
]

{ #category : #rendering }
JsonImporter >> renderContentOn: html [

	html heading level2; with: 'Upload json file'.
	html form
		multipart;
		with: [
		 	html div: [
				html fileUpload
					callback: [ :f | file := f ].
				html space.
				html submitButton
					callback: [ self loadFile ];
					text: 'Load' ] ]
]
