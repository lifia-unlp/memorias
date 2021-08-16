rendering
renderExternalLinksOn: html
	report researcher orcid 
		ifNotNilNotEmpty: [ :it | 
			html text: 'ORCID: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher webPage
		ifNotNilNotEmpty: [ :it | 
			html text: 'Página web: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher researchGateProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en Research Gate: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher googleResearchProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en Google Scholar: '.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	report researcher dblpProfile
		ifNotNilNotEmpty: [ :it | 
			html text: 'Perfil en DBLP: '.
			html space.
			html anchor
				url: it;
				target: '_blank';
				with: it.
			html break ].
	html break