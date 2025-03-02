Class {
	#name : #PublicResearchStaffListComponent,
	#superclass : #SimpleListReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
PublicResearchStaffListComponent class >> relativeUrl [
	^ 'research-staff'
]

{ #category : #initialization }
PublicResearchStaffListComponent >> prepareSections [
	"send addSectionTitled:with: as necessary 
activeMembers supportStaff graduateStudents undergraduateStudents externalMembers pastMembers

Investigador
 Personal de apoyo
 Estudiante de grado
 Estudiante de posgrado
 Investigador externo
"

	| allResearchers activeMembers pastMembers |
	allResearchers := self researchers asSortedCollection: [ :a :b |
		                  a fullName < b fullName ].
	activeMembers := allResearchers select: #isActive.
	pastMembers := allResearchers reject: #isActive.
	self
		addSectionTitled: 'Investigadores'
		with: (activeMembers select: [ :each |
				 each positionAtLIFIA = 'Investigador' ]).
	self
		addSectionTitled: 'Estudiantes de grado'
		with: (activeMembers select: [ :each |
				 each positionAtLIFIA = 'Estudiante de grado' ]).
	self
		addSectionTitled: 'Estudiantes de posgrado'
		with: (activeMembers select: [ :each |
				 each positionAtLIFIA = 'Estudiante de posgrado' ]).
	self
		addSectionTitled: 'Personal de apoyo'
		with: (activeMembers reject: [ :each |
				 { 'Investigador'. 'Estudiante de grado'. 'Estudiante de posgrado'.
				 'Investigador externo' } includes: each positionAtLIFIA ]).
	self
		addSectionTitled: 'Investigadores externos'
		with: (activeMembers select: [ :each |
				 each positionAtLIFIA = 'Investigador externo' ]).
	self addSectionTitled: 'Antiguos miembros' with: pastMembers
]

{ #category : #initialization }
PublicResearchStaffListComponent >> renderItem: item on: html [

	html paragraph
		style: 'line-height: 1.25;';
		with: [
			html strong: item fullName.
			html text: '. '.
			item highestDegree ifNotNilNotEmpty: [ :it | html text: it , '. ' ].
			item positionAtUnlp ifNotNilNotEmpty: [ :it |
					it ~= 'N/A' ifTrue: [ html text: it , ' de la UNLP. ' ] ].
			item positionAtCONICET ifNotNilNotEmpty: [ :it |
					it ~= 'N/A' ifTrue: [ html text: it , ' del CONICET. ' ] ].
			item positionAtCIC ifNotNilNotEmpty: [ :it |
					it ~= 'N/A' ifTrue: [ html text: it , ' de la CICPBA. ' ] ].
			item endDate
				ifNil: [
					html text:
							'En el LIFIA desde el año ' , item startDate year greaseString
							, '. ' ]
				ifNotNil: [ :endDate |
					html text: '(' , item startDate year greaseString , ' - '
							, item endDate year greaseString , ') ' ].

			item institutionalEmail ifNotEmpty: [ :email |
					html text: ' <' , email , '> ' ].
			html anchor
				target: '_blank';
				title: 'Ver ficha  detallada';
				url: '/' , (ResearcherReportComponent relativeUrlFor: item);
				with: [ html tbsGlyphIcon iconZoomIn ] ]
]

{ #category : #initialization }
PublicResearchStaffListComponent >> reportTitle [

	^ 'Personal de investigación'
]

{ #category : #initialization }
PublicResearchStaffListComponent >> researchers [ 
	^ LifiometroRepository singleton researchers
]
