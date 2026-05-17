Class {
	#name : #IndexInjectorComponent,
	#superclass : #WAComponent,
	#category : #'Lifiometro-Web-Components'
}

{ #category : #updating }
IndexInjectorComponent >> indexInjectorScript [

	^ 'function generateIndex() {
    const indexDiv = document.getElementById(''index'');
    const headers = document.querySelectorAll(''h1, h2, h3, h4, h5, h6'');
    let indexHTML = ''<h1>Índice</h1>'';

    // To keep track of the current nesting level
    const listStack = [];

    headers.forEach(header => {
        const id = header.id || `header-${header.innerText.replace(/\s+/g, ''-'').toLowerCase()}`;
        header.id = id;  // Assign an ID if it doesn''t already have one

        const level = parseInt(header.tagName.charAt(1)); // Get the heading level (1 for h1, 2 for h2, etc.)

        // Close tags for levels higher than the current header''s level
        while (listStack.length && listStack[listStack.length - 1].level >= level) {
            indexHTML += ''</ul></li>'';
            listStack.pop();
        }

        // Add the new header to the index
        indexHTML += `<li><a href="#${id}">${header.innerText}</a>`;
        indexHTML += ''<ul>''; // Start a new list for the next level
        listStack.push({ level }); // Push the current level to the stack
    });

    // Close any remaining open lists
    while (listStack.length) {
        indexHTML += ''</ul></li>'';
        listStack.pop();
    }

    indexHTML += ''</ul>''; // Close the outer list
    indexDiv.innerHTML = indexHTML;
}

// Use addEventListener to allow multiple onload functions
window.addEventListener(''load'', generateIndex);'
]

{ #category : #rendering }
IndexInjectorComponent >> renderContentOn: html [

	html div id: 'index'.

]

{ #category : #updating }
IndexInjectorComponent >> updateRoot: aWARoot [

	super updateRoot: aWARoot.
	aWARoot addScript: self indexInjectorScript
]
