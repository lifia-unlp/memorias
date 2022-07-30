Class {
	#name : #BaselineOfLifiometro,
	#superclass : #BaselineOf,
	#category : #BaselineOfLifiometro
}

{ #category : #baselines }
BaselineOfLifiometro >> baseline: spec [
	<baseline>
	spec
		for: #common
		do: [ self
				seaside: spec;
				doi: spec;
				bootstrap: spec;
				voyage: spec;
				petitBibtex: spec.
			spec
				package: 'Lifiometro'
				with: [ spec
						requires:
							#('Seaside3' 'Bootstrap-Core' 'Bootstrap-Widgets' 'Voyage') ] ].
	spec postLoadDoIt: #postLoadActions
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
BaselineOfLifiometro >> petitBibtex: spec [
	spec
		baseline: 'PetitBibtex'
		with: [ spec repository: 'github://cientopolis/petitbibtex' ]
]

{ #category : #baselines }
BaselineOfLifiometro >> postLoadActions [
	GTPlayground
		edit:
			'"To deploy Lifiometro take a look at the comment of class MemoriasLandingComponent in the Lifiometro package"'
		label: 'Deploys instructions'
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
	spec
		baseline: 'Voyage'
		with: [ spec repository: 'github://pharo-nosql/voyage:1.6/mc' ]
]
