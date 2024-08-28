Class {
	#name : #LifianListComponent,
	#superclass : #TabbedListComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #rendering }
LifianListComponent >> addLifian [
	| result |
	result := self
		call:
			(LifianEditorComponent new
				item: Lifian new;
				yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #rendering }
LifianListComponent >> edit: each [
	| result |
	result := self call: (LifianEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result
]

{ #category : #rendering }
LifianListComponent >> emailsStringFor: each [
	^ ({each personalEmail.
	each institutionalEmail} select: #notNil) asCommaString
]

{ #category : #rendering }
LifianListComponent >> initializeGroupingAndFilteringAdapter [
	| end |
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | 'default' ]
		filteringBlock: [ :each :filter | 
			end := each endDate
				ifNil: [ '1/1/2050' asDate ]
				ifNotNil: [ :it | it asDate ].
			filter between: each startDate asDate year and: end year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year
]

{ #category : #accessing }
LifianListComponent >> items [
	^ LifiometroRepository singleton lifians
		asSortedCollection: [ :a :b | a lastName < b lastName ]
]

{ #category : #rendering }
LifianListComponent >> render: each on: html [
	html
		paragraph: [ html
				strong: each lastName , ', ' , each firstName;
				break.
			each category
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Categoría de incentivos: ' , it;
						break ].
			each sicadiCategory
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Categoría SICADI: ' , it;
						break ].
			each positionAtCIC
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Cargo en CICPBA: ' , it;
						break ].
			each positionAtCONICET
				ifNotNilNotEmpty: [ :it | 
					html
						text: 'Cargo en CONICET: ' , it;
						break ].
			html
				text: 'Cargo docente en UNLP: ' , each positionAtUnlp;
				break.
			html text: 'E-mails: ' , (self emailsStringFor: each) ]
]

{ #category : #rendering }
LifianListComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self addLifian ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ] ]
]

{ #category : #rendering }
LifianListComponent >> renderItemsOn: html [
	self
		renderItems: (groupingAndFilteringAdapter group: 'default')
		on: html
]

{ #category : #rendering }
LifianListComponent >> renderRelatedLifiansFor: each on: html [
	^ self
]

{ #category : #rendering }
LifianListComponent >> renderRelatedProjectsFor: each on: html [
	^ self
]

{ #category : #rendering }
LifianListComponent >> researchSummaryStringFor: each [
	| positions |
	positions := OrderedCollection new.
	each category
		ifNotNil: [ :it | positions add: 'Categoria de Incentivos: ' , it ].
	each positionAtCIC
		ifNotNil: [ :it | positions add: 'Cargo CICPBA: ' , it ].
	each positionAtCONICET
		ifNotNil: [ :it | positions add: 'Cargo CONICET: ' , it ].
	^ positions asCommaString
]
