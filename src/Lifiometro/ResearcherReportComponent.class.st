"
| app |
app := WAAdmin register: ResearcherReportComponent asApplicationAt: 'researcher-profile'.
app
        addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #ResearcherReportComponent,
	#superclass : #ProfileReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
ResearcherReportComponent class >> relativeUrl [
	^ 'researcher-profile'
]

{ #category : #urls }
ResearcherReportComponent class >> relativeUrlFor: aResearcher [
	^ self relativeUrl, '?vid=' , aResearcher voyageId printString
]

{ #category : #rendering }
ResearcherReportComponent >> fetchReport [

	| void researcher |
	void := self requestContext request at: 'vid'.
	void ifNil: [ ^ nil ].
	researcher := LifiometroRepository singleton researcherWithVoyageId:
		           void.
	researcher ifNil: [ ^ nil ].
	researcher trashed ifTrue: [ ^ nil ].
	^ LifiometroRepository singleton reportForResearcher: researcher
]

{ #category : #rendering }
ResearcherReportComponent >> renderExternalLinksOn: html [
	report researcher orcid 
		ifNotNilNotEmpty: [ :it | 
			html strong: 'ORCID: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher webPage
		ifNotNilNotEmpty: [ :it | 
			html strong: 'Página web: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher researchGateProfile
		ifNotNilNotEmpty: [ :it | 
			html strong: 'Perfil en Research Gate: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher googleResearchProfile
		ifNotNilNotEmpty: [ :it | 
			html strong: 'Perfil en Google Scholar: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher dblpProfile
		ifNotNilNotEmpty: [ :it | 
			html strong: 'Perfil en DBLP: '.
			html space.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	html break
]

{ #category : #rendering }
ResearcherReportComponent >> renderPropertiesOn: html [

	html image
		style: 'margin: 20px;';
		url: (report researcher avatarUrl isEmptyOrNil
				 ifTrue: [ LifiaFileLibrary / #annonymousavatarPng ]
				 ifFalse: [ report researcher avatarUrl ]);
		width: 120.
	html paragraph: [
		html
			strong: 'Apellido, nombre: ';
			text:
				report researcher lastName , ', ' , report researcher firstName;
			break.
		report researcher startDate ifNotNil: [ :it |
			html
				strong: 'Ingreso al LIFIA: ';
				text: it mmddyyyy;
				break ].
		report researcher endDate ifNotNil: [ :it |
			html
				strong: 'Egreso: ';
				text: it mmddyyyy;
				break ].
		report researcher highestDegree ifNotNilNotEmpty: [ :it |
			html
				strong: 'Título máximo: ';
				text: it;
				break ].
		report researcher institutionalEmail ifNotNilNotEmpty: [ :it |
			html
				strong: 'E-mail: ';
				text: it;
				break ].
		report researcher affiliations ifNotNilNotEmpty: [ :it |
			html
				strong: 'Otras afiliaciones: ';
				text: it;
				break ].
		report researcher positionAtUnlp ifNotNilNotEmpty: [ :it |
			it ~= 'N/A' ifTrue: [
				html
					strong: 'Cargo en UNLP: ';
					text: it;
					break ] ].
		report researcher positionAtCONICET ifNotNilNotEmpty: [ :it |
			it ~= 'N/A' ifTrue: [
				html
					strong: 'Cargo en CONICET: ';
					text: it;
					break ] ].

		report researcher positionAtCIC ifNotNilNotEmpty: [ :it |
			it ~= 'N/A' ifTrue: [
				html
					strong: 'Cargo en CICPBA: ';
					text: it;
					break ] ].

		report researcher category ifNotNilNotEmpty: [ :it |
			html
				strong: 'Categoría en el programa de incentivos: ';
				text: it;
				break ].
		report researcher sicadiCategory ifNotNilNotEmpty: [ :it |
			html
				strong: 'Categoría en SICADI-UNLP: ';
				text: it;
				break ].

		self renderExternalLinksOn: html.
		report researcher shortCvInSpanish ifNotNilNotEmpty: [ :it |
			html
				text: it;
				break ] ]
]

{ #category : #rendering }
ResearcherReportComponent >> renderResearchersOn: html [
	^ self
]

{ #category : #rendering }
ResearcherReportComponent >> renderTitleOn: html [
	html heading level1 with: report researcher fullName
]

{ #category : #rendering }
ResearcherReportComponent >> style [

	^ super style , '
	
strong {
       color: #004061;
}'
]

{ #category : #rendering }
ResearcherReportComponent >> titleForScholarshipsSection [

	^ 'Becas, pasantías y estancias'
]

{ #category : #rendering }
ResearcherReportComponent >> titleForThesisSection [

	^ 'Tesis y trabajos finales de carrera'
]
