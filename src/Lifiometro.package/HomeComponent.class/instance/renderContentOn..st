rendering
renderContentOn: html
	html
		tbsRow: [ html tbsColumn: [ self renderLeftMenuOn: html ] mediumSize: 2.
			html
				tbsColumn: [ self session currentUser enabled
						ifFalse: [ ^ self renderWaitForActivationOn: html ].
					selectedTab = 'Publicaciones'
						ifTrue: [ html render: publicationsListComponent ].
					selectedTab = 'Proyectos'
						ifTrue: [ html render: projectsListComponent ].
					selectedTab = 'Becas'
						ifTrue: [ html render: scholarshipsListComponent ].
					selectedTab = 'Tesis'
						ifTrue: [ html render: studentsListComponent ].
		"			selectedTab = 'Agenda'
						ifTrue: [ html render: scheduleComponent ]."
					selectedTab = 'Investigadores'
						ifTrue: [ html render: lifiansComponent ].
					selectedTab = 'Administrar'
						ifTrue: [ html render: adminComponent ] ]
				mediumSize: 10 ]