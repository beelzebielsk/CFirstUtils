"use strict"
// Consider adding support for just adding to the current level
// with debugPrint.h, instead of always setting the level.
// Either that, or create a new function that will use
// debugPrint.h, and work just like it, but will instead
// take the "level" argument and add it to the current
// print level, instead of set the current print level.
require("./StringExtra");
var debugPrint = {};

// Prints text with a certain amount of tabs.
debugPrint.l = function (level) {
    if (!level && level !== 0) level = this.printLevel;
    var tabs = "|\t".repeat(level) ;
    var args = Array.prototype.slice.call(arguments,1);

    for (var i = 0; i < args.length; i++) {
	//Look for all newlines. Replace them with themselves + `tabs`.
	//If there's a string of consecutive newlines, add `tabs` at
	//the end of the consecutive string, don't replace each one.
	//This way, if one passes debugprint.l a string that contains
	//newlines, it won't be the case that only the first line
	//is appropriately indented.
		
	if (typeof args[i] === "string" )
	    args[i] = args[i].replace( /(\n)+/gm, "$1" + tabs );
    }
    console.log.apply(null, [ tabs ].concat( args ) );
};

// Prints text with a certain amount of tabs,
// pads the text with the `-` character so that
// the heading is more obvious and sets
// a persistent printing level so that
// whatever is printing after this heading
// using debugPrint.l doesn't have to have
// a level specified.
debugPrint.h = function (level, heading) {
    this.printLevel = level || this.printLevel;
    this.l(this.printLevel - 1, heading.pad("r","-", this.textWidth - this.tabWidth * (this.printLevel - 1) ) );
}
// A "step-size". Intended to match the width of a tab character.
// It helps debugPrint.h how to pad its headings, so that the headings all
// end at roughly the same place.
debugPrint.tabWidth = 8;
debugPrint.textWidth = 50;
// Initializes the printing level. Initial level is 1.
debugPrint.printLevel = 1;

module.exports = debugPrint;
