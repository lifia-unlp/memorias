Class {
	#name : #BaselineOfLifiometro,
	#superclass : #BaselineOf,
	#category : #BaselineOfLifiometro
}

{ #category : #baselines }
BaselineOfLifiometro >> baseline: spec [

	<baseline>
	spec for: #common do: [
		self
			seaside: spec;
			doi: spec;
			bootstrap: spec;
			voyage: spec;
			openAiPapi: spec;
			plotly: spec;
			editDistances: spec;
			petitBibtex: spec.
		spec package: 'Lifiometro' with: [
			spec requires:
				#( 'Seaside3' 'Bootstrap-Core' 'Bootstrap-Widgets'
				   'Voyage' 'Seaside-Plotly-Core' 'AIEditDistances' ) ] ]
]

{ #category : #baselines }
BaselineOfLifiometro >> bootstrap: spec [
	spec
		package: 'Bootstrap-Core'
		with: [ spec repository: 'github://astares/Seaside-Bootstrap/src' ].
	spec
		package: 'Bootstrap-Widgets'
		with: [ spec repository: 'github://astares/Seaside-Bootstrap/src' ].
	spec
		package: 'Bootstrap-Jasny'
		with: [ spec repository: 'github://astares/Seaside-Bootstrap/src' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> doi: spec [
	spec
		package: 'DOI'
		with: [ spec repository: 'github://cientopolis/petitbibtex' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> editDistances: spec [

	spec
		baseline: 'AIEditDistances'
		with: [ spec repository: 'github://pharo-ai/edit-distances/src' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> openAiPapi: spec [
	spec
		package: 'OpenAI-API'
		with: [ spec repository: 'github://casco/openai-papi:main/' ].
]

{ #category : #baselines }
BaselineOfLifiometro >> petitBibtex: spec [
	spec
		baseline: 'PetitBibtex'
		with: [ spec repository: 'github://cientopolis/petitbibtex' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> plotly: spec [
	spec
		package: 'Seaside-Plotly-Core'
		with: [ spec repository: 'github://emaringolo/seaside-plotlyjs/src' ].

]

{ #category : #baselines }
BaselineOfLifiometro >> seaside: spec [
	spec
		baseline: 'Seaside3'
		with: [ spec repository: 'github://SeasideSt/Seaside:master/repository' ].
	spec
		package: 'Seaside-REST-Core'
		with: [ spec repository: 'github://SeasideSt/Seaside:master/repository' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> voyage: spec [

	spec baseline: 'Voyage' with: [ 
		spec
			loads: #( mongo );
			repository: 'github://pharo-nosql/voyage:pharo10-ready/mc' ]
]
