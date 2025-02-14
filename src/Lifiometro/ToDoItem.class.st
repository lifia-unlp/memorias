Class {
	#name : #ToDoItem,
	#superclass : #LifiaLogEntry,
	#instVars : [
		'requestor',
		'assignee',
		'entry',
		'request',
		'deadline',
		'isCompleted',
		'completionDate'
	],
	#category : #'Lifiometro-Model'
}

{ #category : #testing }
ToDoItem class >> isVoyageRoot [
	^ true 
]

{ #category : #accessing }
ToDoItem >> assignee [

	^ assignee
]

{ #category : #accessing }
ToDoItem >> assignee: anObject [

	assignee := anObject
]

{ #category : #accessing }
ToDoItem >> completionDate [

	^ completionDate
]

{ #category : #accessing }
ToDoItem >> completionDate: anObject [

	completionDate := anObject
]

{ #category : #accessing }
ToDoItem >> deadline [

	^ deadline
]

{ #category : #accessing }
ToDoItem >> deadline: anObject [

	deadline := anObject
]

{ #category : #accessing }
ToDoItem >> entry [

	^ entry
]

{ #category : #accessing }
ToDoItem >> entry: anObject [

	entry := anObject
]

{ #category : #accessing }
ToDoItem >> initialize [
	super initialize .
	isCompleted := false.
	 
]

{ #category : #accessing }
ToDoItem >> isCompleted [

	^ isCompleted
]

{ #category : #accessing }
ToDoItem >> isCompleted: anObject [

	isCompleted := anObject
]

{ #category : #hooks }
ToDoItem >> propertyNames [
	^ #(requestor assignee request deadline)
		collect: #asString
]

{ #category : #accessing }
ToDoItem >> request [

	^ request
]

{ #category : #accessing }
ToDoItem >> request: anObject [

	request := anObject
]

{ #category : #accessing }
ToDoItem >> requestor [

	^ requestor
]

{ #category : #accessing }
ToDoItem >> requestor: anObject [

	requestor := anObject
]
