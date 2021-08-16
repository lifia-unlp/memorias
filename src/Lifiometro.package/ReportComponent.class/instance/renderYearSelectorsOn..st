rendering-form
renderYearSelectorsOn: html
	^ html
		tbsFormGroup: [ html
				label: 'Años a incluir';
				break.
			0 to: 5 do: [ :i | 
				html checkbox
					value: (lastFiveYearsSelectors at: i + 1);
					callback: [ :value | lastFiveYearsSelectors at: i + 1 put: value ].
				html space.
				html text: (Date today year - i) printString.
				html break ].
			html checkbox
				value: older;
				callback: [ :value | older := value ].
			html space.
			html
				text: 'Anteriores';
				break ]