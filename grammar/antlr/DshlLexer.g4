lexer grammar DshlLexer;

ASSERT: '##assert';
PREPROCESSOR:
	'#' ' '* ('#' ' '*)? (
		'if'
		| 'elif'
		| 'else'
		| 'endif'
		| 'ifdef'
		| 'ifndef'
		| 'define'
		| 'undef'
		| 'pragma'
		| 'include'
		| 'error'
	) ~[\r\n]* -> channel(HIDDEN);
NEW_LINE: ('\r\n' | '\r' | '\n') -> channel(HIDDEN);
SPACE: ' ' -> channel(HIDDEN);
TAB: '\t' -> channel(HIDDEN);
LINE_CONTINUATION: '\\' -> channel(HIDDEN);
MULTI_LINE_COMMENT: '/*' .*? '*/' -> channel(HIDDEN);
SINGLE_LINE_COMMENT: '//' ~[\r\n]* -> channel(HIDDEN);

FLOAT_LITERAL: (
		(([0-9]+)? '.' [0-9]+ | [0-9]+ '.') ([eE][+-]? [0-9]+)?
		| [0-9]+ [eE][+-]? [0-9]+
	) [hHfFlL]?;
INT_LITERAL: (
		'0' [xX]([0-9] | [a-fA-F])+
		| [1-9][0-9]*
		| '0' [0-7]*
	) [uUlL]?;
STRING_LITERAL: '"' (('\\' .) | ~["\\])* '"';
CHAR_LITERAL: '\'' (('\\' .) | ~['\\])* '\'';
BOOL_LITERAL: 'true' | 'false';

BREAK: 'break';
CONTINUE: 'continue';
DISCARD: 'discard';
RETURN: 'return';
FOR: 'for';
IF: 'if';
ELSE: 'else';
SWITCH: 'switch';
CASE: 'case';
DEFAULT: 'default';
DO: 'do';
WHILE: 'while';
TYPEDEF: 'typedef';
TEMPLATE: 'template';
ENUM: 'enum';
CLASS: 'class';
STRUCT: 'struct';
INTERFACE: 'interface';
NAMESPACE: 'namespace';
TYPENAME: 'typename';

HLSL: 'hlsl';
ASSUME: 'assume';
DONT_RENDER: 'dont_render';
NO_DYNSTCODE: 'no_dynstcode';
RENDER_TRANS: 'render_trans';
NO_ABLEND: 'no_ablend';
RENDER_STAGE: 'render_stage';
INTERVAL: 'interval';
BLOCK: 'block';

MACRO: 'macro';
DEFINE_MACRO_IF_NOT_DEFINED: 'define_macro_if_not_defined';
ENDMACRO: 'endmacro';
SHADER: 'shader';
SUPPORTS: 'supports';

INCREMENT: '++';
DECREMENT: '--';

MODIFY:
	'+='
	| '-='
	| '*='
	| '/='
	| '%='
	| '<<='
	| '>>='
	| '&='
	| '|='
	| '^=';

AND: '&&';
OR: '||';
LESS_EQUAL: '<=';
GREATER_EQUAL: '>=';
EQUALITY: '==' | '!=';
NOT: '!';

ASSIGN: '=';

QUESTION: '?';
COLON: ':';

COMMA: ',';
BITWISE_NOT: '~';
BITWISE_AND: '&';
BITWISE_OR: '|';
BITWISE_XOR: '^';
SHIFT: '<<' | '>>';

DOT: '.';

AT: '@';

ADD: '+';
SUBTRACT: '-';
MULTIPLY: '*';
DIVIDE: '/';
MODULO: '%';

LSB: '[';
RSB: ']';
LRB: '(';
RRB: ')';
LCB: '{';
RCB: '}';
LAB: '<';
RAB: '>';

IDENTIFIER: [a-zA-Z_][a-zA-Z_0-9]*;

SEMICOLON: ';';
