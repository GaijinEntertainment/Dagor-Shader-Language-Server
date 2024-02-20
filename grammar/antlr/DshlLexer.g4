lexer grammar DshlLexer;

PREPROCESSOR: '#' ~[\r\n]* -> channel(HIDDEN);
// PREPROCESSOR: '#' (('/'? ~[\r\n*/]) | '*')* ('/' ~[\r\n*/])? -> channel(HIDDEN);
NEW_LINE: ('\r\n' | '\r' | '\n') -> channel(HIDDEN);
SPACE: ' ' -> channel(HIDDEN);
TAB: '\t' -> channel(HIDDEN);
LINE_CONTINUATION: '\\' -> channel(HIDDEN);
MULTI_LINE_COMMENT: '/*' .*? '*/' -> channel(HIDDEN);
SINGLE_LINE_COMMENT: '//' ~[\r\n]* -> channel(HIDDEN);

FLOAT_LITERAL: (
		([0-9]+? '.' [0-9]+ | [0-9]+ '.') ([eE][+-]? [0-9]+)?
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

// TRUE: 'true'; FALSE: 'false'; NULL: 'NULL'; VOID: 'void';

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
// COMPILE: 'compile'; COMPILE_FRAGMENT: 'compile_fragment'; ASM: 'asm'; ASM_FRAGMENT:
// 'asm_fragment'; FXGROUP: 'fxgroup'; PIXELFRAGMENT: 'pixelfragment'; VERTEXFRAGMENT:
// 'vertexfragment'; STATEBLOCK: 'stateblock'; STATEBLOCK_STATE: 'stateblock_state'; TECHNIQUE:
// 'technique'; TECHNIQUE10: 'technique10'; TECHNIQUE11: 'technique11'; PASS: 'pass';
TYPEDEF: 'typedef';
TEMPLATE: 'template';
ENUM: 'enum';
CLASS: 'class';
STRUCT: 'struct';
INTERFACE: 'interface';
NAMESPACE: 'namespace';
TYPENAME: 'typename';

HLSL: 'hlsl';
// INCLUDE: 'include'; INCLUDE_OPTIONAL: 'include_optional';
ASSUME: 'assume';
DONT_RENDER: 'dont_render';
NO_DYNSTCODE: 'no_dynstcode';
RENDER_TRANS: 'render_trans';
NO_ABLEND: 'no_ablend';
RENDER_STAGE: 'render_stage';
INTERVAL: 'interval';
BLOCK: 'block';
// FRAME: 'frame'; GLOBAL_CONST: 'global_const'; SCENE: 'scene'; OBJECT: 'object';

MACRO: 'macro';
DEFINE_MACRO_IF_NOT_DEFINED: 'define_macro_if_not_defined';
ENDMACRO: 'endmacro';
SHADER: 'shader';
SUPPORTS: 'supports';

// ALWAYS_REFERENCED: 'always_referenced'; STATIC: 'static'; DYNAMIC: 'dynamic'; LOCAL: 'local';
// CHANNEL: 'channel'; NO_WARNINGS: 'no_warnings'; CONST: 'const'; //modifier UNDEFINED_VALUE:
// 'undefined_value'; PUBLIC: 'public'; SIGNED_PACK: 'signed_pack'; UNSIGNED_PACK: 'unsigned_pack';
// MUL_1K: 'mul_1k'; MUL_2K: 'mul_2k'; MUL_4K: 'mul_4k'; MUL_8K: 'mul_8k'; MUL_16K: 'mul_16k';
// MUL_32767: 'mul_32767'; BOUNDING_PACK: 'bounding_pack'; OPTIONAL: 'optional'; GLOBAL: 'global';

// //vs|hs|ds|gs|ps|cs

// CENTROID: 'centroid'; COLUMN_MAJOR: 'column_major'; // CONST: 'const'; EXPORT: 'export'; EXTERN:
// 'extern'; GROUPSHARED: 'groupshared'; IN: 'in'; INLINE: 'inline'; INOUT: 'inout'; LINE: 'line';
// LINEADJ: 'lineadj'; LINEAR: 'linear'; NOINTERPOLATION: 'nointerpolation'; NOPERSPECTIVE:
// 'noperspective'; OUT: 'out'; PACKOFFSET: 'packoffset'; POINT: 'point'; PRECISE: 'precise';
// REGISTER: 'register'; ROW_MAJOR: 'row_major'; SAMPLE: 'sample'; SHARED: 'shared'; SNORM: 'snorm';
// // STATIC: 'static'; TRIANGLE: 'triangle'; TRIANGLEADJ: 'triangleadj'; UNIFORM: 'uniform'; UNORM:
// 'unorm'; UNSIGNED: 'unsigned'; VOLATILE: 'volatile'; GLOBALLYCOHERENT: 'globallycoherent';

// ATTRIBUTE: 'domain' | 'earlydepthstencil' | 'instance' | 'maxtessfactor' | 'numthreads' |
// 'outputcontrolpoints' | 'outputtopology' | 'partitioning' | 'patchconstantfunc' | 'fastopt' |
// 'unroll' | 'loop' | 'allow_uav_condition' | 'branch' | 'flatten' | 'call' | 'maxvertexcount' |
// 'ifAll' | 'ifAny' | 'isolate' | 'maxexports' | 'maxInstructionCount' | 'maxtempreg' |
// 'noExpressionOptimizations' | 'predicate' | 'predicateBlock' | 'reduceTempRegUsage' |
// 'removeUnusedInputs' | 'sampreg' | 'unused' | 'xps' | 'WaveSize' | 'forcecase' |
// 'WaveOpsIncludeHelperLanes' | 'shader';

// SEMANTIC: 'BINORMAL' [0-9]* | 'BLENDINDICES' [0-9]* | 'BLENDWEIGHT' [0-9]* | 'COLOR' [0-9]* |
// 'NORMAL' [0-9]* | 'POSITION' [0-9]* | 'POSITIONT' [0-9]* | 'PSIZE' [0-9]* | 'TANGENT' [0-9]* |
// 'TEXCOORD' [0-9]* | 'TESSFACTOR' [0-9]* | 'DEPTH' [0-9]* | 'FOG' | 'VFACE' | 'VPOS' | 'SV_Target'
// [0-9]* | 'SV_ClipDistance' [0-9]* | 'SV_CullDistance' [0-9]* | 'SV_Coverage' | 'SV_Depth' |
// 'SV_DepthGreaterEqual' | 'SV_DepthLessEqual' | 'SV_DispatchThreadID' | 'SV_DomainLocation' |
// 'SV_GroupID' | 'SV_GroupIndex' | 'SV_GroupThreadID' | 'SV_GSInstanceID' | 'SV_InnerCoverage' |
// 'SV_StencilRef' | 'SV_InsideTessFactor' | 'SV_InstanceID' | 'SV_IsFrontFace' |
// 'SV_OutputControlPointID' | 'SV_Position' | 'SV_PrimitiveID' | 'SV_RenderTargetArrayIndex' |
// 'SV_SampleIndex' | 'SV_TessFactor' | 'SV_VertexID' | 'SV_ViewportArrayIndex' | 'SV_ShadingRate' |
// 'SV_ViewID' | 'SV_Barycentrics' | 'SV_CullPrimitive';

// TYPE: 'RaytracingAccelerationStructure' | 'RayDesc' | 'BuiltInTriangleIntersectionAttributes' |
// 'StateObjectConfig' | 'GlobalRootSignature' | 'LocalRootSignature' |
// 'SubobjectToEntrypointAssociation' | 'RaytracingShaderConfig' | 'RaytracingPipelineConfig' |
// 'RaytracingPipelineConfig1' | 'TriangleHitGroup' | 'ProceduralPrimitiveHitGroup'

// //B | 'RAY_FLAG' | 'RAYTRACING_PIPELINE_FLAG' | 'COMMITTED_STATUS' | 'CANDIDATE_TYPE'

// //C | 'AppendStructuredBuffer' | 'Buffer' | 'ByteAddressBuffer' | 'ConsumeStructuredBuffer' |
// 'RWBuffer' | 'RWByteAddressBuffer' | 'RWStructuredBuffer' | 'StructuredBuffer' | 'tbuffer' |
// 'cbuffer' | 'ConstantBuffer' | 'RasterizerOrderedBuffer' | 'RasterizerOrderedByteAddressBuffer' |
// 'RasterizerOrderedStructuredBuffer'

// //D | 'sampler' | 'sampler1D' | 'sampler2D' | 'sampler3D' | 'samplerCUBE' | 'texture' |
// 'texture1D' | 'texture2D' | 'texture3D' | 'textureCUBE' | 'RWTexture1D' | 'RWTexture1DArray' |
// 'RWTexture2D' | 'RWTexture2DArray' | 'RWTexture3D' | 'Texture1D' | 'Texture1DArray' | 'Texture2D'
// | 'Texture2DArray' | 'Texture2DMS' | 'Texture2DMSArray' | 'Texture3D' | 'TextureCube' |
// 'TextureCubeArray' | 'FeedbackTexture2D' | 'FeedbackTexture2DArray' |
// 'RasterizerOrderedTexture1D' | 'RasterizerOrderedTexture1DArray' | 'RasterizerOrderedTexture2D' |
// 'RasterizerOrderedTexture2DArray' | 'RasterizerOrderedTexture3D'

// //E | 'BlendState' | 'DepthStencilState' | 'InputPatch' | 'LineStream' | 'OutputPatch' |
// 'PointStream' | 'RasterizerState' | 'SamplerState' | 'SamplerComparisonState' | 'TriangleStream'
// | 'sampler_state' | 'ComputeShader' | 'DomainShader' | 'GeometryShader' | 'HullShader' |
// 'PixelShader' | 'VertexShader' | 'RenderTargetView' | 'DepthStencilView' | 'Technique' |
// 'RayQuery'

// //F | '@tex' | '@tex2d' | '@tex3d' | '@texArray' | '@texCube' | '@texCubeArray' | '@smp' |
// '@smp2d' | '@smp3d' | '@smpArray' | '@smpCube' | '@smpCubeArray' | '@shd' | '@buf' | '@cbuf' |
// '@uav'

// //G | 'vector' | 'matrix' | 'string'

// //H | PRIMITIVE_TPYE ([1-4] ('x' [1-4])?)?

// //I | '@f' [1-4] | '@f44' | '@i' [1-4];

// texture|buffer|const_buffer|sampler
// bool|float|float1|float2|float3|float4|float4x4|int|int4|color8|short2|short4|ubyte4|short2n|short4n|ushort2n|ushort4n|half2|half4|udec3|dec3n

// fragment PRIMITIVE_TPYE: 'bool' | 'int' | 'uint' | 'dword' | 'half' | 'float' | 'double' |
// 'min16float' | 'min10float' | 'min16int' | 'min12int' | 'min16uint' | 'uint64_t' | 'int64_t' |
// 'float16_t' | 'uint16_t' | 'int16_t' | 'float32_t' | 'float64_t' | 'int32_t' | 'uint32_t' |
// 'uint8_t4_packed' | 'int8_t4_packed';

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
