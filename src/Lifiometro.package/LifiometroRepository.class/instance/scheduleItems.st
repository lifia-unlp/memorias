accessing
scheduleItems
	^ ScheduleItem selectAll reject: [ :each | each trashed ]