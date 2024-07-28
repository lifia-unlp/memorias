Class {
	#name : #HomeComponent,
	#superclass : #WAComponent,
	#instVars : [
		'publicationsListComponent',
		'selectedTab',
		'scholarshipsListComponent',
		'projectsListComponent',
		'studentsListComponent',
		'adminComponent',
		'scheduleComponent',
		'lifiansComponent',
		'lifiaUserResearcherReportComponent',
		'internalNewsComponent'
	],
	#category : #'Lifiometro-Web'
}

{ #category : #children }
HomeComponent >> children [
	^ {publicationsListComponent.
	scholarshipsListComponent.
	projectsListComponent.
	studentsListComponent.
	adminComponent.
	scheduleComponent.
	lifiansComponent }
]

{ #category : #initialization }
HomeComponent >> initialize [

	super initialize.
	internalNewsComponent := InternalNewsComponent new.
	publicationsListComponent := PublicationsListComponent new
		                             parent: self;
		                             yourself.
	scholarshipsListComponent := ScholarshipsListComponent new
		                             parent: self;
		                             yourself.
	projectsListComponent := ProjectsListComponent new
		                         parent: self;
		                         yourself.
	studentsListComponent := ThesisListComponent new
		                         parent: self;
		                         yourself.
	adminComponent := AdministrationComponent new yourself.
	scheduleComponent := TabbedScheduleComponent new
		                     parent: self;
		                     yourself.
	lifiansComponent := LifianListComponent new
		                    parent: self;
		                    yourself.
	lifiaUserResearcherReportComponent := LifiaUserResearcherReportComponent
		                                      new.
	selectedTab := 'Novedades'
]

{ #category : #callback }
HomeComponent >> logout [
    self session unregister. 
    self requestContext redirectTo: self application url.
]

{ #category : #rendering }
HomeComponent >> renderContentOn: html [

	html tbsRow: [
		html tbsColumn: [ self renderLeftMenuOn: html ] mediumSize: 2.
		html
			tbsColumn: [
				self session currentUser enabled ifFalse: [
					^ self renderWaitForActivationOn: html ].
				selectedTab = 'Novedades' ifTrue: [
					html render: internalNewsComponent ].
				selectedTab = 'Mi ficha técnica' ifTrue: [
					html render: lifiaUserResearcherReportComponent ].
				selectedTab = 'Publicaciones' ifTrue: [
					html render: publicationsListComponent ].
				selectedTab = 'Proyectos' ifTrue: [
					html render: projectsListComponent ].
				selectedTab = 'Becas' ifTrue: [
					html render: scholarshipsListComponent ].
				selectedTab = 'Tesis' ifTrue: [
					html render: studentsListComponent ].
				"			selectedTab = 'Agenda'
						ifTrue: [ html render: scheduleComponent ]."
				selectedTab = 'Investigadores' ifTrue: [
					html render: lifiansComponent ].
				selectedTab = 'Administrar' ifTrue: [ html render: adminComponent ] ]
			mediumSize: 10 ]
]

{ #category : #rendering }
HomeComponent >> renderLeftMenuOn: html [

	| tabs |
	tabs := OrderedCollection new.
	self session currentUser enabled ifTrue: [
		tabs addAll:
			{ 'Novedades'. 'Publicaciones'. 'Proyectos'. 'Becas'. 'Tesis'. 'Investigadores' }.
		self session currentUser isAdmin ifTrue: [ tabs add: 'Administrar' ].
		self session currentUser lifian ifNotNil: [ :it |
			tabs addFirst: 'Mi ficha técnica' ] ].
	html tbsPanel: [
		html tbsPanelBody: [
			html image url: LifiaFileLibrary / #lifialogoPng.
			html tbsNav
				bePills;
				beStacked;
				with: [
					tabs do: [ :each |
							html tbsNavItem
								beActiveIf: each = selectedTab;
								with: [
									html anchor
										callback: [ selectedTab := each ];
										with: each ] ].
					self session currentUser enabled ifTrue: [
						html tbsNavItem: [
							html anchor
								target: '_blank';
								callback: [ self showReports ];
								with: 'Reportes' ] ].
					html tbsNavItem: [
						html anchor
							callback: [ self logout ];
							with: 'Salir' ] ] ] ]
]

{ #category : #rendering }
HomeComponent >> renderLoginScreenOn: html [
	html tbsContainer
		style: 'padding-top:20px;';
		with: [ html
				tbsJumbotron: [ html heading: 'Memorias del LIFIA'.
					html
						break;
						break.
					html
						paragraph: [ html
								text: 'Para ver y/o actualizar las memorias debe estar registrado.' ].
					html
						paragraph: [ html anchor
								url: self session oidcUrl;
								with: [ html tbsButton
										bePrimary;
										beLarge;
										with: 'Ingresar' ] ] ] ]
]

{ #category : #rendering }
HomeComponent >> renderWaitForActivationOn: html [
	html tbsContainer
		style: 'padding-top:20px;';
		with: [ html
				tbsJumbotron: [ html heading: 'Bienvenido!'.
					html
						break;
						break.
					html
						paragraph: [ html
								text: 'Su cuenta todavía no ha sido activada por los administradores.' ] ] ]
]

{ #category : #callback }
HomeComponent >> showReports [
	self show: CenterReportComponent new.
]

{ #category : #callback }
HomeComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: 'Memorias - LIFIA'
]
