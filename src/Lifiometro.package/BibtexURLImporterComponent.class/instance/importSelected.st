callbacks
importSelected
	selectedArticles do: [ :each | self session save: each ].
	self answer