Class {
	#name : #DoiImportComponent,
	#superclass : #BibtexChunckImportComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #accessing }
DoiImportComponent >> doi [
	^ doi
]

{ #category : #accessing }
DoiImportComponent >> doi: anObject [
	doi := anObject
]

{ #category : #callbacks }
DoiImportComponent >> fetch [

	[ bibtexEntry := DoiOrgAPI new get: 'https://doi.org/' , doi ]
		on: Error
		do: [ bibtexEntry := nil ].
	bibtexEntry ifNil: [
		^ error := 'No pude encontrar información para ese DOI. Es probable que todavía no haya sido publicado.' ].
	bibtexEntry := bibtexEntry cleanupLatexAccentsAndBraces
]

{ #category : #rendering }
DoiImportComponent >> renderFetchFormOn: html [
	html
		tbsForm: [ html
				tbsFormGroup: [ html label
						for: 'doi';
						with: 'DOI'.
					html textInput
						tbsFormControl;
						on: #doi of: self;
						id: 'doi';
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
						with: 'Obtener' ] ]
]
