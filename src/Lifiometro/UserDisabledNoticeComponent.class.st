Class {
	#name : #UserDisabledNoticeComponent,
	#superclass : #WAComponent,
	#category : 'Lifiometro-Web-Login'
}

{ #category : #rendering }
UserDisabledNoticeComponent >> renderContentOn: html [
	html
		tbsContainer: [ html break.
			html
				tbsJumbotron: [ html heading
						level1;
						class: 'display-4';
						with: 'Memorias'.
					"			html image
				style: 'padding-bottom: 20px;';
				style: 'max-width: 100%;';
				url: GAFLibrary / #farmomaticJpeg."
					html paragraph
						class: 'lead';
						with: 'Su usuario todavía no ha sido activado.'.
					html paragraph
						with:
							'Este servicio requiere que todos los nuevos usuarios sean activados por alguno de los administradores del sistema - comuniquese con ellos para que lo hagan.'.
					html anchor
						callback: [ self session unregister.
							self requestContext redirectTo: self application url ];
						with: [ html tbsButton
								bePrimary;
								with: 'Ok' ] ] ]
]
