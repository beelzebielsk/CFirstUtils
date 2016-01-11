"use strict"

// TODO: Make forcing functionality.
// return viable course loads.

var fs = require("fs");
var util = require("util");
var comboIt = require("./Scheduling/combinationsIterator.js")
var prodIt = require("./Scheduling/carProdIterator.js")
var Time = require("./Scheduling/times.js")
require("./Scheduling/StringExtra.js")
require("./node_modules/console.table")

// Fetch classes file.
var fileDescriptor = fs.openSync("./classesSP2016.json", "r");
var courses = fs.readFileSync(fileDescriptor);
courses = JSON.parse(courses);

// Declarations
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

var minCourseLoadSize = 3;
var maxCourseLoadSize = 6;
var minCreds = 12;
var maxCreds = 15;
var numLoads = 0;
var numScheds = 0;
var numViableLoads = 0;
var finalSchedules = [];
var finalSectionLoads = [];
var finalClasses = [];

//console.log(courses); // DEBUG
// Remove classes from consideration.

// list of courses is comma separated. Currently cannot have spaces after
// before or after commas.
var removeCoursesList = ( process.argv[3] ? process.argv[3].split(',') : null );

if (removeCoursesList) {
	for (let unwanted of removeCoursesList) {
		var temp = unwanted.split(' ');
		var disc = temp[0];
		var number = temp[1];

		for (let courseKey in courses) {
			if ( courses[courseKey].disc === disc && courses[courseKey].number === number ) {
				courses.splice(courseKey,1);
			}
		}
	}
}

//console.log(courses) // DEBUG

// Force certain classes into all courseloads.

// TODO: Do some validation. Should be DISC " " NUM [, DISC " " NUM] where
//	DISC =:: [a-z]+
//	NUM =:: [1-9]{3,5}

// list of courses is comma separated. Currently cannot have spaces after before or after commas.
var forcedCoursesList = ( process.argv[2] ? process.argv[2].split(',') : null );
var forcedCourses = [];

if (forcedCoursesList) {
	for (let forced of forcedCoursesList) {
		var temp = forced.split(" ");
		var disc = temp[0];
		var number = temp[1];
		
		for (let courseKey in courses) {
			if ( courses[courseKey].disc === disc && courses[courseKey].number === number ) {
				forcedCourses = forcedCourses.concat( courses.splice(courseKey,1) );
			}
		}
	}
}

minCourseLoadSize = Math.max( minCourseLoadSize - forcedCourses.length, 0 );
maxCourseLoadSize = Math.max( maxCourseLoadSize - forcedCourses.length, 0 );

//Start generating courseloads.


for ( let i = minCourseLoadSize; i <= maxCourseLoadSize; ++i) {
	var courseLoads = new comboIt(courses, i);
	var isViable = false; // Does it have at least one schedule?

	do {
		var currentLoad = courseLoads.next();
		currentLoad.value = currentLoad.value.concat(forcedCourses);
		let loadLength = currentLoad.value.length;
		var loadCreds = totalCreds(currentLoad.value);
		var nameList = currentLoad.value.map( course => course.disc + ' ' + course.number );
		var satisfy = true;
		var satisfy = satisfy && loadCreds >= 12 && loadCreds <= maxCreds;
		var satisfy = satisfy && coreqs(currentLoad.value);
		if (!satisfy) continue;
    
		var sectionLoads = new prodIt(currentLoad.value.map( course => course.sections ) );

		do {
			var currentSLoad = sectionLoads.next();
			//let currentSched = [];
			let currentSched = {};
			var badSched = false;
			let classSet = [];

			// Create schedule
			for (let j = 0; j < loadLength; ++j) {
				var currentDays = (currentSLoad.value)[j].days;
				for ( let day in currentDays ) {
					currentDays[day].forEach(
							session => { 
								var startKey = createTimeKey(day, session.start);
								var endKey = createTimeKey(day, session.end);
								if (startKey in currentSched) badSched = true;
								if (endKey in currentSched) badSched = true;
								currentSched[startKey] = currentSched[endKey] = nameList[j];
							}
					)
				}
			}
			badSched = badSched || timeConflict(currentSched);
      if ( !badSched ) { 
				numScheds++;
				isViable = isViable || !badSched;
				finalSchedules.push(currentSched);
				finalSectionLoads.push(currentSLoad.value);
				finalClasses.push( createSchedule( currentSLoad.value, nameList, currentLoad.value ) );
			}
		} while (!currentSLoad.done)
		
		if (isViable) { ++numViableLoads; console.log( JSON.stringify(nameList) ); }
		numLoads++;
	} while (!currentLoad.done )
}

console.log("Number of Loads:", numLoads);
console.log("Number of Viable Loads:", numViableLoads);
console.log("Number of Schedules:", numScheds);

// Printing out schedules
//for (let schedNum = 0; schedNum < finalSchedules.length; ++schedNum) {
//	let currentSched = finalSchedules[schedNum];
//	console.log("----------Schedule #", schedNum, "----------");
//	let schedKeys = Object.keys(currentSched);
//	console.log( JSON.stringify( currentSched, null, " " ) );
//}

//for (let schedNum = 0; schedNum < finalSectionLoads.length; ++schedNum) {
//	console.log("----------Schedule #", schedNum, "----------");
//	let currentLoad = finalSectionLoads[schedNum];
//	currentLoad = currentLoad.map( section => ({ name : section.name, days : section.days }) );
//	console.log( JSON.stringify( currentLoad, null, " " ) );
//	
//}

for (let schedNum = 0; schedNum < finalClasses.length; ++schedNum) {
	console.table(finalClasses[schedNum]);
}

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


// Schedule functions/tests
function createSchedule(sectionLoad, nameList, courseLoad) {
	// schedule is an object with keys that are days of the week.
	// If the key does not exist, then set it equal to the current day key
	// of a section element.
	// If the key does exist, then concatenate the value of the current day key
	// of the current section element.
	//console.table(sectionLoad); // DEBUG
	var schedule = [];
	for (let i = 0; i < sectionLoad.length; ++i) {
		//console.log(sectionLoad[i]); // DEBUG
		let course = {};
		let currentSection = sectionLoad[i];
		course.name = nameList[i];
		course.number = currentSection.name;
		course.time = []; // To enforce printing order.
		course.prof = []; 
		course.credits = courseLoad[i].credits;
		course.room = []; 
		for (let day in currentSection.days) {
			for (let session of currentSection.days[day]) {
				//console.log(session); // DEBUG
				course.time.push( util.format( "%s %s-%s", day, session.start, session.end ) );
				course.prof.push( session.prof );
				course.room.push( session.room );
			}
		}
		schedule.push(course);
	}
	return schedule;
}

function createTimeKey(shortDay, milTime) { // As number
	return Time.timeInfo.dayNums[shortDay] + 1 + '' +  String.prototype.pad.call('' + milTime, 'l', '0', 4 );
}

// Precondition: Schedule has an even number of entries. Not actually necessary.
function timeConflict(schedule) {
	var keyList = Object.keys(schedule);
	for (let i = 0; i < keyList.length; i += 2) {
		if ( schedule[keyList[i]] !== schedule[keyList[i+1]] ) return true;
	}
	return false;
}

/*
 * Classes have:
 * numbers: Their primary ID in the database.
 * names: discipline + classNumber
 * Times: a list of daytimes
 * Professors: A name
 * Rooms: A room number
 */
