Class {
	#name : #TabbedScheduleComponent,
	#superclass : #TabbedListComponent,
	#category : 'Lifiometro-Web'
}

{ #category : #callbacks }
TabbedScheduleComponent >> additem [
	| result |
	result := self
		call:
			(ScheduleItemEditorComponent new
				item: ScheduleItem new;
				yourself).
	result ifNotNil: [ self session save: result ]
]

{ #category : #callbacks }
TabbedScheduleComponent >> duplicate: each [
	| copy |
	copy := each copy
		title: '(Copia de) ' , each title;
		startDate:
			(each startDate
				ifNotNil: [ :date | (date asDate addMonths: 12) mmddyyyy ]);
		endDate:
			(each endDate
				ifNotNil: [ :date | (date asDate addMonths: 12) mmddyyyy ]);
		yourself.
	self session save: copy
]

{ #category : #callbacks }
TabbedScheduleComponent >> edit: each [
	| result |
	result := self call: (ScheduleItemEditorComponent item: each).
	result ifNil: [ ^ self ].
	self session save: result
]

{ #category : #initialization }
TabbedScheduleComponent >> initializeGroupingAndFilteringAdapter [
	groupingAndFilteringAdapter := GroupingAndFilteringListAdapter
		groupingBlock: [ :each | self monthNameFor: each ]
		filteringBlock: [ :each :filter | 
			| startDate endDate |
			startDate := [ each startDate asDate ]
				on: Error
				do: [ Date today ].
			endDate := [ each endDate asDate ]
				on: Error
				do: [ Date today ].
			filter between: startDate year and: endDate year ]
		filters: (Date today year + 1 to: Date today year - 5 by: -1).
	groupingAndFilteringAdapter selectedFilter: Date today year
]

{ #category : #accessing }
TabbedScheduleComponent >> items [
	^ LifiometroRepository singleton scheduleItems reject: #trashed
]

{ #category : #initialization }
TabbedScheduleComponent >> monthNameFor: each [
	[ each startDate asDate ]
		on: Error
		do: [ ^ self monthNames at: Date today monthIndex  ].
	^ self monthNames at: each startDate asDate monthIndex
]

{ #category : #initialization }
TabbedScheduleComponent >> monthNames [
	^ {'Enero' . 'Febrero' . 'Marzo' . 'Abril' . 'Mayo' . 'Junio' . 'Julio'.
	'Agosto' . 'Septiembre' . 'Octubre' . 'Noviembre' . 'Diciembre'}
]

{ #category : #callbacks }
TabbedScheduleComponent >> print [
	parent show: PritableTabbedScheduleComponent new
]

{ #category : #rendering }
TabbedScheduleComponent >> render: each on: html [
	html
		paragraph: [ html
				strong: each title;
				text: ' (';
				text: each type;
				text: ')';
				break.
			html
				text: 'Fechas: ';
				text: each startDate;
				text: ' - ';
				text: each endDate;
				break.
			html
				text: 'Notas: ';
				text: each notes;
				break.
			html text: 'URL: '.
			html anchor
				target: '_blank';
				url: each moreInfoUrl;
				with: each moreInfoUrl.
			html break ]
]

{ #category : #rendering }
TabbedScheduleComponent >> renderActionsFor: each on: html [
	super renderActionsFor: each on: html.
	html space.
	html anchor
		callback: [ self duplicate: each ];
		title: 'Duplicar al próximo año';
		with: [ html tbsGlyphIcon iconForward ]
]

{ #category : #rendering }
TabbedScheduleComponent >> renderButtonsOn: html [
	html div
		style: 'padding-top:10px;padding-bottom:10px';
		with: [ html anchor
				callback: [ self additem ];
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Agregar' ].
			html space.
			html anchor
				callback: [ self print ];
				target: '_blank';
				with: [ html tbsButton
						beDefault;
						beSmall;
						with: 'Imprimir' ] ]
]

{ #category : #rendering }
TabbedScheduleComponent >> renderItemsOn: html [
	| items |
	self monthNames
		do: [ :each | 
			items := groupingAndFilteringAdapter group: each.
			items notEmpty
				ifTrue: [ html heading
						level: 3;
						with: each.
					self renderItems: items on: html ] ]
]
