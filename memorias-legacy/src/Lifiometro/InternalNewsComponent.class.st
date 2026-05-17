Class {
	#name : #InternalNewsComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Web'
}

{ #category : #'as yet unclassified' }
InternalNewsComponent >> getRelevantNews [

	^ RepositoryAuditRecord selectAll
		  ifEmpty: [ OrderedCollection new ]
		  ifNotEmpty: [ :it |
			  (it asSortedCollection: [ :a :b | a when > b when ])
				  copyFrom: 1
				  to: (it size min: 50) ]
]

{ #category : #rendering }
InternalNewsComponent >> renderContentOn: html [

	| renderer |
	renderer := InternalNewsRenderer new.

	html tbsPanel: [
		html tbsPanelBody: [
			html tbsTable: [
				html tableHead: [
					html tableData: [ html strong: 'Qué modificó' ].
					html tableData: [ html strong: 'Cuándo' ].
					html tableData: [ html strong: 'Quién' ] ].
				html tableBody: [
					self getRelevantNews do: [ :each |
						html tableRow: [
							html tableData: [ each isRemoval ifTrue: [ html text: '(borró) ' ]. 
								renderer renderAsNews: each what on: html ].
							html tableData: each when printString.
							html tableData: each who email ] ] ] ] ] ]
]
