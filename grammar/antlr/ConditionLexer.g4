lexer grammar ConditionLexer;

// literals
BOOL_LITERAL: 'true' | 'false';
CHARACTER_LITERAL: '\'' (~('\\' | '\''))* '\'';
INT_LITERAL: (
		DECIMAL_INT_LITERAL
		| OCTAL_INT_LITERAL
		| HEXADECIMAL_INT_LITERAL
	) [uUlL]?;

fragment DECIMAL_INT_LITERAL: NONZERO_DIGIT DIGIT*;
fragment OCTAL_INT_LITERAL: '0' OCTAL_DIGIT*;
fragment HEXADECIMAL_INT_LITERAL: '0' [xX] HEXADECIMAL_DIGIT+;

// operators
DEFINED: 'defined';
MULTIPLY: '*';
ADD: '+';
SUBTRACT: '-';
DIVIDE: '/';
MODULO: '%';
LEFT_SHIFT: '<<';
RIGHT_SHIFT: '>>';
LESS_EQUAL: '<=';
LESS: '<';
GREATER: '>';
GREATER_EQUAL: '>=';
EQUAL: '==';
NOT_EQUAL: '!=';
BIT_UNARY: '~';
LOGICAL_AND: '&&';
LOGICAL_OR: '||';
LOGICAL_UNARY: '!';
BIT_AND: '&';
BIT_XOR: '^';
BIT_OR: '|';
COLON: ':';
QUESTION_MARK: '?';
LRB: '(';
RRB: ')';

// identifier
IDENTIFIER: ('_' | LETTER) ('_' | LETTER | DIGIT)*;

// fragments
fragment LETTER: [a-zA-Z];
fragment DIGIT: '0' | NONZERO_DIGIT;
fragment NONZERO_DIGIT: [1-9];
fragment OCTAL_DIGIT: [0-7];
fragment HEXADECIMAL_DIGIT: DIGIT | [a-fA-F];

// hidden
SPACE: ' ' -> channel(HIDDEN);
TAB: '\t' -> channel(HIDDEN);
