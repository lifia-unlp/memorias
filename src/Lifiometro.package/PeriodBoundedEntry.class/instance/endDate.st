accessing
endDate
	"Mongo converted this as DateAndTime"

	^ endDate ifNotNil: [ endDate asDate ]