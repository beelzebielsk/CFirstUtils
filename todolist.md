# Small

- Massage the output of searchParse to have a 'days' object which has the structure of
	the days object from the 'section' type defined in 'schedulingCurrent.md'
- Work on curricParse.js until it produces output in such a way that:
	- Well defined courses that stick to a neat structure are parsed
	- Deviations are reported and I can handle them myself.

# Big

- implement logging system which should keep track of:
	- forced sections that did not exist
	- forced classes that did not exist
	- wildcards with no results
	- Any instance where the program ignores an error to keep running.
- implement extensible filter system.
- implement forcing sections into a schedule.
- implement wildcard functionality for forcing courses into a schedule.
- implement GUI:
	- Text view of schedule
	- Planner/calendar view of schedule
