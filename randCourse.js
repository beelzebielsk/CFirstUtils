"use strict"
	// Randomly generating courses and their sections until
	// I can quickly get my hands on course data.  For
	// testing out the program to make sure its ready for
	// registration.

	// The `stash` object is going to hold all of the
	// "seeds" for random generation. The stuff that I have
	// to provide for generating the characteristics of
	// courses and sections.

// Preamble {{{
	// Contains definition of day, miltime, milTimeRange as RegExps.
	var validation = require("./validation");

	// Contains Time constructors, and time constants.
	var Time = require("./times").Time;
	var WeekTime = require("./times").WeekTime;
	var time = require("./times").timeInfo;

	// Adds extra functions for random operations to `Math`
	var randInt = require("./random").randInt;
	var randNotUni = require("./random").randNotUni;

	// Adds extra functions to `String`
	require("./StringExtra");  

	// Adds extra functions to Function
	require("./FunctionExtra");

	// Debug printing.
	var debugPrint = require("./debugPrint");
// }}}

var stash = {
    discs : [
		"math",		// Math courses
		"csc",		// Comp Sci
		"ee",		// Electrical Engineering
		"engr",		// Engineering (other/general)
		"phys",		// Physics
		"hum",		// Humanities
		"hist",		// History
		"phil",		// Philosophy
		"sci",		// General Science
		],

    buildings : [
		"nac", // North Academic Center
		"mr", // Marshak Science hall
		"shep", // Shepard Hall
		],

    profs : [
		"gonflats, parcheezi",
		"fredman, manfred",
		"staff",
		"agiou, mangey",
		"yelnats, pants",
		"elba, idris",
		"badman, saul",
		"rawls, dean",
		"bak, joseph",
		"mac, freddy",
		"maw, thresher",
		"beholder, the",
		"manson, moe",
		"coat, rain",
		"drapes, carpet",
		"mcguy, chubbs",
		"pinnucle, gareth",
		"arang, bang",
		"flame, yoga",
		"gadget, inspector",
		"joe, camel",
		"ra, sun",
		"man, method",
		"man, red",
		"loggins, kenny",
		"jumbo, uncle",
		"boy, tommy",
		"sandiego, carmen",
		"buttafucco, wilmer",
		"funt, cornelius",
		"dyson, michael",
		"mark, marquis",
		"jetson, george",
		"jetsam, flotsam",
		"lacroix, cecil",
		"samwise, ansem",
		"florian, kenny",
		"spalding, captain",
		"belding, billiam",
		"express, punjabi",
		"rye, pretzel",
		"taffy, dimetapp",
		"shitbone, ol'", //Old magic johnson, or bully from Friday doing "mudbone"
		"jitzel, jacob",
		// This terrible trio...
		"hank, action",
		"ferguson, spider",
		"marty, mad",
		// Make the...
		"brigade, barbershop",
		"beelzebielsk, gregori",
		"gruumsh, jeremiah",
		],
    genCourses : [],
    // For now, until I may decide, eventually, to change how some fields get
    // generated. If that happens, I won't have to make big changes to my code.
    generate : function (field) { return this[field].randChoose(); },
};

// Constructors {{{
	function Course(name, disc, number, credits, prereqs, sections){
		this.name = name;
		this.disc = disc;
		this.number = number;
		this.credits = credits;
		this.prereqs = prereqs;
		this.sections = sections;
	};

	function Section(sessions, name, isFull){
		//sessions is an array of sessions.
		//name is a string.

		//Push the necessary session information to
		//the appropriate day property of this section.

		sessions.forEach( 
			function(session, index, arr) {
				//Needs protection!

				//create the session to be added to the
				//day property.

				var value = {	
					start : session.start,
					end : session.end,
					prof : session.prof,
					room : session.room, building : session.building
				};

				//If the day property doesn't exist, create it.
				if( !this[session.day] )
					this[session.day] = [value];

					//If it does exist, just push this session to the
					//existing array.
				
				else
					this[session.day].push(value);
			},
			this );

			this.name = (!name ?
							"lec " + String( randInt(0,99999) ).pad("l","0",5) :
							this.name );

			this.isFull = (!isFull ? false : isFull);
	};

	function Session(day, start, end, prof, room, building){
		this.day = day;
		this.start = start;
		this.end = end;
		this.prof = prof;
		this.room = room;
		this.building = building;
	};

	// Sort-of constructor
	function Sessions(descriptions){
		// Takes an array of strings in the following format:
		// day(day){0-6};milTimeRange(milTimeRange)+;prof;room;building
		// and creates an array of sessions, each of which have
		// the professor `prof`, take place in the room `room` and
		// building `building`. The day and start/end properties
		// of these sessions are determined by the days and milTimeRanges.
		// There'll be one session created for each element in the
		// cartesian product of the list of given days and the list
		// milTimeRanges.
		

		// Validate the argument? 

		// Create array to hold sessions
		var sessions = [];

		// Process each description of sessions
		descriptions.forEach( function( description ) {
			
			// Split into useful info 
			var info = description.split(";");
			var days = info[0].match( new RegExp( validation.day, "g" ) );
			var timeRanges = info[1].match( new RegExp( validation.milTimeRange, "g" ) );
			var prof = info[2];
			var room = info[3];
			var building = info[4];

			//console.log( info);
			//console.log( days );
			//console.log( timeRanges );
			//console.log( room );
			//console.log( building );

			for (var i = 0; i < days.length; i++)
				for( var j = 0; j < timeRanges.length; j++) {
					var times = timeRanges[j].match( new RegExp( validation.milTime, "g" ) );
					sessions.push( new Session(days[i], times[0], times[1], prof, room, building ) );
				}
		} );
		return sessions;
	};
// }}}

// Object Generators {{{
	function generateSession(opts){
		// opts is an object with options for
		// generating the session. Right now,
		// it just gives some specific values
		// for session properties.
		// Options:
		//	earliest: earliest a session can start.
		//	latest: latest a sesion can start.
		//	classLengths: possible lengths for a session.
		//			Randomly chosen.
		//	day: Day that the session takes place on.
		//	start: start of the session.
		//	end: end of the session.
		//	prof: Name of the professor at the session.
		//	room: Room that the session takes place in.
		//	building: Building that houses room.
		//
		// The options object is not necessary. Giving
		// the function options just controls the generation.

		//var days = ["su", "mo", "tu", "we", "th", "fr", "sa"];
		if (!opts) opts = {};

		// opts.earliest and opts.latest will control start times.
		// opts.earliest and opts.latest will be arrays in the form
		// of [hour, minute], (e.g. [7, 30] = 730, [14,35] = 1435.
		// End times will be randomly chosen to be:
		//	1 hour later
		//	1'30" hours later
		//	1'40" hours later
		//	2' hours later
		
		//if ( opts.earliest ) var earliest = opts.earliest;
		//else if ( !opts.earliest ) var earliest = new Time( "0700" );
		if ( opts.earliest ) {
			if ( typeof opts.earliest === "string" && opts.earliest.length === 4) 
				var earliest = new Time( opts.earliest ) ;
			else if (opts.earliest instanceof Time === true)
				var earliest = opts.earliest;
		}
		else var earliest = new Time( "0700" );

		if ( opts.latest ) { 
			if ( typeof opts.latest === "string" && opts.latest.length === 4 )
				var latest = new Time( opts.latest );
			else if (opts.latest instanceof Time === true)
				var latest = opts.latest;
		}
		else var latest = new Time( "2100" );

		var classLengths = (!opts.classLengths ?
				[ [1,0], [1,30], [1,40], [2,0] ] :
				opts.classLengths );

		var day = (!opts.day ? time.days.randChoose() : opts.day);

		// generate a sensible start time. Default
		// will be some time after 7 AM, which is 700.
		// Classes that I know of end on some multiple of
		// 5 minutes, so I'm going to generate a random
		// integer that'll be in interval [ 700/5, 2100/5 ].
		// Don't concentrate too much on this. This is only
		// for testing and won't really make it's way into
		// the final program. Just put together something
		// that works and can be changed if need be without
		// too much effort.

		// Use opts.earliest and opts.latest to find the
		// length of the interval in between the two 
		// in minutes. Then generate some multiple of
		// five minutes that's inside of this interval.

		if (!opts.start && !opts.end) {
			//opts.start = randInt(opts.earliest, opts.latest)*5;
			//opts.end = randInt(opts.start / 5, opts.latest) * 5 ;
			//opts.end = opts.start + opts.classLengths.randChoose();
			//var startHour = randInt( opts.earliest[0], opts.latest[0] );
			var startHour = randInt( earliest.hours, latest.hours );

			if (startHour === latest.hours )
				var startMin = randInt(0, latest.minutes);
			else
				var startMin = randInt(0, 59);

			var start = new Time(startHour, startMin);
			var end = start.plus( Time.construct( classLengths.randChoose() ) );
		}
		else if (!opts.start && opts.end) {
			//opts.start = randInt(opts.earliest, opts.end / 5) * 5 ;
			//Decide on class length, then subtract from end to get start.
			var end = opts.end;
			var start = end.minus( Time.construct( classLengths.randChoose() ) );
		}
		else if (opts.start && !opts.end) {
			//opts.end = randInt( opts.start / 5, opts.latest );
			var start = opts.start;
			var end = start.plus( Time.construct( classLengths.randChoose() ) );
		}

		var prof = (!opts.prof ? stash.generate("profs") : opts.prof);
		var room = (!opts.room ? roomNumber() : opts.room);
		var building = (!opts.building ? stash.generate("buildings") : opts.building);

		return new Session(day,
						start,
						end,
						prof,
						room,
						building
						);
	};

	function generateSection(opts){
		// Options:
		//	days: Days that sessions can take place on.
		//		default: ["mo", "tu", "we", "th", "fr"]
		//	earliest: Earliest time that any session can start.
		//		default: "0700"
		//	latest: Latest time that any session can start.
		//		default: "2100"
		//	numSessions: Number of sessions in this section. Note that
		//	if opts.numSessions < opts.sessions.length, then
		//	no additional sessions will be generated.
		//		default: uniform random integer b/w 1 and 3, inclusive.
		//	sessions: An array of sessions to put inside the array of sessions.
		//		default: []
		//	sameProf: Same professor for all sessions.
		//		default: false
		//	sameLoc: Same building/room for all sessions.
		//		default: true
		//	name: Name of the section.
		//		default: ""
		//	isFull: Whether or not the generated section is full.
		//		default: randNotUni( [false, true], [9, 1] );

		if (!opts) opts = {};

		var days = (!opts.days ? ["mo", "tu", "we", "th", "fr"] : opts.days);
		var earliest = (!opts.earliest ? "0700" : opts.earliest);
		var latest = (!opts.latest ? "2100" : opts.latest);
		var numSessions = (!opts.numSessions ? randInt(1,3) : opts.numSessions);
		var sessions = (!opts.sessions ? [] : opts.sessions);
		var sameProf = (!opts.sameProf ? false : opts.sameProf);
		var sameLoc = (!opts.sameLoc && opts.sameLoc !== false ?
				true :
				opts.sameLoc );
		var name = (!opts.name ? "" : opts.name);
		var isFull = (!opts.isFull && opts.isFull !== false ?
				randNotUni([[false,9], [true,1]]) :
				isFull);

		// The following are set to `""` if their respective options are
		// not true because `!""` evaluates to `true`. This way, a random
		// (professor|room|building) will be generated.
		
		var prof = (sameProf ? stash.generate("profs") : "");
		var room = (sameLoc ? roomNumber() : "");
		var building = (sameLoc ? stash.generate("buildings") : "");

		for (var i = sessions.length; i < numSessions; i++)
			sessions.push( generateSession(
						{		day: days.randChoose(),
								earliest : earliest,
								latest : latest,
								prof : prof,
								room : room,
								building : building
						} ) );

		return new Section(sessions, name, isFull);
	};

	function generateSections(opts) {
		// Creates an array of sections.
		// Options:
		//	days: Days that sessions of sectiosn can take place on.
		//	earliest: Earliest time that any session can start.
		//	latest: Latest time that any session can start.
		//	numSections: Number of sections to generate.
		//		Default: randNotUni([[1,5],[2,5],[4,5],[6,3],[10,1]])
		//	maxSessions: Maximum # of sessions per section.
		//		Default: 5.
		//	minSessions: Minimum # of sessions per section.
		//		Default: 1.
		//	sameProf: Same professor for all sessions in a section.
		//		Default: false
		//	sameLoc: Same location for all sessions in a section.
		//		Default: false
		
		if (!opts) opts = {};

		var days = (!opts.days ? ["mo", "tu", "we", "th", "fr"] : opts.days);
		var earliest = (!opts.earliest ? "0700" : opts.earliest);
		var latest = (!opts.latest ? "2100" : opts.latest);
		var numSections = (!opts.numSections && opts.numSections !== 0 ?
				randNotUni([[1,5],[2,5],[4,5],[6,3],[10,1]]) :
				opts.numSections);
		var maxSessions = (!opts.maxSessions ? 5 : opts.maxSessions);
		var minSessions = (!opts.minSessions ? 1 : opts.minSessions);
		var sameProf = (!opts.sameProf && opts.sameProf !== false ?
				false :
				opts.sameProf);
		var sameLoc = (!opts.sameLoc && opts.sameProf !== false ?
				false :
				opts.sameLoc);
		var sections = [];

		for (var i = 0; i < numSections; i++) {
			var isFull = randNotUni([[false,4],[true,1]]);
			var numSessions = randInt(minSessions,maxSessions);
			sections.push(
					generateSection( 
							{	
								days : days,
								earliest : earliest,
								latest : latest,
								numSessions : numSessions,
								sameProf : sameProf,
								sameLoc : sameLoc,
								isFull : isFull 
							} 
						)
					);
		};

		return sections;
	};

	function generateCourse(opts){
		// opts is an object with options for the course.
		// Specifices some parameters for generation.
		// Right now, it's just going to give specific
		// values for some course properties.
		//	name: Name of course. Default is "disc number",
		//  disc: Discipline of course. Default is random.
		//  number: Number of course. Default is random integer in [0,99999].
		//  credits: Credits the course is worth. Default is random integer
		//		in [2,5].
		//	numPrereqs: Controls the number of prereqs that the course
		//		will have. If `numPrereqs` < `prereqs.length`, then those
		//		prereqs passed as an options will not be removed. There
		//		will just be no further prereqs added.
		//	prereqs: An array of the prerequisites for the course.
		//		Default is an array of courses chosen from
		//		stash.genCourses. prereqs.length is never less
		//		than `numPrereqs`.
		//	minSections: Minimum number of sections for course to have.
		//		Default: 1.
		//	maxSections: Maximum number of sections for course to have.
		//		Default: 10.
		//	sections: An array of sections. If `sections.length` <
		//		the number of sections to be generated for the course
		//		(which is a random number b/w minSections and maxSections)
		//		then more sections are added to `sections`.
		//	sameProf: Maintain same professor for all sessions in each
		//		section.
		//		Default: false.
		//	sameLoc: Maintain same location for all sessions in each
		//		section.
		//		Default: false.

		if (!opts) opts = {}; 

		var disc = (!opts.disc ? stash.generate("discs") : opts.disc);
		var number = (!opts.number ?
				("" + randInt(1,99999)).pad("l","0",5) :
				opts.number);

		var name = (!opts.name ? disc.toUpperCase() + " " + number : opts.name);
		while	( stash.genCourses.some( 
					function(course) {return course === disc + number;}
					)
				) 
		{
			disc = stash.generate("discs");
			number = ( "" + randInt(1,99999) ).pad("l","0",5) ;
		};

		var credits = (!opts.credits ? randInt(2,5) : opts.credits);

		// min() because there may be fewer prereqs in the stash than numPrereqs.
		var numPrereqs = Math.min( randNotUni([[0,3],[1,3],[2,1]]), stash.genCourses.length );
		// Will this alter the array in opts? Probably, as I've just passed a reference.
		var prereqs = (!opts.prereqs ? [] : opts.prereqs);

		for (var i = 0; i < numPrereqs; i++)
			prereqs.push( stash.generate("genCourses") );
			
		stash.genCourses.push( disc + number );

		var sections = (!opts.sections ? [] : opts.sections);
		var minSections = (!opts.minSections ? 1 : opts.minSections);
		var maxSections = (!opts.maxSections ? 10 : opts.maxSections);
		var sameProf = (!opts.sameProf && opts.sameProf !== false ?
				false :
				opts.sameProf);
		var sameLoc = (!opts.sameLoc && opts.sameLoc !== false ?
				false :
				opts.sameLoc);

		var numSections = randInt(minSections,maxSections);

		sections = sections.concat( generateSections(
					{
						numSections : numSections - sections.length,
						sameProf : sameProf,
						sameLoc : sameLoc
					}
							)
						);

		return new Course(
						name,
						disc,
						number,
						credits,
						prereqs,
						sections
					);
	};
// }}}

// Utility Functions {{{
	function roomNumber() { return randInt(1,5) + "/" + String( randInt(1,399) ).pad("l","0",3); };
// }}}
/*
// Debug {{{
	var test = {
		session: {
		args: [ 
			[0,1,2,3,4,5],
			[0, "0800", "1100", "beanie, jeanie", "6/123", "park"],
			["tu", new Time( "0800" ), new Time( "1100" ), "bonly, jonly", "1/234", "bathroom"], 
		],
		expected:
			"Expected Output:\n" +
			"session[0] === { day: 0, start: 1, end: 2, prof: 3, room: 4, building: 5},\n" +
			"session[1] === { day: 0, start: '0800', end: '1100', prof: 'beanie, jeanie', " +
				"room: '6/123', building: 'park' },\n" +
			"session[2] === { day: 'tu', start: { hours: 8, minutes: 0}, " +
				"end: { hours: 11, minutes: 0 }, prof: 'bonly, jonly' " +
				"room: '1/234', building: 'bathroom' }" },
	};

	test.sessions =  {
		args:   [
			["mo/we;1400-1540;bak, joseph;mr-111;mr"],
			["mo/we;1700-1815;turner, justin;4/148;nac"],
			["tu/th;1600-1740;rytir, pavel;6/101;nac"],
			["fr;1500-1640;durmus, emre;4/123;nac"],
			["tu/th;1600-1740;rytir, pavel;6/101;nac","fr;1500-1640;durmus, emre;4/123;nac"]
		],
		expected:
		"[  {\n" +
			"day: 'mo',\n" +
			"start: '1400',\n" +
			"end: '1540',\n" +
			"prof: 'bak, joseph',\n" +
			"room: 'mr-111',\n" +
			"building: 'mr'\n" +
			"},\n" +
			"{\n" +
			"day: 'we',\n" +
			"start: '1400',\n" +
			"end: '1540',\n" +
			"prof: 'bak, joseph',\n" +
			"room: 'mr-111',\n" +
			"building: 'mr'\n" +
			"}\n" +
		"],\n" +
		"[  {\n" +
			"day: 'mo',\n" +
			"start: '1700',\n" +
			"end: '1815',\n" +
			"prof: 'turner, justin',\n" +
			"room: '4/148',\n" +
			"building: 'nac'\n" +
			"},\n" +
			"{\n" +
			"day: 'we',\n" +
			"start: '1700',\n" +
			"end: '1815',\n" +
			"prof: 'turner, justin',\n" +
			"room: '4/148',\n" +
			"building: 'nac'\n" +
			"}\n" +
		"],\n" +
		"[  {\n" +
			"day: 'tu',\n" +
			"start: '1600',\n" +
			"end: '1740',\n" +
			"prof: 'rytir, pavel',\n" +
			"room: '6/101',\n" +
			"building: 'nac'\n" +
			"},\n" +
			"{\n" +
			"day: 'th',\n" +
			"start: '1600',\n" +
			"end: '1740',\n" +
			"prof: 'rytir, pavel',\n" +
			"room: '6/101',\n" +
			"building: 'nac'\n" +
			"}\n" +
		"],\n" +
		"[  {\n" +
			"day: 'fr',\n" +
			"start: '1500',\n" +
			"end: '1640',\n" +
			"prof: 'durmus, emre',\n" +
			"room: '4/123',\n" +
			"building: 'nac'\n" +
			"}\n" +
		"]\n" 
	};

	test.section = {
		args: [
			[
			//Sessions
			[],
			//Name
			"jbutt",
			//isFull
			true
			],
			[
			//Sessions
			//References to the object being created need
			//to be done outside of the object.
			//i.e. test.section.args[1] = [ Session.construct( test.session.args[2] ), "someName", "false" ]
			[ Session.construct( test.session.args[2] ) ],
			//Name
			"forRels",
			//isFull
			false
			],
			[
			//Sessions
			Sessions( ["mo/tu/we/th;1200-1400;friday, ben;mr-200;mr"] ),
			"lec 42000",
			false
			],
			[
			Sessions( test.sessions.args[4] ),
			//Name
			"notSureYet",
			false
			],
			[
			Sessions( test.sessions.args[1] ),
			"notSureYet",
			true
			],
			[
			Sessions( test.sessions.args[0] ),
			"notSureYet",
			false
			]
		],
		expected:
		"Expected Output:\n" +
			"oo0 === { sessions: [], name: 'jbutt', isFull: true },\n" +
			"oo1 === { sessions: [ " +
			" {  day: 'tu',\n" + 
				"start: { hours: 8, minutes: 0 },\n" +
				"end: { hours: 11, minutes: 0 },\n" +
				"prof: 'bonly, jonly',\n" +
				"room: '1/234',\n" +
				"building: 'bathroom' },\n" +
				"],\n" +
			"name: 'forRels',\n" +
			"isFull: false }" 
	};
	test.course = {
		args: [
			[
				"Poppin' Fresh",				//name
				"freshn",					//disc
				"35555",					//number
				30,						//credits
				["freshn15000"],				//prereqs
				Section.constructArray( test.section.args )	//sections
			],
		],
		expected: ""
	};

	test.generateSession = {
		args : [ [], [], [] ],
		expected : ""
	};
	test.generateSection = {
		args : [ [], [], [] ],
		expected : ""
	};
	test.generateSections = {
		args : [ [], [], [] ],
		expected : ""
	};
	test.generateCourse = {
		args : [ [], [], [] ],
		expected : ""
	}

		debugPrint.h(1, "Constructors" );

			debugPrint.h( 2, "College Constructors" );
			
				debugPrint.h( 3, "Session" );
				debugPrint.l( false, test.session.expected );

				for (var i = 0; i < test.session.args.length; i++) {
					var obj = Session.construct( test.session.args[i] );
					debugPrint.h( 4, "Argument " + i );
					debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
				}
				debugPrint.h( 3, "Sessions");
				debugPrint.l( false, test.sessions.expected );

				for (var i = 0; i < test.sessions.args.length; i++) {
					var obj = Sessions( test.sessions.args[i] );
					debugPrint.h( 4, "Argument " + i );
					debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
				}

				debugPrint.h( 3, "Section" );
				debugPrint.l( false, test.section.expected );

				for (var i = 0; i < test.section.args.length; i++) {
					var obj = Section.construct( test.section.args[i] );
					debugPrint.h( 4, "Argument " + i );
					debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2) );
				}
				debugPrint.h( 3, "Course" );
				debugPrint.l( false, test.course.expected );

				for (var i = 0; i < test.course.args.length; i++) {
					var obj = Course.construct( test.course.args[i] );
					debugPrint.h( 4, "Argument " + i);
					debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
				}

		debugPrint.h(1, "Generators" );

			debugPrint.h( 2, "Generate Session:" );
			debugPrint.l( false, test.generateSession.expected )

			for (var i = 0; i < test.generateSession.args.length; i++) {
				var obj = generateSession.apply(null, test.generateSession.args[i]);
				debugPrint.h( 3, "Argument " + i);
				debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
			};

			debugPrint.h( 2, "Generate Section:" );
			debugPrint.l( false, test.generateSection.expected )

			for (var i = 0; i < test.generateSection.args.length; i++) {
				var obj = generateSection.apply(null, test.generateSection.args[i]);
				debugPrint.h( 3, "Argument " + i);
				debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
			};

			debugPrint.h( 2, "Generate Sections:" );
			debugPrint.l( false, test.generateSections.expected );

			for (var i = 0; i < test.generateSections.args.length; i++) {
				var obj = generateSections.apply(null, test.generateSections.args[i]);
				debugPrint.h( 3, "Argument " + i);
				debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2 ) );
			};

			debugPrint.h( 2, "Generate Course:" );
			debugPrint.l( false, test.generateCourse.expected );

			for (var i = 0; i < test.generateCourse.args.length; i++) {
				var obj = generateCourse.apply(null, test.generateCourse.args[i]);
				debugPrint.h( 3, "Argument " + i);
				debugPrint.l( false, "Object:", JSON.stringify( obj, null, 2) );
			};

		debugPrint.h(1, "Extra");

			debugPrint.h(2, "Stash");
			debugPrint.l(false, JSON.stringify( stash.genCourses, null, 2 ) );

		debugPrint.h(1, "END OF DEBUG" );
// }}}
//*/

module.exports = {
	stash : stash,
	Course : Course,
	Section : Section,
	Session : Session,
	Sessions : Sessions,
	generateSession : generateSession,
	generateSection : generateSection,
	generateSections : generateSections,
	generateCourse : generateCourse,
};
