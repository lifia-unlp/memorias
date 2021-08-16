accept/cancel
accept
	newValues associations do: [ :ass | item at: ass key put: ass value ].
	self answer: item