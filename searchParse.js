"use strict"
//	Open file
//	Read to first mentioning of "Collapse"
//	Loop:
//		Read in name and number of course
//		Read in sections.
//		Read to next mentioning of "Collapse", or to end of file.
//	Repeat:

// Regular Expressions

var collapseLine = 'Collapse.*$';                                       
var intermediateLine = '.*\\n$';
var intermediateLines = '(?:' + intermediateLine + ')+?';
var detailedCollapseLine = '^Collapse section (\\w+) (\\d+).* - (.*)$';
// The above works because '*' is normally greedy. Therefore, the regular expression will
// keep matching until it finds the last ' - ', which is what I wanted.

var sectionHeading_noCap = '^Class\\s+Section\\s+Days.*$';
var sectionHeading_Cap = '^(Class\\s+Section\\s+Days.*)$';
var CFID = '\\d{5}';
var day_cap = '(Su|Mo|Tu|We|Th|Fr|Sa)';
var day_noCap =  '(?:Su|Mo|Tu|We|Th|Fr|Sa)';
var time = '\\d{1,2}:\\d{2}(?:AM|PM)';
var dayTimeRange = day_noCap + '+ ' + time + ' - ' + time;
var buildingName = '(?:Marshak|NAC)'
var room = buildingName + ' [\\w\\d/]+';
var staffName = '[\\w\\s]+';
var date = '\\d{2}/\\d{2}/\\d{4}';
var dateRange = date + ' - ' + date;
var sectionStatus_noCap = '(?:Open|Closed)';
var sectionStatus_Cap = '(Open|Closed)';

var sectionChunk = 
	sectionHeading_noCap + '\\n'
	+ '^(' + CFID + ')$' + '\\n'
	+ '^(.*)$' + '\\n' // Section Name
	+ '^(.*)$' + '\\n' // Section Type
	+ '((?:^' + dayTimeRange + '$\\n)+)'  // At least one dayTimeRange
	+ '((?:^' + room + '$\\n)+)'  // At least one room
	+ '((?:^' + staffName + '$\\n)+)'  // At least one staffName
	+ '((?:^' + dateRange + '$\\n)+)'  // At least one dateRange
	+ '^(.*)$' + '\\n' // Section Name
	//+ '^\s*' + sectionStatus_Cap + '\s*$'
	;


// File Handling
var fs = require("fs");
var filename = process.argv[2];
if (!filename) { 
	//TODO: Say something clever.
	throw "No file name."
}

var sections = [];
var inReadStream = fs.createReadStream(filename);
var fileContents;
inReadStream.on('data', (chunk) => { fileContents += chunk; } );
inReadStream.on('end', processInput);

// Boundaries:
//	Passing an argument as undefined is the same as not specifying it.
//	Therefore, the algorithm for specifying boundaries is simple:
//	bounary[i], boundary[i+1], ...
//	This works even if [i+1] doesn't exist, since boundary[i+1] is undefined
//	which will be interpreted as "until end of string".
function processInput() {

	var boundaryInfo = getCourseBoundaries(fileContents);
	var boundaries = boundaryInfo.boundaries;
	var oneSection = RegExp( sectionChunk, 'gim' );
	var j = 0;
	for (var i = 0; i < boundaryInfo.boundaries.length ; ++i) {
		var courseSection = fileContents.substring(boundaries[i], boundaries[i+1]);
		while(true) {
			var result = oneSection.exec(courseSection);
			if (!result) break;
			//console.log(result);
			sections[j] = { name: boundaryInfo.courses[i].name };
			sections[j].disc =  boundaryInfo.courses[i].disc;
			sections[j].num = boundaryInfo.courses[i].num;
			sections[j].CFID = result[1];
			sections[j].sectionName = result[2];
			sections[j].sectionType = result[3];
			sections[j].times = result[4];
			sections[j].rooms = result[5];
			sections[j].instructors = result[6];
			sections[j].meetingDates = result[7];
			sections[j].isFull = result[8].trim();
			++j;
			//console.log(sections[j]);
			//console.log(boundaryInfo.courses[i]);
			//console.log(++j);
		}
		oneSection.lastIndex = 0;
	}
	console.log(sections);
}

//	The number of unique courses is the number of collapse lines. Courses range from:
//		Collapse line -> (right before next collapse line | end of string).
function getCourseBoundaries(str){
	//var boundary = RegExp( collapseLine, 'gim' );
	var boundary = RegExp( detailedCollapseLine, 'gim' );
	var listOfBoundaries = [];
	var listOfCourses = [];
  while(true) {
		var result = boundary.exec(str);
		if (!result) break;
		listOfBoundaries.push(result.index);
		listOfCourses.push( { disc : result[1], num : result[2], name : result[3].trim() } );
	}

	return { boundaries : listOfBoundaries, courses : listOfCourses };
}
