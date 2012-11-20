var transformations =
{
	"String functions": {
		"join": {
			"arguments": "infix, arg1, arg2, ..., argN",
			"description": "Concatenates arg1 to argN with the infix string given by the first argument",
			"returnsList": false
		},
		"concat": {
			"arguments": "arg1, arg2, ..., argN",
			"description": "Returns a string of the concatenated argument values",
			"returnsList": false
		},
		"split": {
			"arguments": "regex, stringarg",
			"description": "Split the second argument at places matching the regex",
			"returnsList": true
		},
		"listJoin": {
			"arguments": "infix, list",
			"description": "Concatenates the values of the list argument with infix inserted inbetween",
			"returnsList": false
		},
		"regexToList": {
			"arguments": "regex, stringarg",
			"description": "Returns a list of strings as specified by the regex",
			"returnsList": true
		},
		"replaceAll": {
			"arguments": "thisRegex, withThatString, inThisString",
			"description": "Replaces all matches of the regex with a string",
			"returnsList": false
		}
	},
	"Arithmetic functions": {
		"add": {
			"arguments": "arg1, arg2, ..., argN",
			"shortForm": "+",
			"description": "Add arg1 to argN",
			"returnsList": false
		},
		"subtract": {
			"arguments": "arg1, arg2, ..., argN",
			"shortForm": "-",
			"description": "Subtract arg2 to argN from arg1",
			"returnsList": false
		},
		"multiply": {
			"arguments": "arg1, arg2, ..., argN",
			"shortForm": "*",
			"description": "Multiply arg1 to argN",
			"returnsList": false
		},
		"divide": {
			"arguments": "arg1, arg2",
			"shortForm": "/",
			"description": "Divide arg1 by arg2",
			"returnsList": false
		},
		"integer": {
			"arguments": "arg",
			"description": "Convert argument to integer value by taking only the integer number part",
			"returnsList": false
		},
		"mod": {
			"arguments": "arg1, arg2",
			"description": "returns: arg1 modulo arg2",
			"returnsList": false
		}
	},
	"List functions": {
		"list": {
			"arguments": "arg1, arg2, ..., argN",
			"description": "Create a list out of the arguments",
			"returnsList": true
		},
		"sublist": {
			"arguments": "listarg, from, to",
			"description": "Returns a sub list of the given list argument from index \"from\" to index \"to\" (exclusive)",
			"returnsList": true
		},
		"subListByIndex": {
			"arguments": "listarg, i1, i2, ..., iN",
			"description": "Build a list from the given list, but with elements picked as specified by the index arguments",
			"returnsList": true
		},
		"listConcat": {
			"arguments": "listArg1, listArg2, ..., listArg3",
			"description": "Concatenate the list arguments to one list",
			"returnsList": true
		},
		"getByIndex" : {
			"arguments": "listArg, index",
			"description": "Get the value at the index of the list argument",
			"returnsList": false
		},
		"_length": {
			"arguments": "arg",
			"description": "Returns the number of elements in the list. For atomar values this will be 1",
			"returnsList": false
		}
	},
	"XPath functions": {
		"xpath_abs": {
			"arguments": "x",
			"description": "Returns the absolute value of the argument.",
			"returnsList": false
		},
		"xpath_ceiling": {
			"arguments": "x",
			"description": "Returns the smallest number with no fractional part that is greater than or equal to the argument.",
			"returnsList": false
		},
		"xpath_floor": {
			"arguments": "x",
			"description": "Returns the largest number with no fractional part that is less than or equal to the argument.",
			"returnsList": false
		},
		"xpath_round": {
			"arguments": "x",
			"description": "Rounds to the nearest number with no fractional part.",
			"returnsList": false
		},
		"xpath_round_half_to_even": {
			"arguments": "x",
			"description": "Takes a number and a precision and returns a number rounded to the given precision. If the fractional part is exactly half, the result is the number whose least significant digit is even.",
			"returnsList": false
		},
		"xpath_codepoints_to_string": {
			"arguments": "cp1, ...",
			"description": "Creates an xs:string from a sequence of Unicode code points.",
			"returnsList": false
		},
		"xpath_string_to_codepoints": {
			"arguments": "str",
			"description": "Returns the sequence of Unicode code points that constitute an xs:string.",
			"returnsList": true
		},
		"xpath_compare": {
			"arguments": ["s1, s2", "s1, s2, collation"],
			"description": "Returns -1, 0, or 1, depending on whether the value of the first argument is respectively less than, equal to, or greater than the value of the second argument, according to the rules of the collation that is used.",
			"returnsList": false
		},
		"xpath_codepoint_equal": {
			"arguments": "s1, s2",
			"description": "Returns true if the two arguments are equal using the Unicode code point collation.",
			"returnsList": false
		},
		"xpath_concat": {
			"arguments": "s1, ...",
			"description": "Concatenates two or more arguments to a string.",
			"returnsList": false
		},
		"xpath_string_join": {
			"arguments": ["(s1, ...)", "(s1, ...), separator"],
			"description": "Returns the string produced by concatenating a sequence of strings using an optional separator.",
			"returnsList": false
		},
		"xpath_substring": {
			"arguments": ["s, start", "s, start, length"],
			"description": "Returns the string located at a specified place within an argument string.",
			"returnsList": false
		},
		"xpath_string_length": {
			"arguments": "s",
			"description": "Returns the length of the argument.",
			"returnsList": false
		},
		"xpath_normalize_space": {
			"arguments": "s",
			"description": "Returns the whitespace-normalized value of the argument.",
			"returnsList": false
		},
		"xpath_normalize_unicode": {
			"arguments": ["s", "s, norm"],
			"description": "Returns the normalized value of the first argument in the normalization form specified by the second (optional) argument.",
			"note": "Implemented normalization forms are NFC (default), NFD, NFKC and NFKD.",
			"returnsList": false
		},
		"xpath_upper_case": {
			"arguments": "s",
			"description": "Returns the upper-cased value of the argument.",
			"returnsList": false
		},
		"xpath_lower_case": {
			"arguments": "s",
			"description": "Returns the lower-cased value of the argument.",
			"returnsList": false
		},
		"xpath_translate": {
			"arguments": "s, map, trans",
			"description": "Returns the first string argument with occurrences of characters contained in the second argument replaced by the character at the corresponding position in the third argument.",
			"returnsList": false
		},
		"xpath_encode_for_uri": {
			"arguments": "s",
			"description": "Returns the string argument with certain characters escaped to enable the resulting string to be used as a path segment in a URI.",
			"returnsList": false
		},
		"xpath_iri_to_uri": {
			"arguments": "s",
			"description": "Returns the string argument with certain characters escaped to enable the resulting string to be used as (part of) a URI.",
			"returnsList": false
		},
		"xpath_escape_html_uri": {
			"arguments": "s",
			"description": "Returns the string argument with certain characters escaped in the manner that html user agents handle attribute values that expect URIs.",
			"note": "This is not working correctly to the specification. Try to avoid the function.",
			"returnsList": false
		},
		"xpath_contains": {
			"arguments": "s, c",
			"description": "Indicates whether one string contains another string.",
			"note": "Other than in the XPath function, a collation must not be specified.",
			"returnsList": false
		},
		"xpath_starts_with": {
			"arguments": "s, c",
			"description": "Indicates whether the value of one string begins with another string.",
			"note": "Other than in the XPath function, a collation must not be specified.",
			"returnsList": false
		},
		"xpath_ends_with": {
			"arguments": "s, c",
			"description": "Indicates whether the value of one string ends with another string.",
			"note": "Other than in the XPath function, a collation must not be specified.",
			"returnsList": false
		},
		"xpath_substring_before": {
			"arguments": "s, c",
			"description": "Returns the string that precedes in that string another string.",
			"note": "Other than in the XPath function, a collation must not be specified.",
			"returnsList": false
		},
		"xpath_substring_after": {
			"arguments": "s, c",
			"description": "Returns the string that follow in that string another string.",
			"note": "Other than in the XPath function, a collation must not be specified.",
			"returnsList": false
		},
		"xpath_matches": {
			"arguments": "s, pattern",
			"description": "Returns an boolean value that indicates whether the value of the first argument is matched by the regular expression that is the value of the second argument.",
			"note": "There may be differences to the XPath regular expression syntax. If in doubt, consult the Java regex syntax.",
			"returnsList": false
		},
		"xpath_replace": {
			"arguments": "s, pattern, replacement",
			"description": "Returns the value of the first argument with every substring matched by the regular expression that is the value of the second argument replaced by the replacement string that is the value of the third argument.",
			"note": "There may be differences to the XPath regular expression syntax. If in doubt, consult the Java regex syntax.",
			"returnsList": false
		},
		"xpath_tokenize": {
			"arguments": "s, pattern",
			"description": "Returns a sequence of one or more strings whose values are substrings of the value of the first argument separated by substrings that match the regular expression that is the value of the second argument.",
			"note": "There may be differences to the XPath regular expression syntax. If in doubt, consult the Java regex syntax.",
			"returnsList": true
		}
	}
};