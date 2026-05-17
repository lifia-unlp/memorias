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

	arrayOfDictionariesWithCounts :=  anObject
]

{ #category : #private }
YearlyEvolutionPlotSubcomponent >> plotlyTraceFor: titleToCollectionOfAssociations from: startYear to: endYear [

	| yearlyCounts counts |
	title := titleToCollectionOfAssociations key.
	yearlyCounts := titleToCollectionOfAssociations value asDictionary.
	counts := (startYear to: endYear) collect: [ :year |
		          yearlyCounts at: year ifAbsent: [ 0 ] ].


	^ PlotlyTrace scatter
		  name: title;
		  showlegend: true;
		  x: (startYear to: endYear) asArray;
		  y: counts asArray;
		  yourself
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

	| plotly data years |
	plotly := script plotly: elementId.
	years := (arrayOfDictionariesWithCounts flatCollect: [ :each |
		         each value collect: #key ]) .
	data := nil.
	years ifNotEmpty: [
		data := arrayOfDictionariesWithCounts collect: [ :each |
			        self plotlyTraceFor: each from: years min to: years max ] ].

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
