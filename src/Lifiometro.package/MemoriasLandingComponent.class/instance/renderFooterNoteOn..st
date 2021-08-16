rendering
renderFooterNoteOn: html
	html
		tbsContainer: [ html
				small: [ html
						paragraph: [ html
								text:
									'Esta aplicación fue diseñada y desarrollada por investigadores, docentes y alumnos del '.
							html anchor
								url: 'http://www.lifia.info.unlp.edu.ar';
								target: '_blank';
								with:
									'Centro de Investigación LIFIA de la Facultad de Informática de la UNLP.'.
							html
								paragraph: [ html text: 'Esta aplicación se '.
									html anchor
										url: 'https://github.com/AndresMarconi/ProyectoHuertas';
										target: '_blank';
										with: 'encuentra disponible'.
									html text: ' bajo licencia GPL3' ] ] ] ].