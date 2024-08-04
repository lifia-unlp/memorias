Class {
	#name : #ThesisReportComponent,
	#superclass : #ProfileReportComponent,
	#category : #'Lifiometro-Reports'
}

{ #category : #urls }
ThesisReportComponent class >> relativeUrl [
	^ 'thesis-profile'
]

{ #category : #urls }
ThesisReportComponent class >> relativeUrlFor: item [
	^ self relativeUrl, '?vid=' , item voyageId printString
]

{ #category : #rendering }
ThesisReportComponent >> fetchReport [
	| void project |
	void := self requestContext request at: 'vid'.
	void ifNil: [ ^ nil ].
	project := LifiometroRepository singleton thesisWithVoyageId: void.
	project ifNil: [ ^ nil ].
	^ LifiometroRepository singleton reportForThesis: project
]

{ #category : #rendering }
ThesisReportComponent >> renderPropertiesOn: html [

	html heading level2 with: 'Ficha técnica'.
	html table: [
		html tableRow: [
			html
				tableData: 'Título:';
				tableData: report thesis title ].
		html tableRow: [
			html
				tableData: 'Alumno:';
				tableData: report thesis student ].
		html tableRow: [
			html
				tableData: 'Inicio:';
				tableData: report thesis startDate asDate printString ].
		report thesis endDate ifNotNil: [ :it |
			html tableRow: [
				html
					tableData: 'Fecha de defensa:';
					tableData: it asDate printString ] ].
		html tableRow: [
			html
				tableData: 'Dirección:';
				tableData: report thesis director ].
		report thesis coDirector ifNotNilNotEmpty: [ :it |
			html tableRow: [
				html
					tableData: 'Co-Dirección:';
					tableData: it ] ].
		report thesis otherAdvisors ifNotNilNotEmpty: [ :it |
			html tableRow: [
				html
					tableData: 'Asesoramiento:';
					tableData: it ] ].
		report thesis website ifNotNilNotEmpty: [ :website |
			html tableRow: [
				html
					tableData: 'Sitio web:';
					tableData: [
						html anchor
							url: website;
							target: '_blank';
							with: website ] ] ].
		report thesis selfArchivingUrl ifNotNilNotEmpty: [ :it |
			html tableRow: [
				html
					tableData: 'Informe final:';
					tableData: [
						html anchor
							target: '_blank';
							url: it;
							with: it ] ] ].
		html tableRow: [
			html
				tableData: 'Participantes (del LIFIA)';
				tableData: [
					report relatedLifians
						do: [ :each |
							html anchor
								target: '_blank';
								url: '/' , (ResearcherReportComponent relativeUrlFor: each);
								with: each fullName ]
						separatedBy: [ html text: ', ' ] ] ] ].
	html heading level2 with: 'Resumen'.
	html paragraph: report thesis summary
]

{ #category : #rendering }
ThesisReportComponent >> renderResearchersOn: html [
]

{ #category : #rendering }
ThesisReportComponent >> renderScholarshipsOn: html [

]

{ #category : #rendering }
ThesisReportComponent >> renderThesisOn: html [
	
]

{ #category : #rendering }
ThesisReportComponent >> renderTitleOn: html [
	html heading level1 with: report thesis title
]
