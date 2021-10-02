Class {
	#name : #Lifian,
	#superclass : #PeriodBoundedEntry,
	#instVars : [
		'firstName',
		'lastName',
		'highestDegree',
		'coursesAtUNLP',
		'positionAtUnlp',
		'category',
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
		'affiliations'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #voyage }
Lifian class >> isVoyageRoot [
	^ true
]

{ #category : #accessing }
Lifian >> advicedScholarships [
	^ advicedScholarships
]

{ #category : #accessing }
Lifian >> advicedScholarships: anObject [
	advicedScholarships := anObject
]

{ #category : #accessing }
Lifian >> advicedThesis [
	^ advicedThesis
]

{ #category : #accessing }
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
Lifian >> positionAtUnlp [
	^ positionAtUnlp
]

{ #category : #accessing }
Lifian >> positionAtUnlp: anObject [
	positionAtUnlp := anObject
]

{ #category : #accessing }
Lifian >> projects [
	^ projects
]

{ #category : #accessing }
Lifian >> projects: anObject [
	projects := anObject
]

{ #category : #accessing }
Lifian >> propertyNames [
	^ #(firstName lastName highestDegree coursesAtUNLP startDate endDate positionAtUnlp category positionAtCIC positionAtCONICET projects publications advicedThesis advicedScholarships personalEmail institutionalEmail shortCvInSpanish shortCvInEnglish relatedProjects interestsInEnglish interestsInSpanish  notes orcid dblpProfile googleResearchProfile researchGateProfile phone webPage affiliations)
		collect: #asString
]

{ #category : #accessing }
Lifian >> publications [
	^ publications
]

{ #category : #accessing }
Lifian >> publications: anObject [
	publications := anObject
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
Lifian >> webPage [
	^ webPage
]

{ #category : #accessing }
Lifian >> webPage: anObject [
	webPage := anObject
]
