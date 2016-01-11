"use strict"
function CombinationIterator(Set,length) {
	
	this.Set = (!Set ? [] : Set);

	if (!length) this.length = 0;
	else if (length < 0 || length > Set.length )
		throw new RangeError("Value of `length` must be greater than or equal to 0 " +
		    "or less than or equal to the length of the `Set`.\n" +
		    "The value for `length` passed to the iterator was: " + length );
	else this.length = +length; // In case `length` is a string.
    
	var choices = [];
	for (var i = 0; i < length; i++)
		choices.push(i);

	this.choices = choices;
	this.next = function () {

		// There is exactly one way to pick nothing, which
		// is represented by the empty array.
		if ( this.length === 0 ) return { value : [], done : true };

		var lastCombo = false;

		var retVal = this.choices.map( function(position) { return this.Set[position]; }, this );

		// If the last element of `choices` points to the last element of `Set`...
		if ( this.choices[this.length - 1] === this.Set.length - 1 )
			if (this.length === 1) lastCombo = true;
			else

			for (var i = this.length - 2; i >= 0 ; i--){
				if (this.choices[i] !== this.choices[i+1] - 1) {
					++this.choices[i];
					for (var j = i+1; j < this.length; j++)
						this.choices[j] = this.choices[j-1] + 1;
					break;
				}

				if (i === 0) lastCombo = true;
			}
		else ++this.choices[this.length - 1];

		return { value: retVal, done : lastCombo };
	}
}

module.exports = CombinationIterator;
