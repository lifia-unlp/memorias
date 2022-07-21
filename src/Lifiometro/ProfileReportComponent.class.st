Class {
	#name : #ProfileReportComponent,
	#superclass : #ReportComponent,
	#instVars : [
		'report'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #rendering }
ProfileReportComponent >> fetchReport [
	self subclassResponsibility
]

{ #category : #rendering }
ProfileReportComponent >> initialize [ 
	super initialize.
	report := self fetchReport.
]

{ #category : #rendering }
ProfileReportComponent >> renderContentOn: html [
	html div
		id: #page;
		with: [ self renderHeaderOn: html.
			report
				ifNil: [ ^ html
						render:
							'Por ahora no tengo información suficiente para generar el reporte. ¿Tal vez la URL no es correcta? ' ].
			self renderTitleOn: html.
			self renderPropertiesOn: html.
			self renderPublicationsOn: html.
			self renderProjectsOn: html.
			self renderScholarshipsOn: html.
			self renderThesisOn: html ]
]

{ #category : #rendering }
ProfileReportComponent >> renderHeaderOn: html [
	html image
		width: 149;
		url: LifiaFileLibrary / #logolifiaPng.
	html break
]

{ #category : #rendering }
ProfileReportComponent >> renderProject: project on: html [
	html
		paragraph: [ html anchor
				target: '_blank';
				url: '/' , (ProjectReportComponent relativeUrlFor: project);
				with: project title , '.'.
			html space.
			project fundingAgency
				ifNotEmpty: [ :it | html text: 'Financiado por ' , it , '. ' ].
			project director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			project coDirector
				ifNotEmpty: [ :it | html text: 'CoDirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , project startDate ddmmyyyy , '-'
						, project endDate ddmmyyyy ]
]

{ #category : #rendering }
ProfileReportComponent >> renderProjectsOn: html [
	html heading level2 with: 'Proyectos'.
	report projects do: [ :each | self renderProject: each on: html ]
]

{ #category : #rendering }
ProfileReportComponent >> renderPropertiesOn: html [
  self subclassResponsibility 
]

{ #category : #rendering }
ProfileReportComponent >> renderPublication: each on: html [
	^ html paragraph
		with: [ html text: each asSummary.
			each selfArchivingUrl
				ifNotNil: [ :url | 
					url
						ifNotEmpty: [ html space.
							html anchor
								url: url;
								target: '_new';
								with: [ html tbsGlyphIcon iconDownloadAlt ] ] ] ]
]

{ #category : #rendering }
ProfileReportComponent >> renderPublicationsOn: html [
	| publications |
	html heading level2 with: 'Publicaciones'.
	publications := OrderedCollection new
		add: 'Publicaciones en revistas' -> report articlePublications;
		add: 'Publicaciones en conferencias' -> report inproceedingsPublications;
		add: 'Libros' -> report bookPublications;
		add: 'Partes de libros' -> report inbookPublications;
		add: 'Otras publicaciones' -> report miscPublications;
		yourself.
	publications
		do: [ :ass | 
			ass value
				ifNotEmpty: [ html label with: ass key.
					ass value do: [ :each | self renderPublication: each on: html ] ] ]
]

{ #category : #rendering }
ProfileReportComponent >> renderResearchersOn: html [
	"This method is not used currently, should probably be deleted"
	html heading level2 with: 'Integrantes'.
	html
		unorderedList: [ report researchers
				do: [ :each | 
					html
						listItem: [ html anchor
								target: '_blank';
								url: '/' , (ResearcherReportComponent relativeUrlFor: each);
								with: 'each fullName' ] ] ]
]

{ #category : #rendering }
ProfileReportComponent >> renderScholarship: scholarship on: html [
	html
		paragraph: [ html text: scholarship student.
			html text: ' (' , scholarship type , '). '.
			html text: scholarship title , '. '.
			scholarship fundingAgency
				ifNotEmpty: [ :it | html text: 'Financiado por ' , it , '. ' ].
			scholarship director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			scholarship coDirector
				ifNotEmpty: [ :it | html text: 'Co-Dirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , scholarship startDate ddmmyyyy , '-'
						, scholarship endDate ddmmyyyy ]
]

{ #category : #rendering }
ProfileReportComponent >> renderScholarshipsOn: html [
	html heading level2 with: 'Becas y pasantías'.
	report scholarships
		do: [ :each | self renderScholarship: each on: html ]
]

{ #category : #rendering }
ProfileReportComponent >> renderThesis: thesis on: html [
	| trans level |
	trans := Dictionary new.
	trans
		at: 'Masters' put: 'Master';
		at: 'Specialization' put: 'Especialización';
		at: 'PhD' put: 'Doctorado';
		at: 'Undergraduate' put: 'Tesina de grado'.
	level := trans at: thesis level ifAbsent: [ thesis level ].
	html
		paragraph: [ html text: thesis student.
			html text: ' (' , level , '). '.
			html text: thesis title , '. '.
			thesis career ifNotEmpty: [ :it | html text: it , '. ' ].
			thesis director
				ifNotEmpty: [ :it | html text: 'Dirigido por ' , it , '. ' ].
			thesis coDirector
				ifNotEmpty: [ :it | html text: 'Co-Dirigido por ' , it , '. ' ].
			html
				text:
					'Duración: ' , thesis startDate ddmmyyyy , ' - '
						, (thesis endDate ifNil: [ 'en curso' ] ifNotNil: [ :it | it ddmmyyyy ]) ]
]

{ #category : #rendering }
ProfileReportComponent >> renderThesisOn: html [
	html heading level2 with: 'Tesis y trabajos finales de carrera'.
	^ report thesis do: [ :each | self renderThesis: each on: html ]
]

{ #category : #rendering }
ProfileReportComponent >> renderTitleOn: html [
	self subclassResponsibility 
]

{ #category : #rendering }
ProfileReportComponent >> style [
	^ '

body {
    font-family: "Libre Franklin",sans-serif;
    font-size: 1.5rem;
	 color: #404040;
    line-height: 1.75;
}

h1 { 
    font-weight: 400;
    font-size: 3.2rem;
    line-height: 1.25;
    font-style: normal;
}

h1, h2, label {
    font-family: "Libre Franklin",sans-serif;
    color: #004061;
}

h2 {
    font-size: 2.5rem;
}

#page {
    background: #fff;
    margin-left: auto;
    margin-right: auto;
    max-width: 1140px;
    padding: 3.0303%;
}

table tbody th, table td {
   border-bottom: solid 1px;
	font-size: .85em;
	padding: 8px;
}

'
]
