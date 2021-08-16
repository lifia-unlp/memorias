rendering
renderTypeEditorLabeled: label instructions: instructions on: html
	html
		tbsFormGroup: [ html label
				for: 'type';
				with: (label ifNil: [ 'Type' ]).
			html break.
			html radioGroup
				callback: [ :value | newType := value ];
				selected: item type;
				with: [ :group | 
					(self allowedTypes associations
						asSortedCollection: [ :a :b | a value < b value ])
						do: [ :each | 
							group radioButton value: each key.
							html
								space;
								text: (self allowedTypes at: each key) , ' (' , each key , ')';
								break ] ] ]