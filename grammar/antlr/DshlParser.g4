parser grammar DshlParser;

options {
	tokenVocab = DshlLexer;
}

dshl: dshl_statement*;

dshl_function_call: IDENTIFIER LRB expression_list? RRB;

dshl_macro_statement: (MACRO | DEFINE_MACRO_IF_NOT_DEFINED) IDENTIFIER LRB (
		IDENTIFIER (COMMA IDENTIFIER)*
	)? RRB dshl_statement* ENDMACRO;

dshl_interval_declaration:
	INTERVAL IDENTIFIER COLON (dshl_expression COMMA)* IDENTIFIER SEMICOLON;

dshl_variable_declaration:
	dshl_modifier* IDENTIFIER IDENTIFIER dshl_array_subscript? (
		ASSIGN dshl_expression
	)? dshl_modifier* SEMICOLON;

dshl_statement:
	ASSUME IDENTIFIER ASSIGN dshl_expression SEMICOLON
	| DONT_RENDER SEMICOLON
	| NO_DYNSTCODE SEMICOLON
	| RENDER_TRANS SEMICOLON
	| NO_ABLEND SEMICOLON
	| RENDER_STAGE IDENTIFIER SEMICOLON
	| dshl_if_statemetn
	| dshl_function_call SEMICOLON
	| dshl_shader_declaration
	| dshl_hlsl_block
	| dshl_assignment
	| dshl_block_block
	| dshl_supports_statement
	| dshl_statement_block
	| dshl_variable_declaration
	| dshl_interval_declaration
	| dshl_macro_statement
	| dshl_preshader
	| dshl_function_call;

dshl_assignment:
	IDENTIFIER ASSIGN dshl_expression SEMICOLON
	| IDENTIFIER AT IDENTIFIER dshl_array_subscript? (
		ASSIGN dshl_expression SEMICOLON?
		| COLON IDENTIFIER LRB dshl_expression RRB dshl_hlsl_block SEMICOLON?
		| ASSIGN IDENTIFIER dshl_hlsl_block SEMICOLON
	);

dshl_array_subscript: LSB dshl_expression? RSB;

dshl_if_statemetn:
	IF LRB dshl_expression RRB dshl_statement (
		ELSE dshl_statement
	)?;

dshl_expression_list: dshl_expression (COMMA dshl_expression)*;

dshl_shader_declaration:
	SHADER IDENTIFIER (COMMA IDENTIFIER)* dshl_statement_block;

dshl_preshader: LRB IDENTIFIER RRB dshl_statement_block;

dshl_statement_block: LCB dshl_statement* RCB;

dshl_modifier: IDENTIFIER; // eg. static

dshl_hlsl_block: HLSL (LRB IDENTIFIER RRB)? LCB hlsl RCB;

dshl_preshader_block: LRB IDENTIFIER RRB dshl_statement_block;

dshl_block_block:
	BLOCK LRB IDENTIFIER RRB IDENTIFIER dshl_statement_block;

dshl_supports_statement: SUPPORTS IDENTIFIER SEMICOLON;

dshl_expression:
	(
		literal
		| dshl_function_call
		| SHADER
		| IDENTIFIER
		| LCB dshl_expression_list RCB
	)
	| LRB dshl_expression_list RRB
	| dshl_expression (
		INCREMENT
		| DECREMENT
		| dshl_array_subscript
		| DOT IDENTIFIER
		| DOT dshl_function_call
	)
	| (
		INCREMENT
		| DECREMENT
		| ADD
		| SUBTRACT
		| NOT
		| BITWISE_NOT
	) dshl_expression
	| dshl_expression (MULTIPLY | DIVIDE | MODULO) dshl_expression
	| dshl_expression (ADD | SUBTRACT) dshl_expression
	| dshl_expression SHIFT dshl_expression
	| dshl_expression (LAB | LESS_EQUAL | GREATER_EQUAL | RAB) dshl_expression
	| dshl_expression EQUALITY dshl_expression
	| dshl_expression BITWISE_AND dshl_expression
	| dshl_expression BITWISE_XOR dshl_expression
	| dshl_expression BITWISE_OR dshl_expression
	| dshl_expression AND dshl_expression
	| dshl_expression OR dshl_expression
	| dshl_expression (ASSIGN | MODIFY) dshl_expression;

hlsl:
	(
		namespace
		| state_object
		| shader_constant
		| function_declaration
		| function_definition
		| variable_declaration_statement
		| type_declaration_statement
	)*;

function_declaration: function_header SEMICOLON;

function_definition: function_header statement_block;

function_header:
	template? function_attribute* function_storage_class* clipplanes* precise* type hlsl_identifier
		operator? LRB parameter_list? RRB semantic*;

function_attribute:
	LSB hlsl_identifier (LRB expression_list RRB)? RSB;

operator:
	INCREMENT
	| DECREMENT
	| ADD
	| SUBTRACT
	| MULTIPLY
	| DIVIDE
	| MODULO
	| LSB RSB
	| LAB RAB
	| MODIFY
	| AND
	| OR
	| LESS_EQUAL
	| GREATER_EQUAL
	| EQUALITY
	| NOT
	| ASSIGN
	| COMMA
	| BITWISE_NOT
	| BITWISE_AND
	| BITWISE_OR
	| BITWISE_XOR
	| SHIFT;

template: TEMPLATE (LAB template_parameter_list? RAB);

template_parameter_list: (CLASS | TYPENAME) hlsl_identifier (
		COMMA (CLASS | TYPENAME) hlsl_identifier
	)*;

parameter_list: parameter (COMMA parameter)*;

parameter:
	input_modifier* type hlsl_identifier semantic* (
		COLON interpolation_modifier
	)* (ASSIGN expression)?;

input_modifier: hlsl_identifier; // in, out, inout, uniform

precise: hlsl_identifier; // precise

semantic: COLON expression;

variable_declaration:
	variable_storage_class* type_modifier* type variable_initialization (
		COMMA variable_initialization
	)*;

variable_initialization:
	hlsl_identifier (AT IDENTIFIER)? (LSB expression RSB)* semantic* packoffset* register* (
		(ASSIGN expression | statement_block)
	)?;

type_declaration:
	template? type_keyowrd hlsl_identifier LCB struct_member_declaration* RCB;

type_keyowrd: STRUCT | ENUM CLASS | ENUM | CLASS | INTERFACE;

namespace: NAMESPACE hlsl_identifier statement_block;

struct_member_declaration:
	//interpolation_modifier* type hlsl_identifier SEMICOLON
	variable_declaration_statement
	| function_definition;

interpolation_modifier:
	hlsl_identifier; //linear, centroid, nointerpolation, noperspective, sample

typedef: TYPEDEF const* type hlsl_identifier;

const: hlsl_identifier; // const

state_object:
	type hlsl_identifier (AT hlsl_identifier)? ASSIGN LCB (
		expression_list
	) RCB SEMICOLON;

shader_constant:
	type hlsl_identifier register* statement_block SEMICOLON;

statement:
	statement_block
	| state_object
	| shader_constant
	| variable_declaration_statement
	| type_declaration_statement
	| return_statement
	| break_statement
	| continue_statement
	| discard_satement
	| do_statement
	| for_statement
	| if_statement
	| switch_statement
	| case
	| default
	| while_statement
	| expression_statement
	| SEMICOLON;

statement_block: LCB statement* RCB;

expression_statement: expression SEMICOLON;

variable_declaration_statement: variable_declaration SEMICOLON;

type_declaration_statement: type_declaration SEMICOLON;

return_statement: RETURN expression? SEMICOLON;

break_statement: BREAK SEMICOLON;

continue_statement: CONTINUE SEMICOLON;

discard_satement: DISCARD SEMICOLON;

do_statement:
	do_attribute* DO statement WHILE LRB expression RRB SEMICOLON;

do_attribute:
	LSB hlsl_identifier RSB
	| hlsl_identifier; // fastopt

for_statement:
	loop_attribute* FOR LRB variable_declaration? SEMICOLON expression_list? SEMICOLON
		expression_list? RRB statement;

loop_attribute:
	LSB hlsl_identifier (LRB expression RRB)? RSB
	| hlsl_identifier; // unroll(x), loop, fastopt, allow_uav_condition

if_statement:
	if_attribute* IF LRB expression RRB statement (
		ELSE statement
	)?;

if_attribute:
	LSB hlsl_identifier RSB
	| hlsl_identifier; // flatten, branch

switch_statement:
	switch_attribute* SWITCH LRB expression RRB statement;

case: CASE expression COLON statement*;

default: DEFAULT COLON statement*;

switch_attribute:
	LSB hlsl_identifier RSB
	| hlsl_identifier; // flatten, branch, forcecase, call

while_statement:
	loop_attribute* WHILE LRB expression RRB statement;

function_call:
	hlsl_identifier (LAB expression_list? RAB)* LRB expression_list? RRB;

expression_list: expression (COMMA expression)* COMMA?;

expression:
	(
		literal
		| function_call
		| hlsl_identifier
		| LCB expression_list RCB
	)
	| LRB expression_list RRB
	| expression (
		INCREMENT
		| DECREMENT
		| array_subscript
		| DOT hlsl_identifier
		| DOT function_call
	)
	| (
		INCREMENT
		| DECREMENT
		| ADD
		| SUBTRACT
		| NOT
		| BITWISE_NOT
		| LRB IDENTIFIER RRB
	) expression
	| expression (MULTIPLY | DIVIDE | MODULO) expression
	| expression (ADD | SUBTRACT) expression
	| expression SHIFT expression
	| expression (LAB | LESS_EQUAL | GREATER_EQUAL | RAB) expression
	| expression EQUALITY expression
	| expression BITWISE_AND expression
	| expression BITWISE_XOR expression
	| expression BITWISE_OR expression
	| expression AND expression
	| expression OR expression
	| expression QUESTION expression COLON expression
	| expression (ASSIGN | MODIFY) expression;

literal:
	INT_LITERAL
	| FLOAT_LITERAL
	| BOOL_LITERAL
	| STRING_LITERAL;

function_storage_class: hlsl_identifier; // inline

variable_storage_class: hlsl_identifier;
// extern, nointerpolation, precise, shared, groupshared, static, uniform, volatile

type_modifier: hlsl_identifier; // const, row_major, column_major

packoffset:
	COLON hlsl_identifier LRB expression RRB; // packoffset

register:
	COLON hlsl_identifier LRB expression_list RRB; // register

clipplanes: hlsl_identifier LRB expression RRB; // clipplanes

array_subscript: LSB expression RSB;

type:
	hlsl_identifier (LAB expression_list? RAB)* array_subscript*;

hlsl_identifier:
	IDENTIFIER
	| HLSL
	| ASSUME
	| DONT_RENDER
	| NO_DYNSTCODE
	| RENDER_TRANS
	| NO_ABLEND
	| RENDER_STAGE
	| INTERVAL
	| BLOCK
	| MACRO
	| DEFINE_MACRO_IF_NOT_DEFINED
	| ENDMACRO
	| SHADER
	| SUPPORTS;
