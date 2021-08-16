accessing
projects
	^ Project selectAll reject: [ :each | each trashed ]