"
| app |
app := WAAdmin register: ReportComponent asApplicationAt: 'memoria-publica'.
app
        addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #CenterReportComponent,
	#superclass : #ReportComponent,
	#instVars : [
		'report',
		'publicationsPlot',
		'thesisPlot',
		'checkboxesComponent',
		'activeProjects',
		'activeScholarships',
		'finishedProjects',
		'finishedScholarships',
		'article',
		'inbook',
		'inproceedings',
		'book',
		'activeUndergraduateThesis',
		'activeMastersThesis',
		'activePhdThesis',
		'activeSpecializationThesis',
		'finishedUndergraduateThesis',
		'finishedMastersThesis',
		'finishedPhdThesis',
		'finishedSpecializationThesis',
		'selectedYears',
		'older',
		'indexComponent',
		'misc',
		'showSummaries'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
CenterReportComponent class >> relativeUrl [
	^ 'center-profile'
]

{ #category : #hooks }
CenterReportComponent >> children [

	^ {publicationsPlot. checkboxesComponent . indexComponent }
]

{ #category : #initialization }
CenterReportComponent >> initialize [

	super initialize.
	publicationsPlot := YearlyEvolutionPlotSubcomponent new.
	publicationsPlot title: 'Evolución de las publicaciones'.
	thesisPlot := YearlyEvolutionPlotSubcomponent new.
	thesisPlot title: 'Evolución de las tesis y tesinas concluidas'.
	indexComponent := IndexInjectorComponent new. 
	showSummaries := false. 
	self initializeCheckboxesComponent
]

{ #category : #initialization }
CenterReportComponent >> initializeActivityTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading: 'Proyectos, becas y estancias'.
	activeProjects := list
		                  addCheckboxFor: 'activeProjects'
		                  labeled: 'Proyectos en curso'.
	finishedProjects := list
		                    addCheckboxFor: 'finishedProjects'
		                    labeled: 'Proyectos concluídos'.
	activeScholarships := list
		                      addCheckboxFor: 'activeScholarships'
		                      labeled: 'Becas y estancias en curso'.
	finishedScholarships := list
		                        addCheckboxFor: 'finishedScholarships'
		                        labeled: 'Becas y estancias concluídas'.
	list checkAll
]

{ #category : #initialization }
CenterReportComponent >> initializeCheckboxesComponent [

   	checkboxesComponent := CheckboxesComponent new.
checkboxesComponent columnSizes: #(2 3 3 4).
	self
		initializeYearlyCheckboxes;
		initializePublicationTypeCheckboxes;
		initializeActivityTypeCheckboxes;
		initializeThesisTypeCheckboxes.


]

{ #category : #initialization }
CenterReportComponent >> initializePublicationTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading:
		        'Publicaciones a incluir'.
	article := list
		           addCheckboxFor: 'article'
		           labeled: 'Artículos de revista'.
	inproceedings := list
		                 addCheckboxFor: 'inproceedings'
		                 labeled: 'Artículos de conferencias'.
	inbook := list addCheckboxFor: 'inbook' labeled: 'Capítulos de libro'.
	book := list addCheckboxFor: 'book' labeled: 'Libros'.
	misc := list addCheckboxFor: 'other' labeled: 'Otros'.
	list checkAll
]

{ #category : #initialization }
CenterReportComponent >> initializeThesisTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading:
		        'Dirección de tesis y trabajos finales'.
	activePhdThesis := list
		                   addCheckboxFor: 'activePhdThesis'
		                   labeled: 'Tesis doctorales en curso'.
	finishedPhdThesis := list
		                     addCheckboxFor: 'finishedPhdThesis'
		                     labeled: 'Tesis doctorales concluidas'.
	activeMastersThesis := list
		                       addCheckboxFor: 'activeMastersThesis'
		                       labeled: 'Tesis de maestría en curso'.
	finishedMastersThesis := list
		                         addCheckboxFor: 'finishedMastersThesis'
		                         labeled: 'Tesis de maestría concluídas'.

	activeSpecializationThesis := list
		                              addCheckboxFor:
		                              'activeSpecializationThesis'
		                              labeled:
		                              'Trabajos de especializacion en curso'.
	finishedSpecializationThesis := list
		                                addCheckboxFor:
		                                'finishedSpecializationThesis'
		                                labeled:
		                                'Trabajos de especializacion concluidos'.

	activeUndergraduateThesis := list
		                             addCheckboxFor:
		                             'activeUndergraduateThesis'
		                             labeled: 'Tesinas de grado en curso'.
	finishedUndergraduateThesis := list
		                               addCheckboxFor:
		                               'finishedUndergraduateThesis'
		                               labeled:
		                               'Tesinas de grado concluídas'.
	list checkAll
]

{ #category : #initialization }
CenterReportComponent >> initializeYearlyCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading: 'Años a incluir'.
	selectedYears := ((Year currentYearNumber - 6 to:
	                   Year currentYearNumber) reversed collect:
		                  #printString) collect: [ :year |
		                 list addCheckboxFor: year labeled: year ].
	list checkAll. 
	older := list addCheckboxFor: 'older' labeled: 'older'
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

	activeProjects checked ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'active-projects';
		with: 'Proyectos en curso'.
	(self sortDescencingByEndDate: self report activeProjects) do: [ :each |
		self renderProject: each on: html ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderActiveScholarshipReportOn: html [
	activeScholarships checked
		ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becas y estancias en curso'.
	report activeScholarships
		do: [ :each | self renderScholarship: each on: html ]
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
			self renderShowSummariesSelectorOn: html.
			html render: checkboxesComponent .
			html horizontalRule .
			self renderIndexOn: html.
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

{ #category : #'rendering-projects' }
CenterReportComponent >> renderFinishedProjectsReportOn: html [


	finishedProjects checked ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'finished-projects';
		with: 'Proyectos concluídos'.
	(self sortDescencingByEndDate: self report finishedProjects) do: [ :each |
		self renderProject: each on: html ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderFinishedScholarshipReportOn: html [

	finishedScholarships checked ifFalse: [ ^ self ].
	html heading
		level1;
		id: 'scholarships';
		with: 'Becas y estancias concluídas'.
	report finishedScholarships do: [ :each |
		self renderScholarship: each on: html ]
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

	html render: indexComponent 
]

{ #category : #'rendering-thesis' }
CenterReportComponent >> renderLinkToThesisProfile: aThesis on: html [

	html anchor
		url: self baseUrl , (ThesisReportComponent relativeUrlFor: aThesis);
		with: 'Mas detalles'
]

{ #category : #'rendering-publications' }
CenterReportComponent >> renderOtherPublicationsReportOn: html [

	| articles |
	articles := self report otherPublications.
	html heading
		level2;
		id: 'misc';
		with: 'Otras publicaciones (' , articles size greaseString , ')'.
	self renderPublicationsIn: articles on: html
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
				labeled: 'Financiador'
				on: html.
			self
				render: #amount
				of: each
				labeled: 'Monto'
				on: html.
			showSummaries ifTrue: [
				self
					render: #summary
					of: each
					labeled: 'Resumen'
					on: html ].
			html anchor
				target: '_blank';
				url: self baseUrl , (ProjectReportComponent relativeUrlFor: each);
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

	| renderer currentYear |
	currentYear := 0.
	renderer := ReferenceRenderer new.
	(aCollection asSortedCollection: [ :a :b | a year > b year ]) do: [
		:each |
		currentYear ~= each year ifTrue: [
			currentYear := each year.
			html paragraph: '-' , each year greaseString , '-' ].
		html paragraph
			style: 'margin-left:20px;';
			with: [ renderer render: each on: html ] ]
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

        article checked | inbook checked | inproceedings checked | book checked | misc checked ifFalse: [ ^ self ].
        html heading
                level1;
                id: 'publications';
                with: [
                        html text: 'Publicaciones '.
                        html anchor
                                callback: [ self exportBibtex ];
                                with: [ | iconTag |
                                        iconTag := html tbsGlyphIcon.
                                        iconTag iconFile.
                                        iconTag with: [ html span
                                                        style: 'position: absolute; bottom: 1px; left: 1px; font-size: 8px; color: white; font-weight: bold; background: transparent; padding: 0 0; border-radius: 0;';
                                                        with: 'bib' ] ] ].
        self renderPublicationsPlotOn: html.
        article checked ifTrue: [ self renderArticlePublicationsReportOn: html ].
        inproceedings checked ifTrue: [
                self renderInProceedingsPublicationsReportOn: html ].
	inbook checked ifTrue: [ self renderInBookPublicationsReportOn: html ].
	book checked ifTrue: [ self renderBookPublicationsReportOn: html ].
	misc checked ifTrue: [ self renderOtherPublicationsReportOn: html ]
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
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderScholarship: each on: html [

	html paragraph
		style: 'padding: 10px;';
		with: [
			html
				strong: 'Beneficiario: ' , each student;
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
				labeled: 'Tipo de beca o estancia'
				on: html.
			showSummaries ifTrue: [
				self
					render: #summary
					of: each
					labeled: 'Resumen'
					on: html ] ]
]

{ #category : #'rendering-scholarhips' }
CenterReportComponent >> renderScholarshipReportOn: html [

	self renderActiveScholarshipReportOn: html.
	self renderFinishedScholarshipReportOn: html
]

{ #category : #rendering }
CenterReportComponent >> renderShowSummariesSelectorOn: html [

	html paragraph: [
		html text: 'Resúmenes de proyectos, becas y tesis: '.
		showSummaries
			ifTrue: [
				html anchor
					callback: [ self toggleShowSummaries  ];
					with: [ html tbsGlyphIcon iconEyeOpen   ] ]
			ifFalse: [
				html anchor
					callback: [ self toggleShowSummaries ];
					with: [html tbsGlyphIcon iconEyeClose]  ] ]
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
				render: #otherAdvisors
				of: each
				labeled: 'Asesor(es)'
				on: html.
			self
				render: #career
				of: each
				labeled: 'Carrera'
				on: html.
			showSummaries ifTrue: [
					self
						render: #summary
						of: each
						labeled: 'Resumen'
						on: html ].
			self renderLinkToThesisProfile: each on: html ]
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

{ #category : #'rendering-thesis' }
CenterReportComponent >> renderThesisReportOn: html [

	activeUndergraduateThesis checked | activeMastersThesis checked
	| activePhdThesis checked | activeSpecializationThesis checked
	| finishedUndergraduateThesis checked | finishedMastersThesis checked
	| finishedPhdThesis checked | finishedSpecializationThesis checked
		ifTrue: [
			html heading
				level1;
				id: 'thesis';
				with: 'Dirección de tesis y trabajos finales' ]
		ifFalse: [ ^ self ].

	thesisPlot arrayOfDictionariesWithCounts: self report thesisCounts.
	thesisPlot renderContentOn: html.

	activePhdThesis checked ifTrue: [
		self
			renderThesisCollection: report activePhdThesis
			withHeading: 'Tesis doctorales en curso'
			on: html ].

	finishedPhdThesis checked ifTrue: [
		self
			renderThesisCollection: report finishedPhdThesis
			withHeading: 'Tesis doctorales concluídas'
			on: html ].


	activeMastersThesis checked ifTrue: [
		self
			renderThesisCollection: report activeMastersThesis
			withHeading: 'Tesis de maestría en curso'
			on: html ].

	finishedMastersThesis checked ifTrue: [
		self
			renderThesisCollection: report finishedMastersThesis
			withHeading: 'Tesis de maestría concluídas'
			on: html ].


	activeSpecializationThesis checked ifTrue: [
		self
			renderThesisCollection: report activeSpecializationThesis
			withHeading: 'Trabajos de especialización en curso'
			on: html ].

	finishedSpecializationThesis checked ifTrue: [
		self
			renderThesisCollection: report finishedSpecializationThesis
			withHeading: 'Trabajos de especialización concluídos'
			on: html ].

	activeUndergraduateThesis checked ifTrue: [
		self
			renderThesisCollection: report activeUndergraduateThesis
			withHeading: 'Tesinas de grado en curso'
			on: html ].

	finishedUndergraduateThesis checked ifTrue: [
		self
			renderThesisCollection: report finishedUndergraduateThesis
			withHeading: 'Tesinas de grado concluídas'
			on: html ]
]

{ #category : #report }
CenterReportComponent >> report [

	| selectedYearsAsNumbers |
	selectedYearsAsNumbers := (selectedYears select: #checked)
		                          collect: [ :each | each label asNumber ]
		                          as: OrderedCollection.
	older checked ifTrue: [
		selectedYearsAsNumbers addAll: (2000 to: Year currentYearNumber - 7) ].

	(report notNil and: [
		 report years asSet = selectedYearsAsNumbers asSet ]) ifTrue: [
		^ report ].
	report := LifiometroRepository singleton reportForYears:
		          selectedYearsAsNumbers.
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
CenterReportComponent >> toggleShowSummaries [ 

  showSummaries := showSummaries not
]

{ #category : #hooks }
CenterReportComponent >> updateRoot: aWARoot [

        super updateRoot: aWARoot.
        aWARoot meta
                name: 'viewport';
                content: 'width=device-width, initial-scale=1'.
        aWARoot title: 'LIFIA - Memoria técnica'
]

{ #category : #actions }
CenterReportComponent >> exportBibtex [
       | bibtexEntries |
       bibtexEntries := report allPublications
                               select: [ :each | each class = BibtexReference ].
       self requestContext respond: [ :response |
               response contentType: 'application/x-bibtex'.
               response headerAt: 'Content-Disposition'
                               put: 'attachment; filename="publications.bib"'.
               response nextPutAll:
                       (String streamContents: [ :stream |
                               bibtexEntries do: [ :each |
                                       stream nextPutAll: each bibtexEntry printString;
                                               cr; cr ] ]) ]
]
