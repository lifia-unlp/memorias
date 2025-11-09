Class {
	#name : #Lifian,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'firstName',
		'lastName',
		'highestDegree',
		'coursesAtUNLP',
		'positionAtLIFIA',
		'positionAtUnlp',
		'category',
		'sicadiCategory',
		'positionAtCIC',
		'positionAtCONICET',
		'projects',
		'publications',
		'advicedThesis',
		'advicedScholarships',
		'personalEmail',
		'institutionalEmail',
		'shortCvInSpanish',
		'shortCvInEnglish',
		'interestsInEnglish',
		'interestsInSpanish',
		'notes',
		'orcid',
		'dblpProfile',
		'googleResearchProfile',
		'researchGateProfile',
		'phone',
		'webPage',
		'affiliations',
		'avatarUrl'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #voyage }
Lifian class >> isVoyageRoot [
	^ true
]

{ #category : #'obsolete-deprecated' }
Lifian >> advicedScholarships [
	^ advicedScholarships
]

{ #category : #'obsolete-deprecated' }
Lifian >> advicedScholarships: anObject [
	advicedScholarships := anObject
]

{ #category : #'obsolete-deprecated' }
Lifian >> advicedThesis [
	^ advicedThesis
]

{ #category : #'obsolete-deprecated' }
Lifian >> advicedThesis: anObject [
	advicedThesis := anObject
]

{ #category : #accessing }
Lifian >> affiliations [
	^ affiliations
]

{ #category : #accessing }
Lifian >> affiliations: anObject [
	affiliations := anObject
]

{ #category : #accessing }
Lifian >> avatarUrl [

	^ avatarUrl
]

{ #category : #accessing }
Lifian >> avatarUrl: anObject [

	avatarUrl := anObject
]

{ #category : #accessing }
Lifian >> category [
	^ category
]

{ #category : #accessing }
Lifian >> category: anObject [
	category := anObject
]

{ #category : #accessing }
Lifian >> coursesAtUNLP [
	^ coursesAtUNLP
]

{ #category : #accessing }
Lifian >> coursesAtUNLP: anObject [
	coursesAtUNLP := anObject
]

{ #category : #accessing }
Lifian >> dblpProfile [
	^ dblpProfile
]

{ #category : #accessing }
Lifian >> dblpProfile: anObject [
	dblpProfile := anObject
]

{ #category : #accessing }
Lifian >> firstName [
	^ firstName
]

{ #category : #accessing }
Lifian >> firstName: anObject [
	firstName := anObject
]

{ #category : #accessing }
Lifian >> formalName [
	^ lastName, ', ', firstName 
]

{ #category : #accessing }
Lifian >> fullName [
	^ firstName , ' ' , lastName
]

{ #category : #accessing }
Lifian >> googleResearchProfile [
	^ googleResearchProfile
]

{ #category : #accessing }
Lifian >> googleResearchProfile: anObject [
	googleResearchProfile := anObject
]

{ #category : #accessing }
Lifian >> highestDegree [
	^ highestDegree
]

{ #category : #accessing }
Lifian >> highestDegree: anObject [
	highestDegree := anObject
]

{ #category : #initialization }
Lifian >> initialize [
	super initialize.
	publications := OrderedCollection new.
	projects := OrderedCollection new.
	advicedScholarships := OrderedCollection new.
	advicedThesis := OrderedCollection new
]

{ #category : #accessing }
Lifian >> institutionalEmail [
	^ institutionalEmail
]

{ #category : #accessing }
Lifian >> institutionalEmail: anObject [
	institutionalEmail := anObject
]

{ #category : #accessing }
Lifian >> interestsInEnglish [
	^ interestsInEnglish
]

{ #category : #accessing }
Lifian >> interestsInEnglish: anObject [
	interestsInEnglish := anObject
]

{ #category : #accessing }
Lifian >> interestsInSpanish [
	^ interestsInSpanish
]

{ #category : #accessing }
Lifian >> interestsInSpanish: anObject [
	interestsInSpanish := anObject
]

{ #category : #accessing }
Lifian >> lastName [
	^ lastName
]

{ #category : #accessing }
Lifian >> lastName: anObject [
	lastName := anObject
]

{ #category : #accessing }
Lifian >> notes [
	^ notes
]

{ #category : #accessing }
Lifian >> notes: anObject [
	notes := anObject
]

{ #category : #accessing }
Lifian >> orcid [
	^ orcid
]

{ #category : #accessing }
Lifian >> orcid: anObject [
	orcid := anObject
]

{ #category : #accessing }
Lifian >> personalEmail [
	^ personalEmail
]

{ #category : #accessing }
Lifian >> personalEmail: anObject [
	personalEmail := anObject
]

{ #category : #accessing }
Lifian >> phone [
	^ phone
]

{ #category : #accessing }
Lifian >> phone: anObject [
	phone := anObject
]

{ #category : #accessing }
Lifian >> positionAtCIC [
	^ positionAtCIC
]

{ #category : #accessing }
Lifian >> positionAtCIC: anObject [
	positionAtCIC := anObject
]

{ #category : #accessing }
Lifian >> positionAtCONICET [
	^ positionAtCONICET
]

{ #category : #accessing }
Lifian >> positionAtCONICET: anObject [
	positionAtCONICET := anObject
]

{ #category : #accessing }
Lifian >> positionAtLIFIA [
	^ positionAtLIFIA
]

{ #category : #accessing }
Lifian >> positionAtLIFIA: anObject [
	positionAtLIFIA := anObject
]

{ #category : #accessing }
Lifian >> positionAtUnlp [
	^ positionAtUnlp
]

{ #category : #accessing }
Lifian >> positionAtUnlp: anObject [
	positionAtUnlp := anObject
]

{ #category : #printing }
Lifian >> printOn: aStream [

	self trashed ifTrue: [ aStream nextPutAll: '(TRASHED) ' ].
	aStream nextPutAll: self fullName
]

{ #category : #'obsolete-deprecated' }
Lifian >> projects [
	^ projects
]

{ #category : #'obsolete-deprecated' }
Lifian >> projects: anObject [
	projects := anObject
]

{ #category : #accessing }
Lifian >> propertyNames [
	^ #(firstName lastName highestDegree coursesAtUNLP startDate endDate positionAtLIFIA positionAtUnlp category sicadiCategory positionAtCIC positionAtCONICET projects publications advicedThesis advicedScholarships personalEmail institutionalEmail shortCvInSpanish relatedProjects notes orcid dblpProfile googleResearchProfile researchGateProfile phone webPage affiliations avatarUrl)
		collect: #asString
]

{ #category : #'obsolete-deprecated' }
Lifian >> publications [
	^ publications
]

{ #category : #'obsolete-deprecated' }
Lifian >> publications: anObject [
	publications := anObject
]

{ #category : #'double dispatch' }
Lifian >> renderAsNewsSubjectWith: aRenderer on: aCanvas [
	aRenderer renderLifian: self on: aCanvas 

]

{ #category : #accessing }
Lifian >> researchGateProfile [
	^ researchGateProfile
]

{ #category : #accessing }
Lifian >> researchGateProfile: anObject [
	researchGateProfile := anObject
]

{ #category : #accessing }
Lifian >> shortCvInEnglish [
	^ shortCvInEnglish
]

{ #category : #accessing }
Lifian >> shortCvInEnglish: anObject [
	shortCvInEnglish := anObject
]

{ #category : #accessing }
Lifian >> shortCvInSpanish [
	^ shortCvInSpanish
]

{ #category : #accessing }
Lifian >> shortCvInSpanish: anObject [
	shortCvInSpanish := anObject
]

{ #category : #accessing }
Lifian >> sicadiCategory [

	^ sicadiCategory
]

{ #category : #accessing }
Lifian >> sicadiCategory: anObject [

	sicadiCategory := anObject
]

{ #category : #slugs }
Lifian >> suggestSlugBase [

	^ self firstName , '-' , self lastName
]

{ #category : #accessing }
Lifian >> webPage [
	^ webPage
]

{ #category : #accessing }
Lifian >> webPage: anObject [
	webPage := anObject
]
