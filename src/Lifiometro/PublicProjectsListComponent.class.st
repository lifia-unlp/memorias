"
| app |
app := WAAdmin register: PublicProjectsListComponent asApplicationAt: 'project-list'.
app addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #PublicProjectsListComponent,
	#superclass : #PublicReportComponent,
	#instVars : [
		'finishedProjects',
		'activeProjects'
	],
	#category : 'Lifiometro-Reports'
}

{ #category : #initialization }
PublicProjectsListComponent >> initialize [
	super initialize.
	finishedProjects := SortedCollection
		sortBlock: [ :a :b | a endDate > b endDate ].
	finishedProjects addAll: (self projects reject: #isActive).
	activeProjects := SortedCollection
		sortBlock: [ :a :b | a startDate > b startDate ].
	activeProjects addAll: (self projects select: #isActive)
]

{ #category : #initialization }
PublicProjectsListComponent >> projects [
	^ LifiometroRepository singleton projects
]

{ #category : #initialization }
PublicProjectsListComponent >> renderContentOn: html [
	html div
		id: #page;
		with: [ self renderHeaderOn: html.
			self renderProjectsOn: html ]
]

{ #category : #initialization }
PublicProjectsListComponent >> renderHeaderOn: html [
	html image
		width: 149;
		url: LifiaFileLibrary / #logolifiaPng.
	html break
]

{ #category : #initialization }
PublicProjectsListComponent >> renderProject: project on: html [
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
				url: (self urlForProjectProfile: project);
				with: 'Ver Mas ...' ]
]

{ #category : #initialization }
PublicProjectsListComponent >> renderProjectsOn: html [
	html heading: 'Projectos de investigación'.
	html heading level2 with: 'Proyectos en curso'.
	activeProjects do: [ :each | self renderProject: each on: html ].
	html heading level2 with: 'Proyectos finalizados'.
	finishedProjects do: [ :each | self renderProject: each on: html ]
]

{ #category : #initialization }
PublicProjectsListComponent >> style [
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

p { 
   margin: 0 0 15px;
}

a { 
    text-decoration: underline;
    color: #117bb8;
    transition: .1s all ease-in;
}

'
]

{ #category : #initialization }
PublicProjectsListComponent >> updateRoot: aWARoot [
	super updateRoot: aWARoot.
	aWARoot title: 'LIFIA - Projectos de investigación'
]
