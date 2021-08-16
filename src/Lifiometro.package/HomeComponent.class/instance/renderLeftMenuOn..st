rendering
renderLeftMenuOn: html
	| tabs |
	tabs := {}.
	self session currentUser enabled
		ifTrue: [ tabs := {'Publicaciones' . 'Proyectos' . 'Becas'.
			'Tesis' . 'Investigadores'}.
			self session currentUser isAdmin
				ifTrue: [ tabs := tabs copyWith: 'Administrar' ] ].
	html
		tbsPanel: [ html
				tbsPanelBody: [ html image url: LifiaFileLibrary / #lifialogoPng.
					html tbsNav
						bePills;
						beStacked;
						with: [ tabs
								do: [ :each | 
									html tbsNavItem
										beActiveIf: each = selectedTab;
										with: [ html anchor
												callback: [ selectedTab := each ];
												with: each ] ].
							self session currentUser enabled
								ifTrue: [ html
										tbsNavItem: [ html anchor
												target: '_blank';
												callback: [ self showReports ];
												with: 'Reportes' ] ].
							html
								tbsNavItem: [ html anchor
										callback: [ self logout ];
										with: 'Salir' ] ] ] ]