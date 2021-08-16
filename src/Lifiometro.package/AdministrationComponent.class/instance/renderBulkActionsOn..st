rendering
renderBulkActionsOn: html
	^ html tbsPanel
		beDefault;
		with: [ html tbsPanelHeading: [ html label: 'Bulk actions' ].
			html
				tbsPanelBody: [ html anchor
						callback: [ self importFromDblp ];
						with: 'Import from DBLP'.
					html break.
					html anchor
						callback: [ self cleanupTitlesAndAuthors ];
						with: 'Cleanup titles'.
					html break.
					html anchor
						callback: [ self sendTestEmail ];
						with: 'Send test email'.
					html break.
					html anchor
						callback: [ self guessArticleAuthors ];
						with: 'Guess article authors' ] ]