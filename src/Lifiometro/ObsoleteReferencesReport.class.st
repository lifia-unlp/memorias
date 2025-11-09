Class {
	#name : #ObsoleteReferencesReport,
	#superclass : #Object,
	#instVars : [
		'entry',
		'obsoleteThesis',
		'obsoleteProjects',
		'obsoleteLifians'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #'instance-creation' }
ObsoleteReferencesReport class >> entry: anEntry obsoleteLifians: someLifians obsoleteThesis: someThesis obsoleteProjects: someProjects [

	^ self new
		  entry: anEntry
		  obsoleteLifians: someLifians
		  obsoleteThesis: someThesis
		  obsoleteProjects: someProjects;
		  yourself
]

{ #category : #accessing }
ObsoleteReferencesReport >> entry [

	^ entry
]

{ #category : #'instance-creation' }
ObsoleteReferencesReport >> entry: anEntry obsoleteLifians: someLifians obsoleteThesis: someThesis obsoleteProjects: someProjects [

	entry := anEntry.
	obsoleteThesis := someThesis.
	obsoleteProjects := someProjects.
	obsoleteLifians := someLifians
]

{ #category : #'initialize-relrease' }
ObsoleteReferencesReport >> initialize [

	obsoleteThesis := OrderedCollection new.
	obsoleteProjects := OrderedCollection new.
	obsoleteLifians := OrderedCollection new
]

{ #category : #accessing }
ObsoleteReferencesReport >> obsoleteLifians [

	^ obsoleteLifians
]

{ #category : #'instance-creation' }
ObsoleteReferencesReport >> obsoleteLifians: aCollection obsoleteThesis: aCollection2 obsoleteProjects: aCollection3 [ 
	self shouldBeImplemented.
]

{ #category : #accessing }
ObsoleteReferencesReport >> obsoleteProjects [

	^ obsoleteProjects
]

{ #category : #accessing }
ObsoleteReferencesReport >> obsoleteThesis [

	^ obsoleteThesis
]

{ #category : #testing }
ObsoleteReferencesReport >> requiresAttention [

	^ obsoleteThesis notEmpty | obsoleteProjects notEmpty
	  | obsoleteLifians notEmpty
]
