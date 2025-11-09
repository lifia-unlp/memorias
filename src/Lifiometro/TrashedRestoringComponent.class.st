Class {
	#name : #TrashedRestoringComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Web-Admin'
}

{ #category : #rendering }
TrashedRestoringComponent >> renderContentOn: html [

	| trashedItems renderer |
	html break.
	html anchor
		callback: [ self answer: nil ];
		with: 'Back'.

	renderer := InternalNewsRenderer new.
	trashedItems := {
		                BibtexReference.
		                RawReference.
		                Lifian.
		                Project.
		                Scholarship.
		                Thesis } collect: [ :somePersistentClass |
		                somePersistentClass
			                selectMany: { (#trashed -> true) }
			                sortBy:
			                { (#lastEditedOn -> VOOrder descending) }
				                asDictionary ].

	trashedItems do: [ :trashedCollection |
		html heading
			level: 3;
			with: trashedCollection first class name.
		html unorderedList: [
			trashedCollection do: [ :item |
				html listItem: [
					html text: item lastEditedOn printString , ' - '.
					item renderAsNewsSubjectWith: renderer on: html.
					html space.
					html anchor
						callback: [ self restore: item ];
						with: '[RESTORE]' ] ] ] ]
]

{ #category : #rendering }
TrashedRestoringComponent >> restore: item [

	item trashed: false.
	item addTag: 'recently-restored'.
	self session save: item
]
