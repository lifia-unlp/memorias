initialization
initialize
	super initialize.
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
	selectedTab := 'Publicaciones'