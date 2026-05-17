Class {
	#name : #GptEnglishCriticComponent,
	#superclass : #WAComponent,
	#instVars : [
		'sentence',
		'critic',
		'writingStyleCritic'
	],
	#classInstVars : [
		'timesOfLatestResponses'
	],
	#category : #'Lifiometro-Tools'
}

{ #category : #stats }
GptEnglishCriticComponent class >> averageResponseTime [

	self timesOfLatestResponses ifEmpty: [ ^ 0 ].
	^ self timesOfLatestResponses average
]

{ #category : #stats }
GptEnglishCriticComponent class >> clearStats [

	timesOfLatestResponses := nil
]

{ #category : #stats }
GptEnglishCriticComponent class >> recordResponseTime: seconds [

	self timesOfLatestResponses addLast: seconds.
	self timesOfLatestResponses size = 10 ifTrue: [ 
		self timesOfLatestResponses removeFirst ]
]

{ #category : #accessing }
GptEnglishCriticComponent class >> timesOfLatestResponses [

	^ timesOfLatestResponses ifNil: [ timesOfLatestResponses := OrderedCollection new ]
]

{ #category : #accessing }
GptEnglishCriticComponent >> critic [

	^ critic
]

{ #category : #accessing }
GptEnglishCriticComponent >> critic: anObject [

	critic := anObject
]

{ #category : #callbacks }
GptEnglishCriticComponent >> fetch [

	| startTime |
	writingStyleCritic apiKey isEmptyOrNil ifTrue: [ ^ self ].
	sentence ifEmpty: [ ^ self ].

	startTime := Time millisecondClockValue.
	[ 
	critic := writingStyleCritic complete: sentence.
	self class recordResponseTime:
		Time millisecondClockValue - startTime / 1000 ]
		on: Error
		do: [ :ex | critic := 'Sorry, algo salió mal. ' , ex toString ]
]

{ #category : #initialization }
GptEnglishCriticComponent >> initialize [

	super initialize.
	writingStyleCritic := WritingStyleCritic new
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderApikeyFieldOn: html [

	writingStyleCritic apiKey isEmptyOrNil ifFalse: [ ^ self ].
	html label
		for: 'apikey';
		with: 'Provide a valid GPT api key'.
	html textInput
		tbsFormControl;
		on: #apiKey of: writingStyleCritic;
		id: 'apikey'
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderContentOn: html [
	html
		tbsPanel: [ html
				tbsPanelBody: [ self renderFormOn: html. 
					self renderWarningOn: html ] ]
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderCriticOn: html [

	html label with: 'This is what GPT thinks about it'.
	(critic ifNil: [ '' ]) linesDo: [ :line | html paragraph with: line ]
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderFormOn: html [

	html tbsForm: [ 
		html tbsFormGroup: [ 
			self renderApikeyFieldOn: html.
			html break.
			self renderInputSentendeFieldOn: html.
			critic ifNotNilNotEmpty: [ 
				html break.
				self renderCriticOn: html ].
			html break.
			html tbsButton
				beDefault;
				callback: [ self answer ];
				with: 'Terminar'.
			html space.
			html tbsButton
				bePrimary;
				callback: [ self fetch ];
				with: 'Consultar' ] ]
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderInputSentendeFieldOn: html [

	html label
		for: 'apisentenceKey';
		with: 'What is the sentence you want GPT''s opinion on?'.
	html textInput
		tbsFormControl;
		on: #sentence of: self;
		id: 'sentence'
]

{ #category : #rendering }
GptEnglishCriticComponent >> renderWarningOn: html [

	html tbsAlert
		beWarning;
		with:
			'This is a experimental feature; use with care. On average, it takes GPT '
			, self class averageResponseTime rounded greaseString
			, ' seconds to respond.'
]

{ #category : #accessing }
GptEnglishCriticComponent >> sentence [

	^ sentence
]

{ #category : #accessing }
GptEnglishCriticComponent >> sentence: anObject [

	sentence := anObject
]
