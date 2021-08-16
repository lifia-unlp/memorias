baselines
baseline: spec
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