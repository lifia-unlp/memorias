Class {
	#name : #LifiaLogEntryTest,
	#superclass : #TestCase,
	#instVars : [
		'reference',
		'referenceWithObsoleteLifian',
		'referenceWithObsoleteProject',
		'referenceWithObsoleteThesis'
	],
	#category : #'Lifiometro-Tests'
}

{ #category : #running }
LifiaLogEntryTest >> setUp [

	super setUp.

	reference := RawReference new.
	referenceWithObsoleteLifian := RawReference new.
	referenceWithObsoleteLifian relatedLifians:
		(OrderedCollection with: (Lifian new
				  trashed: true;
				  yourself)).
	referenceWithObsoleteProject := RawReference new.
	referenceWithObsoleteProject relatedProjects:
		(OrderedCollection with: (Project new
				  trashed: true;
				  yourself)).
	referenceWithObsoleteThesis := RawReference new.
	referenceWithObsoleteThesis relatedThesis:
		(OrderedCollection with: (Thesis new
				  trashed: true;
				  yourself))
]

{ #category : #tests }
LifiaLogEntryTest >> testObsoleteReferenceReport [

	self deny: reference obsoleteReferencesReport requiresAttention.
	self assert:
		referenceWithObsoleteLifian obsoleteReferencesReport
			requiresAttention.
	self assert: referenceWithObsoleteProject obsoleteReferencesReport
			requiresAttention.
	self assert:
		referenceWithObsoleteThesis obsoleteReferencesReport
			requiresAttention
]
