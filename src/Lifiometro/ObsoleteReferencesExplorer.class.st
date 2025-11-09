Class {
	#name : #ObsoleteReferencesExplorer,
	#superclass : #WAComponent,
	#instVars : [
		'renderer',
		'obsoleteLifians',
		'obsoleteProjects',
		'obsoleteThesis',
		'reportsDictionary'
	],
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #rendering }
ObsoleteReferencesExplorer >> collectReportsFor: aClass [

	| reports |
	reports := (aClass selectAll collect: #obsoleteReferencesReport)
		           select: #requiresAttention.
	reportsDictionary at: aClass put: reports.
	obsoleteLifians addAll:
		(reports collect: [ :each | each obsoleteLifians ]).
	obsoleteProjects addAll:
		(reports collect: [ :each | each obsoleteProjects ]).
	obsoleteThesis addAll:
		(reports collect: [ :each | each obsoleteThesis ])
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> initialize [

	| classesToCheck |
	super initialize.
	renderer := InternalNewsRenderer new.
	obsoleteLifians := Set new.
	obsoleteProjects := Set new.
	obsoleteThesis := Set new.
	reportsDictionary := Dictionary new.
	classesToCheck := {
		                  BibtexReference.
		                  RawReference.
		                  Project.
		                  Scholarship.
		                  Thesis }.
	classesToCheck do: [ :aClass | self collectReportsFor: aClass ]
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> renderContentOn: html [

	html anchor
		callback: [ self answer: nil ];
		with: 'Back'.
	html break.

	reportsDictionary keysAndValuesDo: [ :aClass :reports |
		html heading
			level: 3;
			with: aClass name.
		html unorderedList: [
			reports do: [ :report |
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
						on: html ] ] ] ]
]

{ #category : #rendering }
ObsoleteReferencesExplorer >> renderSelector: selector of: report labeled: label on: html [

	| obsoleteElements |
	obsoleteElements := report perform: selector.
	obsoleteElements ifEmpty: [ ^ self ].
	html unorderedList: [
		obsoleteElements
			do: [ :each |
				each trashed ifTrue: [ html text: '(OBSOLETE) ' ].
				each renderAsNewsSubjectWith: renderer on: html ]
			separatedBy: [ html text: ', ' ] ]
]
