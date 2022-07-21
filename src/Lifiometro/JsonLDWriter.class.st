Class {
	#name : #JsonLDWriter,
	#superclass : #Object,
	#category : #'Lifiometro-Reports'
}

{ #category : #rendering }
JsonLDWriter >> generalReportAsDictionary: aGeneralReport [
	^ self
		renderGraphWith:
			(OrderedCollection new
				add: (self renderPublicationsByType: aGeneralReport);
				add: (self renderThesesByType: aGeneralReport);
				add: (self renderScholarships: aGeneralReport);
				add:
					(self
						renderList:
							(aGeneralReport projects collect: [ :each | self renderProject: each ])
						withName: 'Proyectos');
				add: (self renderParticipantsByType: aGeneralReport);
				add: self renderLifiaAsOrganization;
				yourself)
]

{ #category : #writing }
JsonLDWriter >> projectListAsDictionary: aCollection [
	| activeProjects finishedProjects |
	activeProjects := aCollection
		select: #isActive
		thenCollect: [ :each | self renderProject: each ].
	finishedProjects := aCollection
		reject: #isActive
		thenCollect: [ :each | self renderProject: each ].
	^ self
		renderGraphWith:
			(OrderedCollection new
				add: (self renderList: finishedProjects withName: 'Proyectos finalizados');
				add: (self renderList: activeProjects withName: 'Proyectos en curso');
				yourself)
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> projectReportAsDictionary: aProjectReport [
	| topLevelItems |
	topLevelItems := OrderedCollection new
		add: (self renderProject: aProjectReport project);
		add: (self renderPublicationsByType: aProjectReport);
		add: (self renderScholarships: aProjectReport);
		add: (self renderReportThesisList: aProjectReport);
		yourself.
	 
	^ self renderGraphWith: topLevelItems 
]

{ #category : #rendering }
JsonLDWriter >> renderBibtexReference: aBibtexReference [
	| tree |
	tree := KeyedTree new
		at: '@type' put: 'ScholarlyArticle';
		at: 'name' put: aBibtexReference title;
		at: 'author' put: (
			aBibtexReference authorsAsCollection collect: [ :each | self renderPerson: each ]);
		yourself.
	
	aBibtexReference selfArchivingUrl
		ifNotNilNotEmpty: [ :it | tree at: 'url' put: it ].
	
	aBibtexReference isArticle
		ifTrue: [ tree at: 'isPartOf' put: (self renderJournalWithName: (aBibtexReference journal) andVolume: (aBibtexReference volume)) ].
		
	aBibtexReference isPartOfBook 
		ifTrue: [ tree at: 'isPartOf' put: (self renderBookWithName: aBibtexReference booktitle) ].
	
	^ tree
]

{ #category : #rendering }
JsonLDWriter >> renderBookWithName: aString [
	^ KeyedTree new
		at: '@type' put: 'Book';
		at: 'name' put: aString;
		yourself
]

{ #category : #rendering }
JsonLDWriter >> renderContactPointWithType: aString andUrl: anotherString [
	^ KeyedTree new
		at: '@type' put: 'ContactPoint';
		at: 'contactType' put: aString;
		at: 'url' put: anotherString;
		yourself
]

{ #category : #rendering }
JsonLDWriter >> renderContributorWithName: aString andTitle: anotherString [
	^ self
		renderRoleWith: (self renderPerson: aString)
		andRoleName: anotherString
		andName: 'contributor'
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderCurrency: aString withValue: aNumber [
	^ KeyedTree new
		at: '@type' put: 'MonetaryAmount';
		at: 'currency' put: aString;
		at: 'value' put: aNumber;
		yourself 
]

{ #category : #rendering }
JsonLDWriter >> renderDegreeWithName: aString [
	^ KeyedTree new
		at: '@type' put: 'EducationalOccupationalCredential';
		at: 'name' put: aString;
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderGrantWithFunder: aString andAmount: aNumber [
	^ KeyedTree new
		at: '@type' put: 'MonetaryGrant';
		at: 'funder' put: (self renderOrganizationWithName: aString);
		at: 'amount' put: (self renderCurrency: 'ARG' withValue: aNumber);
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderGraphWith: aCollection [
	^ KeyedTree new
		at: '@context' put: 'http://schema.org';
		at: '@graph' put: aCollection;
		yourself 
]

{ #category : #rendering }
JsonLDWriter >> renderJournalWithName: aString andVolume: anotherString [
	^ KeyedTree new
		at: '@type' put: 'PublicationVolume';
		at: 'volumeNumber' put: anotherString;
		at: 'isPartOf' put: (
			KeyedTree new
				at: '@type' put: 'Periodical';
				at: 'name' put: aString;
				yourself
		);
		yourself
]

{ #category : #writing }
JsonLDWriter >> renderLifiaAsOrganization [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Organization';
		at: '@id' put: 'main-organization';
		at: 'name' put: 'Centro de Investigación LIFIA';
		at: 'url' put: 'http://www.lifia.info.unlp.edu.ar/';
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderList: aCollection withName: aString [
	^ KeyedTree new
		at: '@type' put: 'ItemList';
		at: 'name' put: aString;
		at: 'itemListElement' put: aCollection;
		yourself 
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderOrganizationWithName: aString [
	^ KeyedTree new 
		at: '@type' put: 'Organization';
		at: 'name' put: aString;
		yourself
]

{ #category : #rendering }
JsonLDWriter >> renderParticipants: aCollection withName: aString [
	^ self
		renderList: (aCollection collect: [ :each | self renderReducedResearcher: each ])
		withName: aString
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderParticipantsByType: aGeneralReport [
	| list |
	list := OrderedCollection new
		add:
			(self
				renderParticipants: (aGeneralReport researchersWithPosition: 'Investigador')
				withName: 'Investigadores');
		add:
			(self
				renderParticipants: aGeneralReport researchersWithoutPosition
				withName: 'Asistentes de investigación');
		add:
			(self
				renderParticipants: (aGeneralReport researchersWithPosition: 'Estudiante de posgrado')
				withName: 'Estudiantes de posgrado');
		add:
			(self
				renderParticipants: (aGeneralReport researchersWithPosition: 'Estudiante de grado')
				withName: 'Estudiantes de grado');
		add:
			(self
				renderParticipants: (aGeneralReport researchersWithPosition: 'Investigador externo')
				withName: 'Investigadores externo');
		yourself.
	^ self renderList: list withName: 'Participantes'
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderPerson: aString [
	^ KeyedTree new 
		at: '@type' put: 'Person';
		at: 'name' put: aString;
		yourself
]

{ #category : #writing }
JsonLDWriter >> renderProject: aProject [
	| members |
	members := OrderedCollection new
		add: (self renderRoleWith: (self renderPerson: aProject director) andRoleName: 'Director' andName: 'members');
		add: (self renderRoleWith: (self renderPerson: aProject coDirector) andRoleName: 'Co-Director' andName: 'members');
		addAll: (
			aProject relatedLifians collect: [ :lifian | 
				self renderRoleWith: (self renderReducedResearcher: lifian) andRoleName: 'Participante' andName: 'members' 
				]);
		yourself.
		
	^ KeyedTree new
		at: '@type' put: 'ResearchProject';
		at: '@id' put: aProject voyageId printString;
		at: 'name' put: aProject title;
		at: 'identifier' put: aProject code;
		at: 'mainEntityOfPage' put: '/' , (ProjectReportComponent relativeUrlFor: aProject);
		at: 'foundingDate' put: aProject startDate asDate yyyymmdd;
		at: 'dissolutionDate' put: aProject endDate asDate yyyymmdd;
		at: 'members' put: members ;
		at: 'funding' put: (self renderGrantWithFunder: (aProject fundingAgency) andAmount: (aProject amount));
		at: 'description' put: aProject summary;
		at: 'parentOrganization' put: self renderLifiaAsOrganization;
		yourself
]

{ #category : #rendering }
JsonLDWriter >> renderProjectList: aCollection [
	^ self
		renderList: (aCollection collect: [ :each | self renderProject: each ])
		withName: 'Proyectos'
]

{ #category : #rendering }
JsonLDWriter >> renderPublication: aPublication [
	^ aPublication asJsonLDWithWriter: self
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderPublicationsByType: aProjectReport [
	| publicationLists |
	publicationLists := OrderedCollection new
		add:
			(self
				renderPublicationsWithName: 'Publicaciones en revistas'
				andPublications: aProjectReport articlePublications);
		add:
			(self
				renderPublicationsWithName: 'Publicaciones en conferencias'
				andPublications: aProjectReport inproceedingsPublications);
		add:
			(self
				renderPublicationsWithName: 'Libros'
				andPublications: aProjectReport bookPublications);
		add:
			(self
				renderPublicationsWithName: 'Partes de libros'
				andPublications: aProjectReport inbookPublications);
		add:
			(self
				renderPublicationsWithName: 'Otras publicaciones'
				andPublications: aProjectReport miscPublications);
		yourself.
	^ self renderList: publicationLists withName: 'Publicaciones'
]

{ #category : #rendering }
JsonLDWriter >> renderPublicationsWithName: aString andPublications: aCollection [
	^ self
		renderList: (aCollection collect: [ :each | self renderPublication: each ])
		withName: aString
]

{ #category : #rendering }
JsonLDWriter >> renderRawReference: aRawReference [
	| tree |
	tree := KeyedTree new
		at: '@type' put: 'ScholarlyArticle';
		at: 'name' put: aRawReference asSummary;
		yourself.
	
	aRawReference selfArchivingUrl
		ifNotNilNotEmpty: [ :it | tree at: 'url' put: it ].
	
	^ tree
]

{ #category : #writing }
JsonLDWriter >> renderReducedResearcher: aLifian [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Person';
		at: 'url'
			put:
			'http://memorias.lifia.info.unlp.edu.ar/researcher/'
				, aLifian institutionalEmail;
		at: 'email' put: aLifian institutionalEmail;
		at: 'givenName' put: aLifian firstName;
		at: 'familyName' put: aLifian lastName;
		at: 'mainEntityOfPage'
			put: '/' , (ResearcherReportComponent relativeUrlFor: aLifian);
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderReportThesisList: aProjectReport [
	^ self
		renderList: (aProjectReport thesis collect: [ :each | self renderThesis: each ])
		withName: 'Tesis y trabajos finales de carrera'
]

{ #category : #rendering }
JsonLDWriter >> renderResearcher: aLifian [
	| researcherDict affiliations |
	
	affiliations := OrderedCollection with: self renderLifiaAsOrganization.
	"This is not the best way to represent affiliations, but we would need them in a collection"
	aLifian affiliations
		ifNotNilNotEmpty: [ affiliations add: (self renderOrganizationWithName: aLifian affiliations) ].
	
	researcherDict := KeyedTree new
		at: '@type' put: 'Person';
		at: '@id' put: aLifian voyageId printString;
		at: 'givenName' put: aLifian firstName;
		at: 'familyName' put: aLifian lastName;
		at: 'affiliation' put: affiliations;
		at: 'contactPoints' put: (self renderResearcherContactPoints: aLifian);
		yourself.
	
	aLifian institutionalEmail
		ifNotNilNotEmpty: [ researcherDict at: 'email' put: aLifian institutionalEmail ].
	
	aLifian highestDegree
		ifNotNilNotEmpty: [ researcherDict at: 'hasCredential' put: (self renderDegreeWithName: aLifian highestDegree) ].
		
	^ researcherDict 
]

{ #category : #rendering }
JsonLDWriter >> renderResearcherContactPoints: researcher [
	| contactPoints |
	contactPoints := OrderedCollection new.
	researcher orcid
		ifNotNilNotEmpty: [ contactPoints add: (self renderContactPointWithType: 'ORCID' andUrl: researcher orcid) ].
	researcher webPage
		ifNotNilNotEmpty: [ contactPoints add: (self renderContactPointWithType: 'Web page' andUrl: researcher webPage) ].
	researcher researchGateProfile
		ifNotNilNotEmpty: [ contactPoints add: (self renderContactPointWithType: 'Research Gate' andUrl: researcher researchGateProfile) ].
	researcher googleResearchProfile
		ifNotNilNotEmpty: [ contactPoints add: (self renderContactPointWithType: 'Google Scholar' andUrl: researcher googleResearchProfile) ].
	researcher dblpProfile
		ifNotNilNotEmpty: [ contactPoints add: (self renderContactPointWithType: 'DBLP' andUrl: researcher dblpProfile) ].
	
	^ contactPoints
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderRoleWith: aDictionary andRoleName: aString andName: anotherString [
	^ KeyedTree new
		at: '@type' put: 'Role';
		at: 'roleName' put: aString;
		at: anotherString put: aDictionary;
		yourself 
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderScholarship: aScholarship [
	| tree fundedItem contributors |
	contributors := OrderedCollection new.
	
	aScholarship director
		ifNotNilNotEmpty: [ contributors add: 
			(self renderRoleWith: (self renderPerson: aScholarship director) andRoleName: 'Director' andName: 'contributor') ].
		
	aScholarship coDirector
		ifNotNilNotEmpty: [ contributors add: 
			(self renderRoleWith: (self renderPerson: aScholarship coDirector) andRoleName: 'Co-Director' andName: 'contributor') ].
		
	fundedItem := KeyedTree new
		at: '@type' put: 'CreativeWork';
		at: 'name' put: aScholarship title;
		at: 'author' put: (self renderPerson: aScholarship student);
		at: 'contributor' put: contributors;
		at: 'description' put: aScholarship summary;
		yourself.
	
	tree := KeyedTree new
		at: '@type' put: 'Grant';
		at: 'startDate' put: aScholarship startDate yyyymmdd;
		at: 'endDate' put: aScholarship endDate yyyymmdd;
		at: 'fundedItem' put: fundedItem;
		yourself.

	aScholarship fundingAgency
		ifNotNilNotEmpty: [ tree at: 'funder' put: (self renderOrganizationWithName: aScholarship fundingAgency) ].

	^ tree
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderScholarships: aProjectReport [
	| grants |
	grants := aProjectReport scholarships
		collect: [ :each | self renderScholarship: each ].
	^ self renderList: grants withName: 'Becas y pasantías'
]

{ #category : #rendering }
JsonLDWriter >> renderTheses: aCollection withName: aString [
	^ self
		renderList: (aCollection collect: [ :each | self renderThesis: each ])
		withName: aString
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderThesesByType: aGeneralReport [
	| list |
	list := OrderedCollection new
		add:
			(self
				renderTheses: aGeneralReport phdThesis
				withName: 'Tesis de doctorado');
		add:
			(self
				renderTheses: aGeneralReport mastersThesis
				withName: 'Tesis de maestría');
		add:
			(self
				renderTheses: aGeneralReport specializationThesis
				withName: 'Trabajos finales de especialización');
		add:
			(self
				renderTheses: aGeneralReport undergraduateThesis
				withName: 'Tesinas de grado');
		yourself.
	^ self
		renderList: list
		withName: 'Direccion de tesis y trabajos finales'
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderThesis: aThesis [
	| tree contributors |
	contributors := OrderedCollection new.
	aThesis director
		ifNotNilNotEmpty: [ contributors
				add:
					(self renderContributorWithName: aThesis director andTitle: 'Director') ].
	aThesis coDirector
		ifNotNilNotEmpty: [ contributors
				add:
					(self
						renderContributorWithName: aThesis coDirector
						andTitle: 'Co-Director') ].
	tree := KeyedTree new
		at: '@type' put: 'Thesis';
		at: 'name' put: aThesis title;
		at: 'author' put: (self renderPerson: aThesis student);
		at: 'contributor' put: contributors;
		at: 'description' put: aThesis summary;
		yourself.
	aThesis career
		ifEmpty: [ tree at: 'inSupportOf' put: aThesis level ]
		ifNotEmpty: [ tree at: 'inSupportOf' put: aThesis career ].
	^ tree
]

{ #category : #writing }
JsonLDWriter >> researcherReportAsDictionary: aResearcherReport [	
	^ self renderGraphWith: (
		OrderedCollection new
			add: (self renderResearcher: aResearcherReport researcher);
			add: (self renderPublicationsByType: aResearcherReport);
			add: (self renderProjectList: aResearcherReport projects);
			add: (self renderScholarships: aResearcherReport);
			add: (self renderReportThesisList: aResearcherReport);
			yourself
		)
]
