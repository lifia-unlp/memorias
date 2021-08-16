rendering
renderContentOn: html
	html div
		id: 'page';
		with: [ self renderReportHeaderOn: html.
			self renderFormOn: html.
			html horizontalRule.
			self renderIndexOn: html.
			self renderReportOn: html ]