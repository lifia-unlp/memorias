"
| app |
app := WAAdmin register: ReportComponent asApplicationAt: 'memoria-publica'.
app
        addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #CenterReportComponent,
	#superclass : #PublicReportComponent,
	#instVars : [
		'older',
		'article',
		'inbook',
		'book',
		'inproceedings',
		'selectedYears',
		'report',
		'lastSevenYearsSelectors',
		'publicationsPlot',
		'thesisPlot',
		'activeProjects',
		'finishedProjects',
		'activeScholarships',
		'finishedScholarships',
		'activePhdThesis',
		'activeSpecializationThesis',
		'activeUndergraduateThesis',
		'activeMastersThesis',
		'finishedUndergraduateThesis',
		'finishedMastersThesis',
		'finishedPhdThesis',
		'finishedSpecializationThesis'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
CenterReportComponent class >> relativeUrl [
	^ 'center-profile'
]

{ #category : #hooks }
CenterReportComponent >> children [

	^ {publicationsPlot}
]

{ #category : #initialization }
CenterReportComponent >> initialize [

	super initialize.
	older := false.
	lastSevenYearsSelectors := { true. true. true. true. true. true. true }.
	article := true.
	inbook := true.
	book := true.
	inproceedings := true.
	activeUndergraduateThesis := true.
	finishedUndergraduateThesis := true.
	activeSpecializationThesis := true.
	finishedSpecializationThesis := true.
	activeMastersThesis := true.
	finishedMastersThesis := true.
	activePhdThesis := true.
	finishedPhdThesis := true.
	activeProjects := true.
	finishedProjects := true.
	activeScholarships := true.
	finishedScholarships := true.
	publicationsPlot := YearlyEvolutionPlotSubcomponent new.
	publicationsPlot title: 'Evolución de las publicaciones'.
	thesisPlot := YearlyEvolutionPlotSubcomponent new.
	thesisPlot title: 'Evolución de las tesis y tesinas concluidas'.
	self update
]

{ #category : #rendering }
CenterReportComponent >> render: anAspect of: anObject labeled: aLabel on: html [

	(anObject perform: anAspect) ifNotNilNotEmpty: [ :value |
		html
			text: aLabel , ': ' , value;
			break ]
]

{ #category : #'rendering-projects' }
CenterReportComponent >> renderActiveProjectsReportOn: html [

	activeProjects ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'active-projects';
		with: 'Proyectos en curso'.
	(self sortDescencingByEndDate: self report activeProjects) do: [ :each |
		self renderProject: each on: html ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderActiveScholarshipReportOn: html [
	activeScholarships
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becas en curso'.
	report activeScholarships
		do: [ :each | self renderScholarship: each on: html ]
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderActivitySelectorsOn: html [

	html tbsFormGroup: [
		html
			label: 'Proyectos y becas';
			break.
		html checkbox
			value: activeProjects;
			callback: [ :value | activeProjects := value ].
		html space.
		html
			text: 'Proyectos en curso';
			break.

		html checkbox
			value: finishedProjects;
			callback: [ :value | finishedProjects := value ].
		html space.
		html
			text: 'Proyectos concluídos';
			break.

		html checkbox
			value: activeScholarships;
			callback: [ :value | activeScholarships := value ].
		html space.
		html
			text: 'Becas en curso';
			break.
		html checkbox
			value: finishedScholarships;
			callback: [ :value | finishedScholarships := value ].
		html space.
		html
			text: 'Becas concluídas';
			break ]
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderArticlePublicationsReportOn: html [

	| articles |
	articles := self report articlePublications.
	html heading
		level2;
		id: 'article';
		with: 'Articulos de revista (' , articles size greaseString , ')'.
	self renderPublicationsIn: articles on: html
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderArticleTypeSelectorsOn: html [
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

{ #category : #'rendering-publications' }
CenterReportComponent >> renderBookPublicationsReportOn: html [

	| articles |
	articles := self report bookPublications.
	html heading
		level2;
		id: 'book';
		with: 'Libros (' , articles size greaseString , ')'.
	self renderPublicationsIn: articles on: html
]

{ #category : #rendering }
CenterReportComponent >> renderContentOn: html [
	html div
		id: 'page';
		with: [ self renderReportHeaderOn: html.
			self renderFormOn: html.
			html horizontalRule.
			"self renderIndexOn: html."
			self renderReportOn: html ]
]

{ #category : #rendering }
CenterReportComponent >> renderDatesOf: anObject labeled: aLabel on: html [

	html
		text: aLabel , ': ' , anObject startDate asDate ddmmyyyy , ' - '
			, (anObject endDate
					 ifNil: [ 'en curso' ]
					 ifNotNil: [ :it | it asDate ddmmyyyy ]);
		break
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderDownloadIconFor: each on: html [
	each selfArchivingUrl
		ifNotNil: [ :url | 
			url
				ifNotEmpty: [ html space.
					html anchor
						url: url;
						target: '_new';
						with: [ html tbsGlyphIcon iconDownloadAlt ] ] ]
]

{ #category : #'rendering-researchers' }
CenterReportComponent >> renderExternalResearchersOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Investigador externo' ])
		heading: 'Investigadores externos'
		on: html
]

{ #category : #'rendering-projects' }
CenterReportComponent >> renderFinishedProjectsReportOn: html [

	finishedProjects ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'finished-projects';
		with: 'Proyectos concluídos'.
	(self sortDescencingByEndDate: self report finishedProjects) do: [ :each |
		self renderProject: each on: html ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderFinishedScholarshipReportOn: html [

	finishedScholarships ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becas Concluidas'.
	report finishedScholarships do: [ :each |
		self renderScholarship: each on: html ]
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderFormOn: html [
	html
		tbsForm: [ html
				tbsRow: [ html tbsColumn: [ self renderYearSelectorsOn: html ] mediumSize: 2.
					html tbsColumn: [ self renderArticleTypeSelectorsOn: html ] mediumSize: 3.
					html tbsColumn: [ self renderActivitySelectorsOn: html ] mediumSize: 3 .
					html tbsColumn: [ self renderThesisSelectorsOn: html ] mediumSize: 4].
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
CenterReportComponent >> renderGraduateStudentsOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Estudiante de posgrado' ])
		heading: 'Estudiantes de posgrado'
		on: html
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderInBookPublicationsReportOn: html [

	| articles |
	articles := self report inbookPublications.
	html heading
		level2;
		id: 'inbook';
		with: 'Capítulos de libro (' , articles size greaseString , ')'.
	self renderPublicationsIn: articles on: html
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderInProceedingsPublicationsReportOn: html [

	| articles |
	articles := self report inproceedingsPublications.
	html heading
		level2;
		id: 'inproceedings';
		with:
			'Articulos de conferencia (' , articles size greaseString , ')'.
	self renderPublicationsIn: articles on: html
]

{ #category : #rendering }
CenterReportComponent >> renderIndexOn: html [
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
						with: 'Dirección de tesis y trabajos finales' ].
			html unorderedList: [ self renderThesisIndexOn: html ].
			html
				listItem: [ html anchor
						url: '#scholarships';
						with: 'Becarios' ].
			html
				listItem: [ html anchor
						url: '#active-projects';
						with: 'Proyectos en curso' ].
			html
				listItem: [ html anchor
						url: '#finished-projects';
						with: 'Proyectos concluídos' ].
			html
				listItem: [ html anchor
						url: '#researchers';
						with: 'Participantes' ] ]
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderMastersThesisSelectosOn: html [

	html checkbox
		value: activeMastersThesis;
		callback: [ :value | activeMastersThesis := value ].
	html space.
	html
		text: 'Tesis de maestría en curso';
		break.
	html checkbox
		value: finishedMastersThesis;
		callback: [ :value | finishedMastersThesis := value ].
	html space.
	html
		text: 'Tesis de maestría concluídas';
		break
]

{ #category : #'rendering-researchers' }
CenterReportComponent >> renderMembers: aCollection heading: aHeading on: html [
	activeProjects
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
CenterReportComponent >> renderOtherMembersOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA isNil ])
		heading: 'Asistentes de investigación'
		on: html
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderPhdThesisSelectorsOn: html [

	html checkbox
		value: activePhdThesis;
		callback: [ :value | activePhdThesis := value ].
	html space.
	html
		text: 'Tesis doctorales en curso';
		break.
	html checkbox
		value: finishedPhdThesis;
		callback: [ :value | finishedPhdThesis := value ].
	html space.
	html
		text: 'Tesis doctorales concluidas';
		break
]

{ #category : #'rendering-projects' }
CenterReportComponent >> renderProject: each on: html [

	html paragraph
		style: 'padding:10px;';
		with: [
			html
				text: each title;
				break.
			self
				render: #code
				of: each
				labeled: 'Código'
				on: html.
			self renderDatesOf: each labeled: 'Fechas' on: html.
			self
				render: #director
				of: each
				labeled: 'Director(es)'
				on: html.
			self
				render: #coDirector
				of: each
				labeled: 'Codirector(es)'
				on: html.
			self
				render: #responsibleGroup
				of: each
				labeled: 'Grupo responsable'
				on: html.
			self
				render: #fundingAgency
				of: each
				labeled: 'Fianciador'
				on: html.
			self
				render: #amount
				of: each
				labeled: 'Monto'
				on: html.
			self
				render: #summary
				of: each
				labeled: 'Resumen'
				on: html.
			html anchor
				target: '_blank';
				url: '/' , (ProjectReportComponent relativeUrlFor: each);
				with: 'Mas detalles' ]
]

{ #category : #'rendering-projects' }
CenterReportComponent >> renderProjectsReportOn: html [

	self renderActiveProjectsReportOn: html.
	self renderFinishedProjectsReportOn: html
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderPublication: each on: html [
	html text: each asReference.
	self renderDownloadIconFor: each on: html
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderPublicationsIn: aCollection on: html [

	| renderer |
	renderer := ReferenceRenderer new.
	(aCollection asSortedCollection: [ :a :b | a year > b year ]) do: [
		:each |
		html paragraph
			style: 'padding-left:5px;';
			with: [ renderer render: each on: html ] ]
]

{ #category : #rendering }
CenterReportComponent >> renderPublicationsIndexOn: html [
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
CenterReportComponent >> renderPublicationsPlotOn: html [

	self session currentUser ifNil: [ ^ self ].

	publicationsPlot arrayOfDictionariesWithCounts:
		self report publicationCounts.
	publicationsPlot renderContentOn: html
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderPublicationsReportOn: html [

	article | inbook | inproceedings | book ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'publications';
		with: 'Publicaciones'.
	self renderPublicationsPlotOn: html.
	article ifTrue: [ self renderArticlePublicationsReportOn: html ].
	inproceedings ifTrue: [
		self renderInProceedingsPublicationsReportOn: html ].
	inbook ifTrue: [ self renderInBookPublicationsReportOn: html ].
	book ifTrue: [ self renderBookPublicationsReportOn: html ]
]

{ #category : #rendering }
CenterReportComponent >> renderReportHeaderOn: html [
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
CenterReportComponent >> renderReportOn: html [
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
		renderUndergraduateStudentsOn: html;
		renderExternalResearchersOn: html
]

{ #category : #'rendering-researchers' }
CenterReportComponent >> renderResearcher: each on: html [
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
CenterReportComponent >> renderResearchersOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Investigador' ])
		heading: 'Investigadores'
		on: html
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderScholarship: each on: html [

	html paragraph
		style: 'padding: 10px;';
		with: [
			html
				strong: 'Alumno: ' , each student;
				break.
			self renderDatesOf: each labeled: 'Fechas' on: html.
			self
				render: #title
				of: each
				labeled: 'Título'
				on: html.


			self
				render: #director
				of: each
				labeled: 'Director(es)'
				on: html.
			self
				render: #coDirector
				of: each
				labeled: 'Codirector(es)'
				on: html.
			self
				render: #fundingAgency
				of: each
				labeled: 'Financiador'
				on: html.

			self
				render: #type
				of: each
				labeled: 'Tipo de beca'
				on: html.
			self
				render: #summary
				of: each
				labeled: 'Resumen'
				on: html ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderScholarshipReportOn: html [

	self renderActiveScholarshipReportOn: html.
	self renderFinishedScholarshipReportOn: html
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderSpecalizationThesisSelectorsOn: html [

	html checkbox
		value: activeSpecializationThesis ;
		callback: [ :value | activeSpecializationThesis := value ].
	html space.
	html
		text: 'Trabajos de especializacion en curso';
		break.
	html checkbox
		value: finishedSpecializationThesis;
		callback: [ :value | finishedSpecializationThesis  := value ].
	html space.
	html
		text: 'Trabajos de especializacion concluidos';
		break
]

{ #category : #'rendering-thesis' }
CenterReportComponent >> renderThesis: each on: html [

	| endDate |
	endDate := each endDate
		           ifNil: [ '' ]
		           ifNotNil: [ :it | each endDate asDate printString ].
	html paragraph
		style: 'padding:5px;';
		with: [
			html strong: 'Título: ' , each title.
			self renderDownloadIconFor: each on: html.
			html break.
			self
				render: #keywords
				of: each
				labeled: 'Palabras clave'
				on: html.
			self
				render: #student
				of: each
				labeled: 'Alumno'
				on: html.
			self renderDatesOf: each labeled: 'Fechas' on: html.
			self
				render: #progress
				of: each
				labeled: 'Grado de avance'
				on: html.
			self
				render: #director
				of: each
				labeled: 'Director(es)'
				on: html.
			self
				render: #coDirector
				of: each
				labeled: 'Codirector(es)'
				on: html.
			self
				render: #career
				of: each
				labeled: 'Carrera'
				on: html.
			self
				render: #summary
				of: each
				labeled: 'Resumen'
				on: html ]
]

{ #category : #'rendering-thesis' }
CenterReportComponent >> renderThesisCollection: aCollectionOfThesis withHeading: aHeading on: html [

	html heading
		level2;
		id: aHeading asValidSelector;
		with: aHeading.
	(self sortDescencingByEndDate: aCollectionOfThesis) do: [ :each |
		self renderThesis: each on: html ]
]

{ #category : #rendering }
CenterReportComponent >> renderThesisIndexOn: html [
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
CenterReportComponent >> renderThesisReportOn: html [

	activeUndergraduateThesis | activeMastersThesis | activePhdThesis
	| activeSpecializationThesis | finishedUndergraduateThesis
	| finishedMastersThesis | finishedPhdThesis
	| finishedSpecializationThesis
		ifTrue: [
			html heading
				level1;
				id: 'thesis';
				with: 'Dirección de tesis y trabajos finales' ]
		ifFalse: [ ^ self ].

	thesisPlot arrayOfDictionariesWithCounts: self report thesisCounts.
	thesisPlot renderContentOn: html.

	activePhdThesis ifTrue: [
		self
			renderThesisCollection: report activePhdThesis
			withHeading: 'Tesis doctorales en curso'
			on: html ].

	finishedPhdThesis ifTrue: [
		self
			renderThesisCollection: report finishedPhdThesis
			withHeading: 'Tesis doctorales concluídas'
			on: html ].


	activeMastersThesis ifTrue: [
		self
			renderThesisCollection: report activeMastersThesis
			withHeading: 'Tesis de maestría en curso'
			on: html ].

	finishedMastersThesis ifTrue: [
		self
			renderThesisCollection: report finishedMastersThesis
			withHeading: 'Tesis de maestría concluídas'
			on: html ].


	activeSpecializationThesis ifTrue: [
		self
			renderThesisCollection: report activeSpecializationThesis
			withHeading: 'Trabajos de especialización en curso'
			on: html ].

	finishedSpecializationThesis ifTrue: [
		self
			renderThesisCollection: report finishedSpecializationThesis
			withHeading: 'Trabajos de especialización concluídos'
			on: html ].

	activeUndergraduateThesis ifTrue: [
		self
			renderThesisCollection: report activeUndergraduateThesis 
			withHeading: 'Tesinas de grado en curso'
			on: html ].

	finishedUndergraduateThesis ifTrue: [
		self
			renderThesisCollection: report finishedUndergraduateThesis 
			withHeading: 'Tesinas de grado concluídas'
			on: html ]
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderThesisSelectorsOn: html [

	html tbsFormGroup: [
		html
			label: 'Dirección de tesis y trabajos finales';
			break.
		self renderPhdThesisSelectorsOn: html.
		self renderMastersThesisSelectosOn: html.
		self renderSpecalizationThesisSelectorsOn: html.
		self renderUndergratuadeThesisSelectorsOn: html ]
]

{ #category : #'rendering-researchers' }
CenterReportComponent >> renderUndergraduateStudentsOn: html [
	self
		renderMembers:
			(report researchers
				select: [ :each | each positionAtLIFIA = 'Estudiante de grado' ])
		heading: 'Estudiantes de grado'
		on: html
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderUndergratuadeThesisSelectorsOn: html [

	html checkbox
		value: activeUndergraduateThesis  ;
		callback: [ :value | activeUndergraduateThesis := value ].
	html space.
	html
		text: 'Tesinas de grado en curso';
		break.
	html checkbox
		value: finishedUndergraduateThesis ;
		callback: [ :value | finishedUndergraduateThesis  := value ].
	html space.
	html
		text: 'Tesinas de grado concluídas';
		break
]

{ #category : #'rendering-form' }
CenterReportComponent >> renderYearSelectorsOn: html [
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
CenterReportComponent >> report [
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
CenterReportComponent >> selectActiveItemsFrom: aCollection [
	| yearsAsNumbers |
	yearsAsNumbers := selectedYears collect: #asNumber.
	^ aCollection
		select:
			[ :each | each yearsActive anySatisfy: [ :year | yearsAsNumbers includes: year ] ]
]

{ #category : #rendering }
CenterReportComponent >> style [
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
CenterReportComponent >> update [
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
