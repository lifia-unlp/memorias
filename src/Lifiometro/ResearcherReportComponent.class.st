"
| app |
app := WAAdmin register: ResearcherReportComponent asApplicationAt: 'researcher-profile'.
app
        addLibrary: TBSDeploymentLibrary
"
Class {
	#name : #ResearcherReportComponent,
	#superclass : #ProfileReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
ResearcherReportComponent class >> relativeUrl [
	^ 'researcher-profile'
]

{ #category : #urls }
ResearcherReportComponent class >> relativeUrlFor: aResearcher [
	^ self relativeUrl, '?vid=' , aResearcher voyageId printString
]

{ #category : #rendering }
ResearcherReportComponent >> fetchReport [
	| void project |
	void := self requestContext request at: 'vid'.
	void ifNil: [ ^ nil ].
	project := LifiometroRepository singleton researcherWithVoyageId: void.
	project ifNil: [ ^ nil ].
	^ LifiometroRepository singleton reportForResearcher: project
]

{ #category : #rendering }
ResearcherReportComponent >> renderExternalLinksOn: html [
	report researcher orcid 
		ifNotNilNotEmpty: [ :it | 
			html text: 'ORCID: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher webPage
		ifNotNilNotEmpty: [ :it | 
			html text: 'Página web: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher researchGateProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en Research Gate: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher googleResearchProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en Google Scholar: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher dblpProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en DBLP: '.
			html space.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	html break
]

{ #category : #rendering }
ResearcherReportComponent >> renderPropertiesOn: html [
	html
		paragraph: [ html
				text: 'Nombre: ' , report researcher firstName;
				break.
			html
				text: 'Apellido: ' , report researcher lastName;
				break.
			report researcher startDate
				ifNotNil: [ :it | 
					html
						text: 'Ingreso: ' , it mmddyyyy;
						break ].
			report researcher endDate
				ifNotNil: [ :it | 
					html
						text: 'Egreso: ' , it mmddyyyy;
						break ].
			report researcher highestDegree
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Título máximo: ' , it;
						break ].
			report researcher institutionalEmail
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'E-mail: ' , it;
						break ].
			report researcher affiliations
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Afiliaciones: ' , it;
						break ].
			self renderExternalLinksOn: html ]
]

{ #category : #rendering }
ResearcherReportComponent >> renderResearchersOn: html [
	^ self
]

{ #category : #rendering }
ResearcherReportComponent >> renderTitleOn: html [
	html heading level1 with: report researcher fullName
]
