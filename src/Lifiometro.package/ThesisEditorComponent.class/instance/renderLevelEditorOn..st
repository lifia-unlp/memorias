accept/cancel
renderLevelEditorOn: html
	html
		tbsFormGroup: [ html label
				for: 'level';
				with: 'Nivel'.
			html break.
			html radioGroup
				callback: [ :value | newValues at: 'level' put: value ];
				selected: (newValues at: 'level');
				with: [ :group | 
					{'Undergraduate' . 'Specialization' . 'Masters' . 'PhD'}
						do: [ :each | 
							group radioButton value: each.
							html
								space;
								text: each;
								break ] ] ]