Class {
	#name : #YearlyEvolutionPlotSubcomponent,
	#superclass : #WAComponent,
	#instVars : [
		'title',
		'arrayOfDictionariesWithCounts'
	],
	#category : #'Lifiometro-Reports'
}

{ #category : #accessing }
YearlyEvolutionPlotSubcomponent >> arrayOfDictionariesWithCounts [

	^ arrayOfDictionariesWithCounts
]

{ #category : #accessing }
YearlyEvolutionPlotSubcomponent >> arrayOfDictionariesWithCounts: anObject [

	arrayOfDictionariesWithCounts := anObject
]

{ #category : #rendering }
YearlyEvolutionPlotSubcomponent >> renderContentOn: html [

	html div
		id: html nextId;
		with: [ "This is the container" ].

	html document addLoadScript:
		(JSStream on: (html jQuery script: [ :script | 
				  self setupScriptForScatterPlot: script elementId: html lastId ]))
]

{ #category : #rendering }
YearlyEvolutionPlotSubcomponent >> setupScriptForScatterPlot: script elementId: elementId [

	| plotly data |
	plotly := script plotly: elementId.
	data := (arrayOfDictionariesWithCounts asSortedCollection: [ :a :b |
		         a value first < b value first ]) collect: [ :each |
		        PlotlyTrace scatter
			        name: each key;
			        showlegend: true;
			        x: (each value collect: #key) asArray;
			        y: (each value collect: #value) asArray;
			        yourself ].
	plotly
		data: data;
		layout: (PlotlyLayout new
				 title: (PlotlyText text: title);
				 width: 1000 height: 500;
				 propertyAt: 'xaxis' put: (Dictionary new
						  at: 'type' put: 'category';
						  yourself);
				 yourself).
	plotly config beResponsive.
	script << plotly
]

{ #category : #accessing }
YearlyEvolutionPlotSubcomponent >> title [

	^ title
]

{ #category : #accessing }
YearlyEvolutionPlotSubcomponent >> title: anObject [

	title := anObject
]

{ #category : #rendering }
YearlyEvolutionPlotSubcomponent >> updateRoot: aWARoot [

	super updateRoot: aWARoot.
	aWARoot javascript url: 'https://cdn.plot.ly/plotly-2.4.2.min.js'
]
