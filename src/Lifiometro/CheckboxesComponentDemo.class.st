"
```
| app |
app := WAAdmin register: CheckboxesComponentDemo asApplicationAt: 'CheckboxesComponentDemo'.
app
	addLibrary: JQDeploymentLibrary;
	addLibrary: JQUiDeploymentLibrary;
	addLibrary: TBSDeploymentLibrary.

```
"
Class {
	#name : #CheckboxesComponentDemo,
	#superclass : #WAComponent,
	#instVars : [
		'checkboxesComponent'
	],
	#category : #'Lifiometro-Web-Components'
}

{ #category : #rendering }
CheckboxesComponentDemo >> children [

	^ { checkboxesComponent }
]

{ #category : #initialization }
CheckboxesComponentDemo >> initialize [

	super initialize.

	checkboxesComponent := CheckboxesComponent new.

	self
		initializeYearlyCheckboxes;
		initializePublicationTypeCheckboxes;
		initializeActivityTypeCheckboxes;
		initializeThesisTypeCheckboxes
]

{ #category : #initialization }
CheckboxesComponentDemo >> initializeActivityTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading: 'Proyectos y becas'.
	list addCheckboxFor: 'activeProjects' labeled: 'Proyectos en curso'.
	list
		addCheckboxFor: 'finishedProjects'
		labeled: 'Proyectos concluídos'.
	list addCheckboxFor: 'activeScholarships' labeled: 'Becas en curso'.
	list
		addCheckboxFor: 'finishedScholarships'
		labeled: 'Becas concluídas'
]

{ #category : #initialization }
CheckboxesComponentDemo >> initializePublicationTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading:
		        'Publicaciones a incluir'.
	list addCheckboxFor: 'article' labeled: 'Artículos de revista'.
	list
		addCheckboxFor: 'inproceedings'
		labeled: 'Artículos de conferencias'.
	list addCheckboxFor: 'inbook' labeled: 'Capítulos de libro'.
	list addCheckboxFor: 'book' labeled: 'Libros'
]

{ #category : #initialization }
CheckboxesComponentDemo >> initializeThesisTypeCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading:
		        'Dirección de tesis y trabajos finales'.
	list
		addCheckboxFor: 'activePhdThesis'
		labeled: 'Tesis doctorales en curso'.
	list
		addCheckboxFor: 'finishedPhdThesis'
		labeled: 'Tesis doctorales concluidas'.
	list
		addCheckboxFor: 'activeMastersThesis'
		labeled: 'Tesis de maestría en curso'.
	list
		addCheckboxFor: 'finishedMastersThesis'
		labeled: 'Tesis de maestría concluídas'.

	list
		addCheckboxFor: 'activeSpecializationThesis'
		labeled: 'Trabajos de especializacion en curso'.
	list
		addCheckboxFor: 'finishedSpecializationThesis'
		labeled: 'Trabajos de especializacion concluidos'.

	list
		addCheckboxFor: 'activeUndergraduateThesis'
		labeled: 'Tesinas de grado en curso'.
	list
		addCheckboxFor: 'finishedUndergraduateThesis'
		labeled: 'Tesinas de grado concluídas'
]

{ #category : #initialization }
CheckboxesComponentDemo >> initializeYearlyCheckboxes [

	| list |
	list := checkboxesComponent addListWithHeading: 'Años a incluir'.
	((2024 to: 2017 by: -1) collect: #printString) do: [ :year |
		list addCheckboxFor: year labeled: year ]
]

{ #category : #rendering }
CheckboxesComponentDemo >> renderContentOn: html [

	html tbsContainer: [
		html render: checkboxesComponent.
		checkboxesComponent checkboxListModels do: [ :list |
			html heading: list heading.
			list checkboxModels
				select: #checked
				thenDo: [ :each | html paragraph: each label ] ] ]
]
