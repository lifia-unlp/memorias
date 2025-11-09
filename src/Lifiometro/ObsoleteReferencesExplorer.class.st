Class {
	#name : #ObsoleteReferencesExplorer,
	#superclass : #WAComponent,
	#instVars : [
		'renderer'
	],
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #rendering }
ObsoleteReferencesExplorer >> initialize [

	super initialize.
	renderer := InternalNewsRenderer new
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> renderContentOn: html [

	| classesToCheck |
	html anchor
		callback: [ self answer: nil ];
		with: 'Back'.
	html break.

	classesToCheck := {
		                  BibtexReference.
		                  RawReference.
		                  Project.
		                  Scholarship.
		                  Thesis }.
	classesToCheck do: [ :each |
		self renderObsoleteReferencesForClass: each on: html ]
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> renderObsoleteReferencesForClass: someClass on: html [

	| obsoleteReferencesReports |
	obsoleteReferencesReports := (someClass selectAll collect:
		                              #obsoleteReferencesReport) select:
		                             #requiresAttention.
	html heading
		level: 3;
		with: someClass name.
	html unorderedList: [
		obsoleteReferencesReports do: [ :report |
			html listItem: [
				report entry renderAsNewsSubjectWith: renderer on: html.
				self
					renderSelector: #obsoleteThesis
					of: report
					labeled: 'Thesis'
					on: html.

				self
					renderSelector: #obsoleteProjects
					of: report
					labeled: 'Projects'
					on: html.
				self
					renderSelector: #obsoleteLifians
					of: report
					labeled: 'Lifians'
					on: html ] ] ]
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> renderSelector: selector of: report labeled: label on: html [

	| obsoleteElements |
	obsoleteElements := report perform: selector.
	obsoleteElements ifEmpty: [ ^ self ].
	html listItem: [
		html text: label.
		html unorderedList: [
			obsoleteElements do: [ :each |
				each renderAsNewsSubjectWith: renderer on: html ] ] ]
]
