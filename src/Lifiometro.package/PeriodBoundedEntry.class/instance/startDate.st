accessing
startDate
	"Mongo converted this as DateAndTime"

	^ startDate ifNotNil: [ startDate asDate ]