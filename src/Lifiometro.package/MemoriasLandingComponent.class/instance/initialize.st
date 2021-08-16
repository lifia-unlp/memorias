initialization
initialize
	super initialize.
	loginComponent := LoginFormComponent new parent: self.
	registerComponent := RegisterFormComponent new parent: self.
	activeComponent := loginComponent