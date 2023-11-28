parser grammar ConditionParser;

options {
	tokenVocab = ConditionLexer;
}

//                                                                     operator precedence
expression:
	BOOL_LITERAL
	| INT_LITERAL
	| CHARACTER_LITERAL
	| IDENTIFIER
	| DEFINED LRB IDENTIFIER RRB
	| DEFINED IDENTIFIER
	| LRB expression RRB //                                                    1
	| (ADD | SUBTRACT | LOGICAL_UNARY | BIT_UNARY) expression //               2
	| expression (MULTIPLY | DIVIDE | MODULO) expression //                    3
	| expression (ADD | SUBTRACT) expression //                                4
	| expression (LEFT_SHIFT | RIGHT_SHIFT) expression //                      5
	| expression (LESS | LESS_EQUAL | GREATER | GREATER_EQUAL) expression //   6
	| expression (EQUAL | NOT_EQUAL) expression //                             7
	| expression BIT_AND expression //                                         8
	| expression BIT_XOR expression //                                         9
	| expression BIT_OR expression //                                         10
	| expression LOGICAL_AND expression //                                    11
	| expression LOGICAL_OR expression //                                     12
	| expression QUESTION_MARK expression COLON expression; //                13
