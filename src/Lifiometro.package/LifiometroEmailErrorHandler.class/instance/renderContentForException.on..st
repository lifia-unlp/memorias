private
renderContentForException: anException on: html
	html tbsAlert
		beDanger;
		with: [ html strong: 'Oh snap!'.
			html text: ' I encounter an error. I already tried to notify the admins. Be sure to export your reviews, just in case.' ]