rendering
render: each on: html
	html
		paragraph: [ html
				strong: each title;
				text: ' (';
				text: each type;
				text: ')';
				break.
			html
				text: 'Fechas: ';
				text: each startDate;
				text: ' - ';
				text: each endDate;
				break.
			html
				text: 'Notas: ';
				text: each notes;
				break.
			html text: 'URL: '.
			html anchor
				target: '_blank';
				url: each moreInfoUrl;
				with: each moreInfoUrl.
			html break ]