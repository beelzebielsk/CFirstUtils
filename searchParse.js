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
var time_cap =  '(\\d{1,2}):(\\d{2})(AM|PM)' 
var timeString_cap = "(" + day_noCap + "+) "
						+ time_cap + " - " + time_cap;
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
			var sectionInfo = { 
				times       : result[4].trim().split('\n'),
				rooms       : result[5].trim().split('\n'),
				instructors : result[6].trim().split('\n'),
				dates				: result[7].trim().split('\n'),
			};
			sections[j]              = { name: boundaryInfo.courses[i].name };
			sections[j].disc         = boundaryInfo.courses[i].disc;
			sections[j].num          = boundaryInfo.courses[i].num;
			sections[j].CFID         = result[1];
			sections[j].sectionName  = result[2];
			sections[j].sectionType  = result[3];
			sections[j].isFull       = ( result[8].trim()[0] === 'O' ? false : true ); // Is it open?
			sections[j].days = {};

			for (var sessionSet = 0; sessionSet < sectionInfo.times.length; sessionSet++) {
				var singleTime = RegExp(timeString_cap, 'i');
				var matches = sectionInfo.times[sessionSet].match(singleTime);
				// the singleTime regexp should have the following captures:
				// -	0 : Whole string
				// -	1 : String of consecutive days
				// -	2 : Hour of first time
				// -	3 : Minutes of first time
				// -	4 : AM/PM of first time
				// -	5 : Hour of second time    
				// -	6 : Minutes of second time 
				// -	7 : AM/PM of second time   
				//console.log(matches); // DEBUG
				var sectionDays = [];
				for (var strIndex = 0; strIndex < matches[1].length ; strIndex += 2) {
					sectionDays.push( matches[1].substr(strIndex, 2) )
				}
				//console.log(sectionDays); // DEBUG
				var attendanceTime = sectionInfo.dates[sessionSet].match( RegExp( '(' + date + ') - (' + date + ')', 'i' ) );
				var sessionStart = + (matches[2] + matches[3]) + ( matches[4] === "AM" ? 0 : 1200 );  
				var sessionEnd = + (matches[5] + matches[6]) + ( matches[7] === "AM" ? 0 : 1200 );
				for (var day of sectionDays) {
					var singleSession = {
						start    : sessionStart,
						end      : sessionEnd,
						prof     : sectionInfo.instructors[sessionSet],
						room     : sectionInfo.rooms[sessionSet],
						firstDay : attendanceTime[1],
						lastDay  : attendanceTime[2],
					}
					//console.log(singleSession) // DEBUG
					if (!sections[j].days[day])
						sections[j].days[day] = [ singleSession ];
					else
						sections[j].days[day].push( singleSession );
				}
			}
			++j;
		}
		oneSection.lastIndex = 0;
	}
	console.log( JSON.stringify(sections, null, 1) ); // DEBUG
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
