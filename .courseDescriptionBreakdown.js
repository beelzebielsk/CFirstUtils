var disc = '\\w{2,4}';
var number = '\\d{5}'; // Note that footnotes will become a normal number.
											 // Has to be ignored.
var requisiteType_noCap = '(?:Pre|Co|Pre/Co)';
var requisiteType_Cap = '(Pre|Co|Pre/Co)';
var minimumGrade_noCap = '\\(.*(?:[ABCDEF]).*\\)';
var minimumGrade_Cap = '\\(.*([ABCDEF]).*\\)';
var requisiteCourse =  requisiteType_noCap + ': ' + disc + ' ' + number + '\\s*(?:' + minimumGrade_noCap + ')?';
var singleRequisite = '(?:' + requisiteCourse + '|FIQWS|permission)';
var requisiteConnector_noCap = '(?:or|&)';
var requisiteConnector_Cap = '(or|&)';
var requisites = singleRequisite + '(?:\\s*' + requisiteConnector_noCap + '?\\s*' + singleRequisite + ')*';
var credits_noCap = '\\d\\s?cr\\.';
var credits_cap = '(\\d\\s?cr\\.)';
var simpleCourse =
	  '^(' + disc + ') (' + number + ').*$\\n'
	+ '^(.*)$\\n' // Course Name
	+ '^(' + requisites + ')*$\\n'
	+ '^' + credits_cap + '$'
	;

