Class {
	#name : #JsonLDWriter,
	#superclass : #Object,
	#category : #'Lifiometro-Reports'
}

{ #category : #'as yet unclassified' }
JsonLDWriter >> grantWithFunder: aString andAmount: aNumber [
	^ KeyedTree new
		at: '@type' put: 'MonetaryGrant';
		at: 'funder' put: (self organizationWithName: aString);
		at: 'amount' put: (self monetaryAmountWithValue: aNumber andCurrency: 'ARG');
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> graphWith: aCollection [
	^ KeyedTree new
		at: '@context' put: 'http://schema.org';
		at: '@graph' put: aCollection;
		yourself 
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> itemListWithName: aString andElements: aCollection [
	^ KeyedTree new
		at: '@type' put: 'ItemList';
		at: 'name' put: aString;
		at: 'itemListElement' put: aCollection;
		yourself 
]

{ #category : #writing }
JsonLDWriter >> lifiaAsDictionary [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Organization';
		at: '@id' put: 'main-organization';
		at: 'name' put: 'Centro de Investigación LIFIA';
		at: 'url' put: 'http://www.lifia.info.unlp.edu.ar/';
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> monetaryAmountWithValue: aNumber andCurrency: aString [
	^ KeyedTree new
		at: '@type' put: 'MonetaryAmount';
		at: 'currency' put: aString;
		at: 'value' put: aNumber;
		yourself 
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> organizationWithName: aString [
	^ KeyedTree new
		at: '@type' put: 'Organization';
		at: 'name' put: aString;
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> personWithName: aString [
	^ KeyedTree new 
		at: '@type' put: 'Person';
		at: 'name' put: aString;
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> personWithName: aString andUrl: anotherString [
	^ (self personWithName: aString)
		at: 'mainEntityOfPage' put: anotherString;
		yourself
]

{ #category : #writing }
JsonLDWriter >> projectAsDictionary: aProject [
	| members |
	members := OrderedCollection new
		add: (self roleWith: (self personWithName: aProject director) andRoleName: 'Director' andName: 'members');
		add: (self roleWith: (self personWithName: aProject coDirector) andRoleName: 'Co-Director' andName: 'members');
		addAll: (
			aProject relatedLifians collect: [ :lifian | 
				self roleWith: (self researcherWithNameAndUrl: lifian) andRoleName: 'Participante' andName: 'members' 
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
		at: 'funding' put: (self grantWithFunder: (aProject fundingAgency) andAmount: (aProject amount));
		at: 'description' put: aProject summary;
		at: 'parentOrganization' put: self lifiaAsDictionary;
		yourself
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> projectReportAsDictionary: aProjectReport [
	| topLevelItems |
	topLevelItems := OrderedCollection new
		add: (self projectAsDictionary: aProjectReport project);
		add: (self reportPublicationsByType: aProjectReport);
		add: (self renderReportScholarships: aProjectReport);
		add: (self renderReportThesisList: aProjectReport);
		yourself.
	 
	^ self graphWith: topLevelItems 
]

{ #category : #writing }
JsonLDWriter >> publicationAsDictionary: aPublication [
	| dict |
	dict := Dictionary new.
	dict
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'ScholarlyArticle'.
	aPublication selfArchivingUrl
		ifNotNil: [ :it | dict at: 'url' put: it ].
	dict at: 'description' put: aPublication asSummary.
	^ dict
]

{ #category : #rendering }
JsonLDWriter >> renderBibtexReference: aBibtexReference [
	| tree |
	tree := KeyedTree new
		at: '@type' put: 'ScholarlyArticle';
		at: 'name' put: aBibtexReference title;
		at: 'author' put: (
			aBibtexReference authorsAsCollection collect: [ :each | self personWithName: each ]);
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
JsonLDWriter >> renderDegreeWithName: aString [
	^ KeyedTree new
		at: '@type' put: 'EducationalOccupationalCredential';
		at: 'name' put: aString;
		yourself
]

{ #category : #rendering }
JsonLDWriter >> renderGeneralReport: aGeneralReport [
	^ self
		graphWith:
			(OrderedCollection new
				add: (self reportPublicationsByType: aGeneralReport);
				add: (self reportThesisByType: aGeneralReport);
				add: (self renderReportScholarships: aGeneralReport);
				add:
					(self
						itemListWithName: 'Proyectos'
						andElements:
							(aGeneralReport projects
								collect: [ :each | self projectAsDictionary: each ]));
				add: (self reportParticipantsByType: aGeneralReport);
				add: self lifiaAsDictionary;
				yourself)
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

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderOrganizationWithName: aString [
	^ KeyedTree new 
		at: '@type' put: 'Organization';
		at: 'name' put: aString;
		yourself
]

{ #category : #writing }
JsonLDWriter >> renderProjectListWithActive: aCollection andFinishedProjects: anotherCollection [
	| activeList finishedList |
	activeList := self
		itemListWithName: 'Proyectos en curso'
		andElements: (aCollection collect: [ :each | self projectAsDictionary: each ]).
	finishedList := self
		itemListWithName: 'Proyectos finalizados'
		andElements:
			(anotherCollection collect: [ :each | self projectAsDictionary: each ]).
	^ self
		graphWith:
			(OrderedCollection new
				add: activeList;
				add: finishedList;
				yourself)
]

{ #category : #rendering }
JsonLDWriter >> renderPublication: aPublication [
	^ aPublication asJsonLDWithWriter: self
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

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderReportScholarships: aProjectReport [
	| grants |
	grants := aProjectReport scholarships collect: [ :each | self renderScholarship: each ].
	
	^ self itemListWithName: 'Becas y pasantías' andElements: grants
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderReportThesis: aThesis [
	| tree contributors |
	contributors := OrderedCollection new.
	aThesis director
		ifNotNilNotEmpty: [ 
			contributors add: (self roleWith: (self personWithName: aThesis director) andRoleName: 'Director' andName: 'contributor') ].
	aThesis coDirector
		ifNotNilNotEmpty: [ 
			contributors add: (self roleWith: (self personWithName: aThesis coDirector) andRoleName: 'Co-Director' andName: 'contributor') ].
	
	tree := KeyedTree new
		at: '@type' put: 'Thesis';
		at: 'name' put: aThesis title;
		at: 'author' put: (self personWithName: aThesis student);
		at: 'contributor' put: contributors;
		at: 'description' put: aThesis summary;
		yourself.
		
	aThesis career
		ifEmpty: [ tree at: 'inSupportOf' put: aThesis level ]
		ifNotEmpty: [ tree at: 'inSupportOf' put: aThesis career ]. 
	
	^ tree
	
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> renderReportThesisList: aProjectReport [
	^ self itemListWithName: 'Tesis y trabajos finales de carrera' andElements: 
		(aProjectReport thesis collect: [ :each | self renderReportThesis: each ])
	
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
JsonLDWriter >> renderScholarship: aScholarship [
	| tree fundedItem contributors |
	contributors := OrderedCollection new.
	
	aScholarship director
		ifNotNilNotEmpty: [ contributors add: 
			(self roleWith: (self personWithName: aScholarship director) andRoleName: 'Director' andName: 'contributor') ].
		
	aScholarship coDirector
		ifNotNilNotEmpty: [ contributors add: 
			(self roleWith: (self personWithName: aScholarship coDirector) andRoleName: 'Co-Director' andName: 'contributor') ].
		
	fundedItem := KeyedTree new
		at: '@type' put: 'CreativeWork';
		at: 'name' put: aScholarship title;
		at: 'author' put: (self personWithName: aScholarship student);
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
JsonLDWriter >> reportParticipantsByType: aGeneralReport [
	| list |
	list := OrderedCollection new
		add:
			(self
				itemListWithName: 'Investigadores'
				andElements:
					((aGeneralReport researchersWithPosition: 'Investigador')
						collect: [ :each | self researcherAsDictionary: each ]));
		yourself.
	^ self itemListWithName: 'Participantes' andElements: list
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> reportPublicationsByType: aProjectReport [
	| publicationLists |
	publicationLists := OrderedCollection new 
		add: (
			self itemListWithName: 'Publicaciones en revistas' andElements: (
				aProjectReport articlePublications collect: [ :each | self renderPublication: each])
			);
		add: (
			self itemListWithName: 'Publicaciones en conferencias' andElements: (
				aProjectReport inproceedingsPublications collect: [ :each | self renderPublication: each])
			);
		add: (
			self itemListWithName: 'Libros' andElements: (
				aProjectReport bookPublications collect: [ :each | self renderPublication: each])
			);
		add: (
			self itemListWithName: 'Partes de libros' andElements: (
				aProjectReport inbookPublications collect: [ :each | self renderPublication: each])
			);
		add: (
			self itemListWithName: 'Otras publicaciones' andElements: (
				aProjectReport miscPublications collect: [ :each | self renderPublication: each])
			);
		yourself.
	
	^ self itemListWithName: 'Publicaciones' andElements: publicationLists
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> reportThesisByType: aGeneralReport [
	| list |
	list := OrderedCollection new
		add:
			(self
				itemListWithName: 'Tesis de doctorado'
				andElements:
					(aGeneralReport phdThesis
						collect: [ :each | self renderReportThesis: each ]));
		add:
			(self
				itemListWithName: 'Tesis de maestría'
				andElements:
					(aGeneralReport mastersThesis
						collect: [ :each | self renderReportThesis: each ]));
		add:
			(self
				itemListWithName: 'Trabajos finales de especialización'
				andElements:
					(aGeneralReport specializationThesis
						collect: [ :each | self renderReportThesis: each ]));
		add:
			(self
				itemListWithName: 'Tesinas de grado'
				andElements:
					(aGeneralReport undergraduateThesis 
						collect: [ :each | self renderReportThesis: each ]));
		yourself.
	^ self
		itemListWithName: 'Direccion de tesis y trabajos finales'
		andElements: list
]

{ #category : #writing }
JsonLDWriter >> researcherAsDictionary: aResearcher [
	^ Dictionary new
		at: '@context' put: 'https://schema.org';
		at: '@type' put: 'Person';
		at: 'url'
			put:
			'http://memorias.lifia.info.unlp.edu.ar/researcher/'
				, aResearcher institutionalEmail;
		at: 'email' put: aResearcher institutionalEmail;
		at: 'givenName' put: aResearcher firstName;
		at: 'familyName' put: aResearcher lastName;
		yourself
]

{ #category : #writing }
JsonLDWriter >> researcherReportAsDictionary: aResearcherReport [
	| researcherDict researcher affiliations projectList |
	researcher := aResearcherReport researcher.
	
	affiliations := OrderedCollection with: self lifiaAsDictionary.
	"This is not the best way to represent affiliations, but we would need them in a collection"
	researcher affiliations
		ifNotNilNotEmpty: [ affiliations add: (self organizationWithName: researcher affiliations) ].
	
	researcherDict := KeyedTree new
		at: '@type' put: 'Person';
		at: '@id' put: researcher voyageId printString;
		at: 'givenName' put: researcher firstName;
		at: 'familyName' put: researcher lastName;
		at: 'affiliation' put: affiliations;
		at: 'contactPoints' put: (self renderResearcherContactPoints: researcher);
		yourself.
	
	researcher institutionalEmail
		ifNotNilNotEmpty: [ researcherDict at: 'email' put: researcher institutionalEmail ].
	
	researcher highestDegree
		ifNotNilNotEmpty: [ researcherDict at: 'hasCredential' put: (self renderDegreeWithName: researcher highestDegree) ].
	
	projectList := self itemListWithName: 'Proyectos' andElements: (
		aResearcherReport projects collect: [ :each | self projectAsDictionary: each ]).
	
	^ self graphWith: (
		OrderedCollection new
			add: researcherDict;
			add: (self reportPublicationsByType: aResearcherReport);
			add: projectList;
			add: (self renderReportScholarships: aResearcherReport);
			add: (self renderReportThesisList: aResearcherReport);
			yourself
		)
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> researcherWithNameAndUrl: aLifian [
	| person |
	person := self personWithName: (aLifian fullName) andUrl: '/' , (ResearcherReportComponent relativeUrlFor: aLifian).
	person at: '@id' put: aLifian voyageId printString.	
	^ person
]

{ #category : #'as yet unclassified' }
JsonLDWriter >> roleWith: aDictionary andRoleName: aString andName: anotherString [
	^ KeyedTree new
		at: '@type' put: 'Role';
		at: 'roleName' put: aString;
		at: anotherString put: aDictionary;
		yourself 
]
