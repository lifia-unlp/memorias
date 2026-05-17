"
| app |
app := WAAdmin register: PublicProjectsListComponent asApplicationAt: 'project-list'.
app addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #PublicProjectsListComponent,
	#superclass : #SimpleListReportComponent,
	#instVars : [
		'finishedProjects',
		'activeProjects'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
PublicProjectsListComponent class >> relativeUrl [
	^ 'project-list'
]

{ #category : #initialization }
PublicProjectsListComponent >> prepareSections [
	"send addSectionTitled:with: as necessary "

	| allProjects |
	allProjects := self projects.
	self
		addSectionTitled: 'Proyectos en curso'
		with:
			((allProjects select: #isActive)
				asSortedCollection: [ :a :b | a startDate > b startDate ]).
	self
		addSectionTitled: 'Proyectos finalizados'
		with:
			((allProjects reject: #isActive)
				asSortedCollection: [ :a :b | a startDate > b startDate ])
]

{ #category : #initialization }
PublicProjectsListComponent >> projects [
	^ LifiometroRepository singleton projects
]

{ #category : #initialization }
PublicProjectsListComponent >> renderItem: project on: html [
	html
		paragraph: [ html strong: project title , '.'.
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
						, project endDate ddmmyyyy , ' .'.
			html space.
			html anchor
				url: self baseUrl , (ProjectReportComponent relativeUrlFor: project);
				with: 'Ver Mas ...' ]
]

{ #category : #initialization }
PublicProjectsListComponent >> reportTitle [
	^ 'Proyectos de investigación'
]
