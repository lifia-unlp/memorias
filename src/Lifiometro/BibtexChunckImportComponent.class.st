Class {
	#name : #BibtexChunckImportComponent,
	#superclass : #WAComponent,
	#instVars : [
		'doi',
		'bibtexEntry',
		'error',
		'newType'
	],
	#category : 'Lifiometro-Web'
}

{ #category : #callbacks }
BibtexChunckImportComponent >> accept [
	bibtexEntry type = 'incollection' & newType isNil
		ifTrue: [ ^ error := 'Seleccione otro tipo en remplazo de incollection' ].
	newType notNil
		ifTrue: [ bibtexEntry type: newType ].
	self
		answer: (BibtexReference bibtexEntry: bibtexEntry) cleanupWeirdLatexAccents
]

{ #category : #accessing }
BibtexChunckImportComponent >> bibtexEtry [
	^ bibtexEntry
]

{ #category : #accessing }
BibtexChunckImportComponent >> bibtexEtry: anObject [
	bibtexEntry := anObject
]

{ #category : #testing }
BibtexChunckImportComponent >> canImport [
	^ self types keys includes: bibtexEntry type
]

{ #category : #callbacks }
BibtexChunckImportComponent >> cancel [ 
	self answer: nil
]

{ #category : #testing }
BibtexChunckImportComponent >> checkForErrors [
	| year |
	bibtexEntry ifNil: [ ^ self ].
	self canImport
		ifFalse: [ error := 'No es posible importar referencias del tipo '
				, bibtexEntry type ].
	[ year := bibtexEntry year asNumber ]
		on: Error
		do: [ year := nil ].
	year
		ifNil:
			[ error := 'El registro debe incluir la propiedad ''year'' con un valor válido en formato de 4 dígitos ' ]
]

{ #category : #callbacks }
BibtexChunckImportComponent >> fetch [
]

{ #category : #callbacks }
BibtexChunckImportComponent >> parse: aBibtexString [
   error := nil.
	bibtexEntry := PPBibtexParser new end parse: aBibtexString.
	bibtexEntry isPetitFailure
		ifTrue: [ error := 'No puedo obtener una entrada válida: ' , bibtexEntry message
				, ' at ' , bibtexEntry position printString.
			bibtexEntry := nil.
			^ self ].
	bibtexEntry isEmpty
		ifTrue: [ bibtexEntry := nil.
			error := 'No puero obtener una entrada válida.'.
			^ self ].
	bibtexEntry := bibtexEntry first
]

{ #category : #rendering }
BibtexChunckImportComponent >> renderBibtexEntryOn: html [
	html
		preformatted: [ html
				text: '@';
				text: bibtexEntry type;
				text: '{';
				text: bibtexEntry citationKey;
				text: ',';
				break.
			bibtexEntry tags
				do: [ :tag | 
					html space.
					html
						text: tag name;
						text: ' = {';
						text: tag value;
						text: '},';
						break ].
			html text: '}' ]
]

{ #category : #rendering }
BibtexChunckImportComponent >> renderButtonsOn: html [
	html
		paragraph: [ html tbsButton
				beDefault;
				callback: [ self cancel ];
				with: 'Cancelar'.
			error ifNil: [ html space.
					html tbsButton
						bePrimary;
						callback: [ self accept ];
						with: 'Aceptar' ] ]
]

{ #category : #rendering }
BibtexChunckImportComponent >> renderContentOn: html [
	html tbsPanel
		with: [ html
				tbsPanelBody: [ self checkForErrors.
					bibtexEntry
						ifNil: [ self renderFetchFormOn: html ]
						ifNotNil: [ html
								tbsForm: [ self renderBibtexEntryOn: html.
									bibtexEntry type = 'incollection'
										ifTrue: [ self renderIncollectionDesambiguationOn: html ].
									self renderButtonsOn: html ] ].
					error
						ifNotNil: [ html tbsAlert
								beDanger;
								with: error ].
					error := nil ] ]
]

{ #category : #rendering }
BibtexChunckImportComponent >> renderFetchFormOn: html [
	html
		tbsForm: [ html
				tbsFormGroup: [ html label
						for: 'bibtex';
						with: 'Bibtex'.
					html textArea
						tbsFormControl;
						rows: 10;
						callback: [ :value | self parse: value ];
						with: '';
						id: 'bibtex';
						placeholder: '10.1430/8105 '.
					html break.
					html tbsButton
						beDefault;
						callback: [ self answer: nil ];
						with: 'Cancelar'.
					html space.
					html tbsButton
						bePrimary;
						callback: [ self fetch ];
						with: 'Procesar' ] ]
]

{ #category : #rendering }
BibtexChunckImportComponent >> renderIncollectionDesambiguationOn: html [
	html
		tbsFormGroup: [ html label
				for: 'type';
				with: 'Nuevo tipo'.
			html
				paragraph: [ html
						small: '"incollection" es un tipo ambiguo, seleccione uno de los siguientes.' ].
			html radioGroup
				callback: [ :value | newType := value ];
				selected: 'inbook';
				with: [ :group | 
					group radioButton value: 'inproceedings'.
					html
						space;
						text: 'Articulo de conferencia (inproceedings)';
						break.
					group radioButton value: 'inbook'.
					html
						space;
						text: 'Capítulo de libro (inbook)';
						break ] ]
]

{ #category : #callbacks }
BibtexChunckImportComponent >> types [
	^ Dictionary new
		at: 'inproceedings' put: 'Artículo de revista';
		at: 'article' put: 'Artículo de revista';
		at: 'book' put: 'Libro';
		at: 'inbook' put: 'Parte de libro';
		at: 'incollection' put: 'Parte de libro';
		yourself
]
