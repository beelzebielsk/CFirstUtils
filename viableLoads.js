"use strict"

// TODO: Make forcing functionality.
// return viable course loads.

var fs = require("fs");
var comboIt = require("./Scheduling/combinationsIterator.js")
var prodIt = require("./Scheduling/carProdIterator.js")
var Time = require("./Scheduling/times.js")
require("./Scheduling/StringExtra.js")

// Fetch classes file.
var fileDescriptor = fs.openSync("./classesSP2016.json", "r");
var courses = fs.readFileSync(fileDescriptor);
courses = JSON.parse(courses);

var takenCourses = [
	"MATH 20100",
	"MATH 20200",
	"MATH 20300",
	"MATH 39200",
	"PHYS 20700",
	"PHYS 20800",
	"ENGL 11000",
	"ENGR 20400",
	"CSC 10300",
	"CSC 10400",
	"CSC 21000",
	"CSC 21200",
	"EE 21000",
	"EE 31100",
]

//Start generating courseloads.

var minCourseLoadSize = 3;
var maxCourseLoadSize = 6;
var minCreds = 12;
var maxCreds = 15;

var numLoads = 0;
var numScheds = 0;
for ( let i = minCourseLoadSize; i <= maxCourseLoadSize; ++i) {
	var courseLoads = new comboIt(courses, i);
	var isViable = false; // Does it have at least one schedule?

	do {
		var currentLoad = courseLoads.next();
		var loadCreds = totalCreds(currentLoad.value);
		var nameList = currentLoad.value.map( course => course.disc + ' ' + course.number );
		var satisfy = true;
		var satisfy = satisfy && loadCreds >= 12 && loadCreds <= maxCreds;
		var satisfy = satisfy && coreqs(currentLoad.value);
		if (!satisfy) continue;
    
		var sectionLoads = new prodIt(currentLoad.value.map( course => course.sections ) );

		do {
			var currentSLoad = sectionLoads.next();
			//console.log( currentSLoad ); // DEBUG
			var currentSched = [];

			// Create schedule
			// 'i' currently determines the number of classes in a courseLoad.
			for (let j = 0; j < i; ++j) {
				var currentDays = (currentSLoad.value)[j].days;
				for ( let day in currentDays ) {
					currentDays[day].forEach(
							session => { 
								var startKey = createTimeKey(day, session.start);
								var endKey = createTimeKey(day, session.end);
								currentSched[startKey] = currentSched[endKey] = nameList[j];
								//TODO: Cannot detect a conflict if one session overwrites both the beginning
								//and end of another session.
							}
					)
				}
			}
      if ( !timeConflict(currentSched) ) { numScheds++; isViable = isViable || !timeConflict(currentSched); }
		} while (!currentSLoad.done)
		
		if (isViable) console.log(nameList);
		numLoads++;
	} while (!currentLoad.done )
}

console.log("Number of Loads:", numLoads);
console.log("Number of Schedules:", numScheds);

// Courseload tests:

function totalCreds(courseLoad) {
  return courseLoad.reduce( (sum, course) => sum + course.credits, 0 );
}
function coreqs(courseLoad) {
	for ( var course of courseLoad ) {
		var coreqs = course.coreqs;
		if (!coreqs) return true; // If no coreqs, then property DNE.
		var currentNames = courseLoad.map( course => course.disc + ' ' + course.number );
		var fullList = takenCourses.concat(currentNames);
		return coreqs.every( coreq => { 
			for ( var takenCourse of fullList )
				if ( coreq === takenCourse ) return true; 
			return false; } );
	}
}

function createSchedule(sectionLoad) {
	var schedule = []
	for ( var section of sectionLoad ) {
	}
}

function createTimeKey(shortDay, milTime) { // As number
	return Time.timeInfo.dayNums[shortDay] + 1 + '' +  String.prototype.pad.call('' + milTime, 'l', '0', 4 );
}

// Precondition: Schedule has an even number of entries.
function timeConflict(schedule) {

	var keyList = Object.keys(schedule);
	for (let i = 0; i < keyList.length; i += 2) {
		if ( schedule[keyList[i]] !== schedule[keyList[i+1]] ) return true;
	}
	return false;
}
