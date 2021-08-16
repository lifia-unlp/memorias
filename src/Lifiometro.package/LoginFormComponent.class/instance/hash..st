callbacks
hash: aString
	^ (SHA256 new hashMessage: aString asByteArray) asString