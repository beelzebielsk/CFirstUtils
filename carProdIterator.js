"use strict"

// This code will detail an object that will iterate through
// the elements of the cartesian product of a variable number of
// sets. The sets will be contained in an array, which will be
// passed to it as an argument.
// Object properties:
//
// sets : An array of arrays. Each array should behave
// like a set, meaning no duplicate elemnts.
// choices : An array of numbers. It holds the state
// of the iterator. These numbers dictate which element
// of the cartesian project will be given next. So if the
// array if [0,2,2], then the next element will be:
// 	First element of first set
// 	Third element of second set
// 	Third element of third set
// The length of this array will be the length of the
// `sets` property.
// next : This method will return an object that 
// will contain the next element of the cartesian
// product, as well as property `done`, which will
// be true when the iterator has spat out all
// of the elements in the cartesian product of the
// sets given to the iterator.

function CarProdIterator(Sets){
	/* Look up functionality for special cases */

	if (!Sets) this.sets = [];
	else this.sets = Sets;

	this.choices = [];

	// this.length = function () { return this.sets.length; } // Debug
	
	for (var i = 0; i < this.sets.length; i++)
		this.choices[i] = 0;

	this.next = function () {
		// What should I do if no sets are passed to the iterator?
		if (this.sets.length === 0 ) return { value : [], done : true };

		// Until detected otherwise...
		var lastElement = false;

		/* Map the first element, k1 (position), of `this.choices`
		 * to the k1th element of the first set in `this.sets` (set).
		 * Map the second element, k2, of `this.choices` to
		 * the k2th element of the second set in `this.sets`.
		 * And so on...
		 */

		var retVal = this.choices.map ( 
				function(position, set) { return this.sets[set][position]; },
				this);

		/* Iterate choices, and detect if this was the last element
		 * of the cartesian product.
		 * Iteration works like counting. Add one to the least
		 * significant digit, which I choose to be the rightmost
		 * entry in choices, which we'll call entry k.
		 * Note that this implies there are k entries in `sets`.
		 * incrementing choices[k]:
		 * If: 
		 * 	++choices[k] === sets[k].length
		 * then {
		 * 	choices[k] = 0;
		 * 	increment choices[k-1];
		 * 	}
		 * Note the use of `++choices[k]`. No matter what, I want to
		 * add one to choices[k]. I need to add one to choices[k] to
		 * compare it to sets[k].length. If the comparison fails,
		 * it should still have one added to it, so as to increment it.
		 * If the comparison succeeds, then it needs to become 0, and
		 * some other things need to be checked.
		 *
		 * Now the logic must be fixed to account for every single
		 * entry in choices being equal to the length of its
		 * corresponding set once incremented.
		 * If that's the case, then that means the previous state
		 * of choices, before incrementation, represented the last
		 * element of the cartesian product. So:
		 * incrementing choices[k]:
		 * If:
		 * 	++choices[k] === sets[k].length
		 * then {
		 * 	If:
		 * 	k === 0
		 * 	then {
		 * 		lastElement = true;
		 * 		}
		 * 	Else {
		 * 		choices[k] = 0;
		 * 		increment choices[k-1];
		 * 		}
		 * 	}
		 *
		 * This logic works for recursion, but has to be altered
		 * slightly to account for iteration.
		 */

		for (var i = this.choices.length - 1; i >= 0; i--){
			if (++this.choices[i] === this.sets[i].length){
				if (i === 0) lastElement = true;
				else this.choices[i] = 0;
			}
			/* The earilier comparison already incremented 
			 * this.choices[i]. All that's left is to
			 * break the loop. Nothing else needs to be
			 * checked or incremented.
			 */
			else break;
		}

		return { value : retVal, done : lastElement };
	}
}

module.exports = CarProdIterator;

/* //Debug
var buck = new CarProdIterator([[1,0],[1,0],[1,0],[1,0]]);
var special = new CarProdIterator();
//console.log( buck.choices );
while (true) {
	var value = buck.next();
	console.log( value.value );
	if (value.done) break;
}
while (true) {
	var value = special.next();
	console.log( value.value );
	if (value.done) break;
}
//*/
