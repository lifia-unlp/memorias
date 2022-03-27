"
| app |
app := WAAdmin register: ReportComponent asApplicationAt: 'memoria-publica'.
app
        addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #ReportComponent,
	#superclass : #PublicReportComponent,
	#instVars : [
		'older',
		'article',
		'inbook',
		'book',
		'inproceedings',
		'undergraduate',
		'masters',
		'pdh',
		'projects',
		'scholarships',
		'selectedYears',
		'specialization',
		'report',
		'lastSevenYearsSelectors'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
ReportComponent class >> relativeUrl [
	^ 'center-profile'
]

{ #category : #initialization }
ReportComponent >> initialize [
   super initialize.
	older := false.
	lastSevenYearsSelectors := {true . true . false . false . false . false. false}.
	article := true.
	inbook := true.
	book := true.
	inproceedings := true.
	undergraduate := true.
	masters := true.
	pdh := true.
	projects := true.
	scholarships := true.
	self update
]

{ #category : #'rendering-form' }
ReportComponent >> renderActivitySelectorsOn: html [
	html
		tbsFormGroup: [ html
				label: 'Actividades a incluir';
				break.
			html checkbox
				value: pdh;
				callback: [ :value | pdh := value ].
			html space.
			html
				text: 'Alumnos doctorales';
				break.
			html checkbox
				value: masters;
				callback: [ :value | masters := value ].
			html space.
			html
				text: 'Alumnos de maestría (tesis)';
				break.
			html checkbox
				value: undergraduate;
				callback: [ :value | undergraduate := value ].
			html space.
			html
				text: 'Alumnos de especialización (trabajo final)';
				break.
			html checkbox
				value: undergraduate;
				callback: [ :value | specialization := value ].
			html space.
			html
				text: 'Alumnos de grado (tesina)';
				break.
			html checkbox
				value: scholarships;
				callback: [ :value | scholarships := value ].
			html space.
			html
				text: 'Becas';
				break.
			html checkbox
				value: projects;
				callback: [ :value | projects := value ].
			html space.
			html
				text: 'Proyectos';
				break.]
]

{ #category : #'rendering-form' }
ReportComponent >> renderArticleTypeSelectorsOn: html [
	html
		tbsFormGroup: [ html
				label: 'Publicaciones a incluir';
				break.
			html checkbox
				value: article;
				callback: [ :value | article := value ].
			html space.
			html
				text: 'Artículos de revista';
				break.
			html checkbox
				value: inproceedings;
				callback: [ :value | inproceedings := value ].
			html space.
			html
				text: 'Artículos de conferencias ';
				break.
			html checkbox
				value: inbook;
				callback: [ :value | inbook := value ].
			html space.
			html
				text: 'Capítulos de libro';
				break.
			html checkbox
				value: book;
				callback: [ :value | book := value ].
			html space.
			html
				text: 'Libros';
				break ]
]

{ #category : #rendering }
ReportComponent >> renderContentOn: html [
	html div
		id: 'page';
		with: [ self renderReportHeaderOn: html.
			self renderFormOn: html.
			html horizontalRule.
			self renderIndexOn: html.
			self renderReportOn: html ]
]

{ #category : #'rendering-publications' }
ReportComponent >> renderDownloadIconFor: each on: html [
	each selfArchivingUrl
		ifNotNil: [ :url | 
			url
				ifNotEmpty: [ html space.
					html anchor
						url: url;
						target: '_new';
						with: [ html tbsGlyphIcon iconDownloadAlt ] ] ]
]

{ #category : #'rendering-form' }
ReportComponent >> renderFormOn: html [
	html
		tbsForm: [ html
				tbsRow: [ html tbsColumn: [ self renderYearSelectorsOn: html ] mediumSize: 4.
					html tbsColumn: [ self renderArticleTypeSelectorsOn: html ] mediumSize: 4.
					html tbsColumn: [ self renderActivitySelectorsOn: html ] mediumSize: 4 ].
			html
				tbsRow: [ html
						tbsColumn: [ html tbsButton
								beDefault;
								callback: [ self update ];
								beSmall;
								with: 'Filtrar' ]
						mediumSize: 4 ] ]
]

{ #category : #'rendering-researchers' }
ReportComponent >> renderGraduateStudentsOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Estudiante de posgrado' ])
		heading: 'Estudiantes de posgrado'
		on: html
]

{ #category : #rendering }
ReportComponent >> renderIndexOn: html [
	html heading
		level1;
		with: 'Indice'.
	html
		unorderedList: [ html
				listItem: [ html anchor
						url: '#publications';
						with: 'Publicaciones' ].
			html unorderedList: [ self renderPublicationsIndexOn: html ].
			html
				listItem: [ html anchor
						url: '#thesis';
						with: 'Dirección de tesis y trabajos finales.' ].
			html unorderedList: [ self renderThesisIndexOn: html ].
			html
				listItem: [ html anchor
						url: '#scholarships';
						with: 'Becarios' ].
			html
				listItem: [ html anchor
						url: '#projects';
						with: 'Projectos' ].
			html
				listItem: [ html anchor
						url: '#researchers';
						with: 'Participantes' ] ]
]

{ #category : #'rendering-researchers' }
ReportComponent >> renderMembers: aCollection heading: aHeading on: html [
	projects
		ifFalse: [ ^ self ].
	html heading
		level2;
		with: aHeading .
	html
		tbsTable: [ html
				tableHead: [ html
						tableHeading: 'Nombre';
						tableHeading: 'Ingreso';
						tableHeading: 'Egreso';
						tableHeading: 'Memoria técnica' ].
			html
				tableBody: [ (aCollection 
						asSortedCollection: [ :a :b | a fullName < b fullName ])
						do: [ :each | self renderResearcher: each on: html ] ] ]
]

{ #category : #'rendering-researchers' }
ReportComponent >> renderOtherMembersOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA isNil ])
		heading: 'Asistente de investigación'
		on: html
]

{ #category : #'rendering-projects' }
ReportComponent >> renderProject: each on: html [
	html paragraph
		style: 'padding:10px;';
		with: [ html
				text: each title;
				break.
			html
				text: 'Código: ' , each code;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Grupo responsable: ' , each responsibleGroup;
				break.
			html
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Monto: ' , each amount;
				break.
			html
				text: 'Resumen: ' , each summary;
				break.
			html anchor
				target: '_blank';
				url: '/' , (ProjectReportComponent relativeUrlFor: each);
				with: 'Mas detalles' ]
]

{ #category : #'rendering-projects' }
ReportComponent >> renderProjectsReportOn: html [
	projects
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'projects';
		with: 'Proyectos'.
	self report projects
		do: [ :each | self renderProject: each on: html ]
]

{ #category : #'rendering-publications' }
ReportComponent >> renderPublication: each on: html [
	html text: each asReference.
	self renderDownloadIconFor: each on: html
]

{ #category : #'rendering-publications' }
ReportComponent >> renderPublicationsIn: aCollection on: html [
	(aCollection asSortedCollection: [ :a :b | a year > b year ] )
		do: [ :each | 
			html paragraph
				style: 'padding-left:5px;';
				with: [ self renderPublication: each on: html ] ]
]

{ #category : #rendering }
ReportComponent >> renderPublicationsIndexOn: html [
	html
		listItem: [ html anchor
				url: '#article';
				with: 'Publicaciones en revistas' ].
	html
		listItem: [ html anchor
				url: '#inproceedings';
				with: 'Publicaciones en conferencias' ].
	html
		listItem: [ html anchor
				url: '#inbook';
				with: 'Capítulos de libros' ].
	html
		listItem: [ html anchor
				url: '#book';
				with: 'Libros' ]
]

{ #category : #'rendering-publications' }
ReportComponent >> renderPublicationsReportOn: html [
	article | inbook | inproceedings | book
		ifTrue: [ html heading
				level1;
				id: 'publications';
				with: 'Publicaciones' ].
	article
		ifTrue: [ | articles |
			articles := self report articlePublications.
			html heading
				level2;
				id: 'article';
				with: 'Articulos de revista (' , articles size greaseString , ')'.
			self renderPublicationsIn: articles on: html ].
	inproceedings
		ifTrue: [ | articles |
			articles := self report inproceedingsPublications.
			html heading
				level2;
				id: 'inproceedings';
				with: 'Articulos de conferencia (' , articles size greaseString , ')'.
			self renderPublicationsIn: articles on: html ].
	inbook
		ifTrue: [ | articles |
			articles := self report inbookPublications.
			html heading
				level2;
				id: 'inbook';
				with: 'Capítulos de libro (' , articles size greaseString , ')'.
			self renderPublicationsIn: articles on: html ].
	book
		ifTrue: [ | articles |
			articles := self report bookPublications.
			html heading
				level2;
				id: 'book';
				with: 'Libros (' , articles size greaseString , ')'.
			self renderPublicationsIn: articles on: html ]
]

{ #category : #rendering }
ReportComponent >> renderReportHeaderOn: html [
	html image
		width: 149;
		url: LifiaFileLibrary / #logolifiaPng.
	html heading with: 'Memoria técnica de investigación'.
	html
		paragraph:
			'Por medio de esta página interactiva podrá conocer las actividades, resultados, y personal involucrado en las actividades de investigación del LIFIA.'.
	html
		paragraph:
			'Utilice los filtros que se ofrecen a continuación para refinar su consulta.'
]

{ #category : #rendering }
ReportComponent >> renderReportOn: html [
	self
		renderPublicationsReportOn: html;
		renderThesisReportOn: html;
		renderScholarshipReportOn: html;
		renderProjectsReportOn: html.
	html heading
		level1;
		id: 'researchers';
		with: 'Participantes'.
	self
		renderResearchersOn: html;
		renderOtherMembersOn: html;
		renderGraduateStudentsOn: html;
		renderUndergraduateStudentsOn: html

]

{ #category : #'rendering-researchers' }
ReportComponent >> renderResearcher: each on: html [
	html
		tableRow: [ html
				tableData: each fullName;
				tableData: [ each startDate ifNotNil: [ :it | html text: it ddmmyyyy ] ];
				tableData: [ each endDate
						ifNotNil: [ :it | html text: it ddmmyyyy ]
						ifNil: [ html text: '-' ] ];
				tableData: [ html anchor
						target: '_blank';
						url: '/' , (ResearcherReportComponent relativeUrlFor: each);
						with: 'Mas detalles' ] ]
]

{ #category : #'rendering-researchers' }
ReportComponent >> renderResearchersOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Investigador' ])
		heading: 'Investigadores'
		on: html
]

{ #category : #'rendering-scholarhips' }
ReportComponent >> renderScholarship: each on: html [
	html paragraph
		style: 'padding: 10px;';
		with: [ html
				text: 'Alumno: ' , each student;
				break.
			html
				text:
					'Fechas: ' , each startDate asDate printString , ' - '
						, each endDate asDate printString;
				break.
			html
				text: 'Título: ' , each title;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Financiador: ' , each fundingAgency;
				break.
			html
				text: 'Tipo de beca: ' , each type;
				break.
			html
				text: 'Resumen: ' , each summary;
				break ]
]

{ #category : #'rendering-scholarhips' }
ReportComponent >> renderScholarshipReportOn: html [
	scholarships
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becarios'.
	report scholarships
		do: [ :each | self renderScholarship: each on: html ]
]

{ #category : #'rendering-thesis' }
ReportComponent >> renderThesis: each on: html [
	| endDate |
	endDate := each endDate
		ifNil: [ '' ]
		ifNotNil: [ :it | each endDate asDate printString ].
	html paragraph
		style: 'padding:5px;';
		with: [ html text: 'Título: ' , each title.
			self renderDownloadIconFor: each on: html.
			html break.
			html
				text: 'Alumno(s): ' , each student;
				break.
			html
				text: 'Fechas: ' , each startDate asDate printString , ' - ' , endDate;
				break.
			html
				text: 'Director(es): ' , each director;
				break.
			html
				text: 'Co-Director(es): ' , each coDirector;
				break.
			html
				text: 'Carrera: ' , each career;
				break.
			html
				text: 'Resumen: ' , each summary;
				break ]
]

{ #category : #rendering }
ReportComponent >> renderThesisIndexOn: html [
	html
		listItem: [ html anchor
				url: '#phd';
				with: 'Doctorado' ].
	html
		listItem: [ html anchor
				url: '#masters';
				with: 'Maestría (tesis)' ].
	html
		listItem: [ html anchor
				url: '#specialization';
				with: 'Especialización (trabajo final)' ].
	html
		listItem: [ html anchor
				url: '#undergraduate';
				with: 'Grado (tesina)' ]
]

{ #category : #'rendering-thesis' }
ReportComponent >> renderThesisReportOn: html [
	undergraduate | masters | pdh
		ifTrue: [ html heading
				level1;
				id: 'thesis';
				with: 'Dirección de tesis y trabajos finales' ].
	pdh
		ifTrue: [ html heading
				level2;
				id: 'phd';
				with: 'Doctorado'.
			report phdThesis do: [ :each | self renderThesis: each on: html ] ].
	masters
		ifTrue: [ html heading
				level2;
				id: 'masters';
				with: 'Maestría (tesis)'.
			report mastersThesis
				do: [ :each | self renderThesis: each on: html ] ].
	masters
		ifTrue: [ html heading
				level2;
				id: 'specialization';
				with: 'Especialización (trabajo final)'.
			report specializationThesis
				do: [ :each | self renderThesis: each on: html ] ].
	undergraduate
		ifTrue: [ html heading
				level2;
				id: 'undergraduate';
				with: 'Grado (tesina)'.
			report undergraduateThesis
				do: [ :each | self renderThesis: each on: html ] ]
]

{ #category : #'rendering-researchers' }
ReportComponent >> renderUndergraduateStudentsOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Estudiante de grado' ])
		heading: 'Estudiantes de grado'
		on: html
]

{ #category : #'rendering-form' }
ReportComponent >> renderYearSelectorsOn: html [
	^ html
		tbsFormGroup: [ html
				label: 'Años a incluir';
				break.
			0 to: 6 do: [ :i | 
				html checkbox
					value: (lastSevenYearsSelectors at: i + 1);
					callback: [ :value | lastSevenYearsSelectors at: i + 1 put: value ].
				html space.
				html text: (Date today year - i) printString.
				html break ].
			html checkbox
				value: older;
				callback: [ :value | older := value ].
			html space.
			html
				text: 'Anteriores';
				break ]
]

{ #category : #report }
ReportComponent >> report [
	| selectedYearsAsNumbers |
	selectedYearsAsNumbers := selectedYears collect: #asNumber.
	(report notNil
		and: [ report years asSet = selectedYearsAsNumbers asSet ])
		ifTrue: [ ^ report ].
	report := LifiometroRepository singleton
		reportForYears: selectedYearsAsNumbers.
	^ report
]

{ #category : #utility }
ReportComponent >> selectActiveItemsFrom: aCollection [
	| yearsAsNumbers |
	yearsAsNumbers := selectedYears collect: #asNumber.
	^ aCollection
		select:
			[ :each | each yearsActive anySatisfy: [ :year | yearsAsNumbers includes: year ] ]
]

{ #category : #rendering }
ReportComponent >> style [
	^ '

body {
    font-family: "Libre Franklin",sans-serif;
    font-size: 1.5rem;
	 color: #404040;
    line-height: 1.5;
}

h1, h2 {
    color: #004061;
}

h2 {
    font-size: 2.5rem;
}

h1 {
    font-size: 3.2rem;
}

#page {
    background: #fff;
    margin-left: auto;
    margin-right: auto;
    max-width: 1140px;
    padding: 3.0303%;
}

'
]

{ #category : #callbacks }
ReportComponent >> update [
	selectedYears := Set new.
	Date today year - (0 to: 6)
		with: lastSevenYearsSelectors
		do: [ :a :b | 
			b
				ifTrue: [ selectedYears add: a printString ] ].
	older
		ifTrue: [ selectedYears
				addAll: ((2000 to: Date today year - 7) collect: #printString) ]
]

{ #category : #callbacks }
ReportComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: 'Memorias - LIFIA'
]
