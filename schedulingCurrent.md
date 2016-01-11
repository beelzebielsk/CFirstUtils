This is a sketch of the capabilities and functionality that the
schedule-building side of my program should have.

# Objects:

Course {
	sections : [sections],
	name : String // name of course,
	disc: String // CST, MATH, so on...,
	number : course number // no discipline prepended,
	prereqs : [Strings], 	// pre-requisite courses, the Strings should contain
				// disciplines, followed by course numbers
				// (eg MAT 20300). Consider behavior for
				// trailing zeroes. Some may not want to
				// include the trailing zeroes.
	coreqs : [Strings],
	credits : Number // usually between 0-5
}
Cload {
	courses : [courses],
	totalCreds : get sum of credits of courses from courses property,
	totalProp : get total # of courses that meet some test, where
			the test is a function that takes a course as
			an argument.
			// This is an abstraction of total number of
			// courses that are in a certain discipline.
}

Section {
	days {
		su : [sessions],
		mo : [sessions],
		tu : [sessions],
		we : [sessions],
		th : [sessions],
		fr : [sessions],
		sa : [sessions]
	}
	/* each key in the days object represents a day. They keys
	are made to be unambiguous. The value of each day is an
	array of sessions. This way, the sessions are indexed
	by day. This will hopefuly make checking for time conflicts
	faster. Not all day keys will be defined. Only the days
	for which sessions exist will be defined. These keys
	are made during the creation of a section object, and
	they'll generally be unique to each "days" object.
	They won't be part of some prototype or something.*/

	name : String // Section name, usually 1-3 chars,
	isFull : boolean
}

Session {
	start : Date,
	end : Date,
	prof: String // Professor Name ,
	room : String // Room number, plus any letter prefixes,
	building : String // Name of building that session takes place in

}

# Before operating: 

The program should build a database of the following:

- Courses already taken
- Courses yet to be taken

The course options should be chosen from courses yet
to be taken.

The user of this program should be able to search the
databases of courses.

The user should be able to build schedules of courses,
where a schedule is an array of course sections.
Perhaps the best way to do this is to have an array of
objects, with one property being a course, and the other
property being a section name.

# Important Things:

## Definitions:

- Time Conflict: A time conflict is a schedule problem. A
schedule is an array of sections, and each section contains
sessions. A time conflict is two or more sessions which
overlap in a time during the week. This means that there
are two or more sessions which occur on the same day
and which have time ranges such that the start of one
session is inside of the beginning-end of another section.
	- How and when do I check for time conflicts?
	I would prefer to check for failures to comply with
	constrictions before a schedule is made, so that I can
	keep trimming away the things that won't work, so that
	once the full list of possible schedules is generated,
	that generation takes the least amount of work to
	generate.
- A **course** is a class. They have:
	- sections
	- names ("Calculus")
	- disciplines ("mat", "psy", "eco", etc.)
	- course numbers
	- pre-requisite courses
- A course that has already been taken will only have a name,
discipline, and course number.
- A **course load** is a set of classes. They cointain courses. They have the
following properties:
	- Total # of all courses in the load.
	- Sum of the credits of all courses in the load.
	- Total # of all courses in a certain discipline
		- This may be abstracted to total # of
		courses that satisfy a property, and
		this will be paired with a method that
		accepts a property name and testing function--
		much like Array.prototype.filter().
- A **section** is an instance of a class at a college. Each section may have
different professors from other sections, and meet at different times. 
Sections have:
	- sessions
	- names
- A **session** is a period of time wherein a class meets. Sessions have:
	- times (beginnings, ends)
	- days that they take place on
	- rooms that they take place in
	- buildings that they take place in
	- professors that teach them
- A **schedule** is a list of course sections.

The schedule-building should be able to constrain some course choices:

## Constraints

> In the interest of efficiency, in terms of both time and memory,
some constraints should be hard-coded into the program.
My initial idea was to make the constraints a list of filter methods
to apply to full lists. 
So there'd be a list of filter methods for the course array,
and we'd apply each one after the other, applying only those
for which parameters were specified. The resulting list would be
the courses left. If there are any courses left, we proceed to
the next step, otherwise we just tell the user that there
are no courses that fit the specified criteria.
Then we keep going as we keep generating more stuff.
However, some criteria make more sense for restricting what's generated
as opposed to filtering out things that are alredy generated.
Examples:
	- CLoad: Min/Max # of courses. Generate combinations of courses
	with sizes in [Min, max].
	- Schedule: Time Constraints.

> This doesn't necessarily have to be the case. I can just make the
distinction between constraints that take effect during generation,
and constraints that take effect after generation. I think the only
constraint that doesn't fit into that is "Min/Max # of Courses".

### Objects that model things

- Course constraints:
	- Choose only courses which have a number of credits
	within some range. 
		- needs a min and max.
	- Respect pre-requisites 
		- T/F, default behavior is to respect them.
	- Respect no re-taking of courses
		- T/F, default is to respect.

> Sections are a package deal of sessions. Should I change session constraints
to section constraints? I can eliminate sections that contain problematic sections.
Yeah, this makes more sense. The only real session constraint is a time conflict.
However, this constraint makes more sense for a schedule, since one time conflict means
that the entire schedule is impossible. Pieces of it may work, but those pieces will be
present elsewhere.

- Section constraints: 
	- No classes on such-such week-times
		- requires choices of days, and time ranges.
		- Right now, it'll be a collection of pairings sets of days
		with sets of time ranges, with some sort of constant to
		represent a time range of "all day".
	- No course with a certain professor.
		- Requires professor name (last, first)?
	- Only non-full / include full
		- T/F, keep an indicator of a full course. Make it obvious.
	- The section constraints should be for all possible courses,
	unless otherwise indicated by giving a list of courses to which
	a set of session constraints apply.

### Objects that model aggregates of things

In the interest of efficiency, it makes sense that the
constraints for aggregates of things be applied
differently than the constraints for things.
The things already exist. Nothing really has to 
generate them. They're just read from a file. So
there's no reason not to just filter out stuff that
doesn't fit the constraints.

However, the aggregates of things need to be generated
by the program. So if an aggregate of things is
generated that won't be used later, then I wasted time
in generating it. Therefore, I should do my best to
make sure that the least possible amount of time is
spent generating aggregates that don't satisfy the
constraints.
- Course Load constraints:
	- Min/Max credit load (total # of credits in the course load).
		- can take a min, or a max, or both.
			- If no minimum is given, assume min=0.
			- If no maximum is given, then no max will be used.
			(Kind of like having a maximum of infinity).
	- Min/Max # of total classes.
		- can take a min, or a max, or both.
			- If no minimum is given, assume min=0.
			- If no maximum is given, then no max will be used.
			(Kind of like having a maximum of infinity).
	- Min/Max # of total classes from a specific discipline.
		- can take a min, or a max, or both.
			- If no minimum is given, assume min=0.
			- If no maximum is given, then no max will be used.
			(Kind of like having a maximum of infinity).
			- If the sum of the minimums of all the discipline
			loads is greater than the minimum set in "min/max #
			of classes", then the minimum # of classes is changed
			to the total of the minimums from here. If the minimum
			number of courses was not originally 0, then a warning
			is given to the user.
		- discipline, which is a String
	- Force the choosing of certain courses 
			- (needs course name, or discipline and course number).
			- T/F, allow scheduling of additional courses. Default is allow.
			- Consider allowing these choices to bypass the constraints of
			courses.
	- Respect corequisites.

- Schedule constraints:
	- Force the choosing of certain sections from certain courses.
		- Needs section name, and course (note singular) that it applies to.
		- Forcing section will force the course it belongs to, if that course
		is not already forced.
	- Respect time conflicts (respect meaning don't allow schedules with time conflicts)
		- T/F, default, respect them

> I need to work in (OR) and (AND) for these constraints. Find some way
to combine constraints such that they do not necessarily all have to apply.
Actually, the constraints seem to work as (AND). The only place where
(OR) should be worked in are 

> Consider giving the user the option to "prime" a schedule. Give
the program a partial schedule, then have it spit out options for
sections to add to the existing schedule.

# Basic process:

1. Trim away all courses that do not meet course restrictions. 
2. Build a list of all course combinations (of all sizes) of the remaining courses. 
3. Create function that accepts an array of courses and returns
an array of schedules. Include constraint functionality.
4. Display the schedules, somehow.

Basic schedule-builder idea:

1. Accept a combination of courses.
2. Trim away all sections from courses that do not meet section constraints:
	- Choose a course from course list argument.
	- First, trim away all sections that do not meet general section contraints
	(i.e. constraints not for specific course(s).
	- Next, check all section constraints that are course specific, and see if
	the chosen course is inside of a given set of section constraints. If it
	is mentioned in that set of constraints, apply constraints.
3. Create schedules according to schedule constraints.

## Creating schedules:

The intent is to create all possible schedules that are within the schedule constraints.
Nothing else needs to be considered, because they've already been considered. All
courses that don't work are gone, and all sections that don't work are gone.

A schedule is a set of sections. So order of sections does not make a distinct schedule.


> Does size matter? From an initial standpoint, it certainly seems so.
Sometimes, the number of the courses included in a schedule may make that
schedule inappropriate (eg too few/many credits). However, some subset
of the sections of these courses may work. So say that we take a subset of
the sections. The sections that these courses belong to make a
combination of courses, each of which is a course that hasn't already
been cut during a previous step. That means that this combination was
already considered, so this schedule will be generated at another time,
or was already generated. Therefore schedule generation should just
be cartesian product of the sections for each course.

However, size matters. There are schedules of size 1, 2, 3, 4... up to the amount of
classes included in the class combination.

## Creating a schedule from a list of sections

1. Create an array of sections alongside an array of all the sessions of all the sections,
which we will call 'days' and will work like the 'days' property of a Section object.
2. Add the sessions objects of the first section to the array stored in the
appropriate day (i.e. if a session is on monday, then days.mo = [session].
3. For the rest of the sections, we go through the sessions of this section in order
of week-time (sorted by day, then by 'time.start').
For each session, we search the existing array of the appropriate day
for a time conflict. If one exists, immediately throw away the schedule
(assuming time conflicts respected), move to the next schedule.
	-  Remember that the definition of a
	time conflict in a schedule is the existence of a
	start time or end time for a session that is between
	the start and end time of another session. I'll only
	test if the beginning of one session is inside of
	another session.
/*
Each session will be tested for overlap with the existing sections.
The two cases that will be checked each time are:
	- Is the 'time.start' of the new session in between the
	'time.start' and 'time.end' of the existing session?
	- Is the 'time.start' of the existing session in between
	the 'time.start' and 'time.end' of the new session?
If no overlap exists with any existing session, then the new session is
added to the appropriate array.
*/

It's not necessarily true that I'll be doing less work for testing if I 
check for time conflicts as soon as I add a class. A better idea for
testing time conflicts:

Create an array that will hold the start and end times of sessions.
This array will represent the *entire week's worth of time*.
So a class that starts on 1300, Monday will come before a class that
starts at 800, Tuesday.
Add all of the start and end times to this array, where the key of the array
will be day (0-6) then military time. So 1300, Monday will be (11300) and
800, Tuesday will be (20800). If any two sessions have a start or end time
that is the same as another start or end time, then this is a time conflict.
Report this.
Otherwise, keep creating the array.
Then, once the array is complete, traverse the keys of the array from
least to greatest, making sure that after every class start, the next
key is the end of that same class. If not, then there's a conflict.

	1. Look for a session to add to this array.
	2. Create the key for the start of that session (day time).
	3. Make the value of that key an arbitrary number.
	4. Create the key for the end of that session (day time), make the value
	of that key the same as the value for the start key.
	5. Move to the next session. If for this session, one of the keys
	created for its start or end already exist, then there's a time
	conflict. End the process.
	6. If no key previously existed, then continue to generate keys until
	all sessions are added.
	7. Once all sessions are added, cycle through the keys in the array
	in ascending order. Check their values. The second value should be
	equal to the first, the fourth value should be equal to the third and
	so on.
	i.e. for each new value (starting with the first), make sure that
	next value matches. If not, there's a time conflict. If there is
	a match, move on to the next value and repeat.


4. If all of the sessions of this new section are successfully added to
the arrays in the 'days' object, then the new section is added to the
schedule.

## Generating the cartesian product of sections sets

How to do this? Recursion of some sort? Iteration? Iteration works well
when the number of sets in the product is known ahead of time, and can
thus be hardcoded into programming.

I could just do ( ( ( C1Sections X C2Sections ) X C3Sections ) X ... CnSections),
then sort of "ignore parentheses", so it's basically equal to 
( C1Section X ... X CnSections ).

- The disadvantage of this: it wouldn't work well with buffering. I couldn't spit
out each schedule or a batch of schedules when they're ready. They're forced
to be ready at the same time. This is because the schedule is only done when
the size of the list matches the size of course load. So all schedules that
match the size of a course load would all be finished at the same time. Given
this, it may be better to prioritize certain course load sizes, and start with
the smallest of those course load sizes, so that the user has something to look
at while potentially waiting for other stuff.
- Advantage of this: It supports the current method of finding
time conflicts early. As soon as one conflict is found in a part of a list,
then that part of the list will not appear in any schedules.
To visualize this, think of each set of sections as dots on a line.
The cartesian product of one set with another set results in a grid of dots.
We then cut all dots that have time conflicts. The remaining dots are
"flattened out" into a line, then we take the cartesian product of this
new line with the next set of sections

## Create logging system

This log will hold:

- Warnings given to users for poor choices of constriction parameters.
- All the cuts at each stage (course, load, section, schedule), and why those
cuts were made (i.e. what constriction did they fail to meet?).

## Prioritizing certain course combinations:

Size may be an important factor. Most people who will want to use this program will need
assistance in builder larger schedules, or schedules where lots of courses have lots of
conflicting schedules. So, larger sizes should be prioritized. However, larger sizes may
take longer to work on than smaller sizes, so perhaps I should start from a fairly large size,
like combos of 4 to 5 courses, then allow the user to go from these "premiere sizes"
to other sizes, which will become available as their work is done. Chances are,
callback based programming and use of buffers and iterators will be ideal.

I should have some sort of option for "dumping" choices in some form that can be used elsewhere.
Users may have other opinions about how the resulting schedules should be displayed. With this,
they can handle the data as they please.

# Displaying Schedules

Should I just have them spat out as text in a console? Perhaps I should just
make a function that takes schedules and prints out a table of some sort.

## Simple text displayer

### Displaying a single schedule

- List all courses in the course combination it comes from.
- Each row will be a day, then in order of starting times,
the sessions that take place on that day will be displayed:
"Building-Room: | Class | start-end, professor".

Example output:

Courses: MAT39204, CSC10400, ENGL21007

Mo:
MR-1/111:	MAT39204	1300-1440, Joseph Bak
NAC-4/156:	ENGL21007	1700-1815, Justin Turner 

Tu:
NAC-6/102:	CSC10400	1600-1740, Pavel Rytir

We:
MR-1/111:	MAT39204	1300-1440, Joseph Bak
NAC-4/156:	ENGL21007	1700-1815, Justin Turner

Th:
NAC-6/102:	1600-1740, Pavel Rytir
 
Fr:
NAC-4/???:	1500-1640, Emre Durmus

This output makes for a pretty easy algorithm for printing.
1. print "Courses:"
2. then print [courses].join().
3. Then print the first day key that exists, then print the
information for each session, sorted by starting time in the
format previously specified. Each "|" indicates the end of a column.
Each column should be left justified.

# Optional plans

- Create a format for quickly manually entering course data.
	- Initial sketch of the format: many courses share certain common properties, like disciplines, or the institutions that
	offer them. Allow the user to enter data in such a way these
	common properties need only be specified once for a group.
	Also allow for the nesting of these "property contexts".
	As an example, many courses will share an institution,
	and many of those courses will share different disciplines,
	so allow the creator to nest discipline contexts in the
	institution context.
	- Figure out how to begin and end a context.
	- Figure out how to begin a group of objects.
	- Learn more about file streaming and delimiters.
- Create support for degree-based constrictions.
	- (Load Constraint) : Min/max # of core courses.
	- (Load Constraint) : Min/max # of elective courses.
- Create support for users to create their own degrees, then upload them to me, so that
I don't have to do it all myself. Or upload them somewhere that others can get to them.
	- Core class list.
	- Degree electives list.
	- General Distribution needs to be fleshed out.
- Work multi-threading into the generation of schedules for
multi-core devices.
- (Schedule Constraint) : Min/Max breaks b/w sessions.

# Problems

## Clashing Constraints

Suppose that someone wants to force the choosing of some course/section.
What happens if the other constraints and this constraint clash?

For example, what happens if someone forces the choice of a class, and
insists on not taking that class with a certain professor, but that
professor teaches every section of that class? All of the sections
would be trimmed away, so the course would be trimmed away from the course load.

Should I stop executing early and warn this? Sort of like throwing an error?
Should I just continue but make what happened explicit by wanring the user?

What happens when earlier constraints cut a course which
has a forced section? Do I keep the forced section?
I'm thinking about allowing forcing to ignore all constraints
that dealt with objects of the same type (i.e. forcing a
course will ignore all course constraints, forcing a section
will ignore all section based constraints.)
I want to do this because there are certain constraints that one
may not want to stop using entirely-- just for one
course/section. Prime examples: respecting fullness,
no professors that you want, but you want the schedules anyway.
