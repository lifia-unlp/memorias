api
normalize: aString
	| replacements |
	replacements := Dictionary new
		at: $á put: $a;
		at: $é put: $e;
		at: $í put: $i;
		at: $ó put: $o;
		at: $ú put: $u;
		yourself.
	^ String
		streamContents: [ :out | 
			aString asLowercase onlyLetters readStream
				do: [ :char | out nextPut: (replacements at: char ifAbsent: [ char ]) ] ]