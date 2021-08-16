callbacks
duplicate: each
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