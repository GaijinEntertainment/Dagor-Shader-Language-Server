import { LanguageElementInfo } from '../interface/language-element-info';
import {
    gather,
    gatherAlpha,
    gatherBlue,
    gatherCmp,
    gatherCmpAlpha,
    load,
    sample,
    sampleBias,
    sampleCmp,
    sampleCmpLevelZero,
    sampleGrad,
    sampleLevel,
} from './hlsl-texture-member-functions';

export const hlslKeywords: LanguageElementInfo[] = [
    {
        name: 'true',
    },
    {
        name: 'false',
    },
    {
        name: 'NULL',
    },
    {
        name: 'register',
        description: 'Optional keyword for assigning a shader variable to a particular register.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-register'],
    },
    {
        name: 'packoffset',
        description: 'Optional shader constant packing keyword.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-packoffset'],
    },
    {
        name: 'template',
        description:
            'Functions can be defined with generic type arguments provided those types support all the methods and operators used in the function.',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/HLSL-2021#template-functions-and-structs'],
    },
    {
        name: 'break',
        description: 'Exit the surrounding loop (do, for, while).',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-break'],
    },
    {
        name: 'continue',
        description:
            'Stop executing the current loop (do, for, while), update the loop conditions, and begin executing from the top of the loop.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-continue'],
    },
    {
        name: 'discard',
        description: 'Do not output the result of the current pixel.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-discard'],
    },
    {
        name: 'return',
        description: 'A return statement signals the end of a function.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-return'],
    },
    {
        name: 'for',
        description:
            'Iteratively executes a series of statements, based on the evaluation of the conditional expression.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for'],
    },
    {
        name: 'if',
        description:
            'Conditionally execute a series of statements, based on the evaluation of the conditional expression.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if'],
    },
    {
        name: 'else',
        description:
            'Conditionally execute a series of statements, based on the evaluation of the conditional expression.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if'],
    },
    {
        name: 'switch',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch'],
    },
    {
        name: 'case',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch'],
    },
    {
        name: 'default',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch'],
    },
    {
        name: 'do',
        description: 'Execute a series of statements continuously until the conditional expression fails.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-do'],
    },
    {
        name: 'while',
        description: 'Executes a statement block until the conditional expression fails.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while'],
    },
    {
        name: 'compile',
        description: 'Declare a shader variable within an effect pass.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-shader'],
    },
    {
        name: 'compile_fragment',
        description:
            'Each Microsoft High Level Shader Language (HLSL) function can be converted into a shader fragment with the addition of a fragment declaration.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax'],
    },
    {
        name: 'typedef',
        description: 'In addition to the built-in intrinsic data types, HLSL supports user-defined or custom types.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-user-defined'],
    },
    {
        name: 'asm',
    },
    {
        name: 'fxgroup',
    },
    {
        name: 'pixelfragment',
        description:
            'Each Microsoft High Level Shader Language (HLSL) function can be converted into a shader fragment with the addition of a fragment declaration.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax'],
    },
    {
        name: 'vertexfragment',
        description:
            'Each Microsoft High Level Shader Language (HLSL) function can be converted into a shader fragment with the addition of a fragment declaration.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax'],
    },
    {
        name: 'stateblock',
    },
    {
        name: 'stateblock_state',
    },
    {
        name: 'technique',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax'],
    },
    {
        name: 'technique10',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax'],
    },
    {
        name: 'technique11',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d11/d3d11-effect-technique-syntax'],
    },
    {
        name: 'pass',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax'],
    },
    {
        name: 'struct',
        description: 'Declares a structure using HLSL.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct'],
    },
    {
        name: 'enum',
    },
    {
        name: 'class',
        description: 'A class behaves in a similar manner to classes in C++.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/overviews-direct3d-11-hlsl-dynamic-linking-class#declaring-classes',
        ],
    },
    {
        name: 'interface',
        description: 'An interface functions in a similar manner to an abstract base class in C++.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/overviews-direct3d-11-hlsl-dynamic-linking-class#declaring-interfaces',
        ],
    },
    {
        name: 'namespace',
    },
    {
        name: 'typename',
        description:
            'Functions can be defined with generic type arguments provided those types support all the methods and operators used in the function.',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/HLSL-2021#template-functions-and-structs'],
    },
];

export const hlslPreprocessorDirectives: LanguageElementInfo[] = [
    {
        name: '#define',
        sortName: 'define',
        description: 'Preprocessor directive that defines a constant or a macro.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-define'],
    },
    {
        name: '#undef',
        sortName: 'undef',
        description:
            'Preprocessor directive that removes the current definition of a constant or macro that was previously defined using the #define directive.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-undef'],
    },
    {
        name: '#ifdef',
        sortName: 'ifdef',
        description:
            'Preprocessor directives that determine whether a specific preprocessor constant or macro is defined.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-ifdef'],
    },
    {
        name: '#ifndef',
        sortName: 'ifndef',
        description:
            'Preprocessor directives that determine whether a specific preprocessor constant or macro is defined.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-ifdef'],
    },
    {
        name: '#if',
        sortName: 'if',
        description: 'Preprocessor directives that control compilation of portions of a source file.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if'],
    },
    {
        name: '#elif',
        sortName: 'elif',
        description: 'Preprocessor directives that control compilation of portions of a source file.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if'],
    },
    {
        name: '#else',
        sortName: 'else',
        description: 'Preprocessor directives that control compilation of portions of a source file.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if'],
    },
    {
        name: '#endif',
        sortName: 'endif',
        description: 'Preprocessor directives that control compilation of portions of a source file.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if'],
    },
    {
        name: '#error',
        sortName: 'error',
        description: 'Preprocessor directive that produces compiler-time error messages.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-error'],
    },
    {
        name: '#include',
        sortName: 'include',
        description:
            'Preprocessor directive that inserts the contents of the specified file into the source program at the point where the directive appears.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-include'],
    },
    {
        name: '#line',
        sortName: 'line',
        description:
            "Preprocessor directive that sets the compiler's internally-stored line number and filename to the specified values.",
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-line'],
    },
    {
        name: '#pragma',
        sortName: 'pragma',
        description:
            'Preprocessor directive that provides machine-specific or operating system-specific features while retaining overall compatibility with the C and C++ languages.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma'],
    },
];

export const hlslPreprocessorPragmaDirectives: LanguageElementInfo[] = [
    {
        name: 'def',
        description: 'Pragma directive that manually allocates a floating-point shader register.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma-def',
        ],
    },
    {
        name: 'message',
        description: 'Pragma directive that produces compiler-time messages.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/message-pragma-directive--directx-hlsl-'],
    },
    {
        name: 'pack_matrix',
        description: 'Pragma directive that specifies packing alignment for matrices.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma-pack-matrix',
        ],
    },
    {
        name: 'warning',
        description: 'Pragma directive that modifies the behavior of compiler warning messages.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma-warning',
        ],
    },
];

export const hlslDshlPreprocessorDirectives: LanguageElementInfo[] = [
    {
        name: '##if',
        sortName: 'if',
    },
    {
        name: '##elif',
        sortName: 'elif',
    },
    {
        name: '##else',
        sortName: 'else',
    },
    {
        name: '##endif',
        sortName: 'endif',
    },
    {
        name: '##assert',
        sortName: 'assert',
    },
];

export const hlslModifiers: LanguageElementInfo[] = [
    {
        name: 'centroid',
        description:
            'nterpolate between samples that are somewhere within the covered area of the pixel (this may require extrapolating end points from a pixel center).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'column_major',
        description: 'Mark a variable that stores 4 components in a single column to optimize matrix math.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    { name: 'const' },
    {
        name: 'export',
        description: 'Use export to mark functions that you package into a library.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-keywords#export',
        ],
    },
    {
        name: 'extern',
        description:
            'Mark a global variable as an external input to the shader; this is the default marking for all global variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'groupshared',
        description: 'Mark a variable for thread-group-shared memory for compute shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'in',
        description: '	Input only.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-function-parameters#parameters',
        ],
    },
    {
        name: 'inline',
        description:
            'An inline function generates a copy of the function body (when compiling) for each function call.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-function-syntax#parameters',
        ],
    },
    {
        name: 'inout',
        description: 'Input and an output.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-function-parameters#parameters',
        ],
    },
    {
        name: 'line',
        description: 'Line list or line strip.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader#parameters',
        ],
    },
    {
        name: 'lineadj',
        description: 'Line list with adjacency or line strip with adjacency.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader#parameters',
        ],
    },
    {
        name: 'linear',
        description:
            'Interpolate between shader inputs; linear is the default value if no interpolation modifier is specified.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'nointerpolation',
        description: 'Do not interpolate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'noperspective',
        description: 'Do not perform perspective-correction during interpolation.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'out',
        description: 'Output only.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-function-parameters#parameters',
        ],
    },
    {
        name: 'point',
        description: 'Point list.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader#parameters',
        ],
    },
    {
        name: 'precise',
        description:
            'The precise keyword when applied to a variable will restrict any calculations used to produce the value assigned to that variable.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'row_major',
        description:
            'Mark a variable that stores four components in a single row so they can be stored in a single constant register.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'sample',
        description: 'Interpolate at sample location rather than at the pixel center.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'shared',
        description: 'Mark a variable for sharing between effects; this is a hint to the compiler.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'snorm',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar'],
    },
    {
        name: 'static',
        description: 'Mark a local variable so that it is initialized one time and persists between function calls.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'triangle',
        description: 'Triangle list or triangle strip.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader#parameters',
        ],
    },
    {
        name: 'triangleadj',
        description: 'Triangle list with adjacency or triangle strip with adjacency.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader#parameters',
        ],
    },
    {
        name: 'uniform',
        description: 'Input only constant data.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-function-parameters#parameters',
        ],
    },
    {
        name: 'unorm',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar'],
    },
    { name: 'unsigned' },
    {
        name: 'volatile',
        description: 'Mark a variable that changes frequently; this is a hint to the compiler.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'globallycoherent',
        description:
            'This storage class causes memory barriers and syncs to flush data across the entire GPU such that other groups can see writes. Without this specifier, a memory barrier or sync will only flush a UAV within the current group.',
    },
];

export const hlslAttributes: LanguageElementInfo[] = [
    {
        name: 'domain',
        description: 'Defines the patch type used in the HS.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-domain'],
    },
    {
        name: 'earlydepthstencil',
        description: 'Forces depth-stencil testing before a shader executes.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-earlydepthstencil'],
    },
    {
        name: 'instance',
        description: 'Use this attribute to instance a geometry shader.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-instance'],
    },
    {
        name: 'maxtessfactor',
        description: 'Indicates the maximum value that the hull shader would return for any tessellation factor.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-maxtessfactor'],
    },
    {
        name: 'numthreads',
        description:
            'Defines the number of threads to be executed in a single thread group when a compute shader is dispatched.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#numthreads',
        ],
    },
    {
        name: 'outputcontrolpoints',
        description:
            'Defines the number of output control points (per thread) that will be created in the hull shader.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-outputcontrolpoints'],
    },
    {
        name: 'outputtopology',
        description: 'Defines the output primitive type for the tessellator.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-outputtopology',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#outputtopology',
        ],
    },
    {
        name: 'partitioning',
        description: 'Defines the tesselation scheme to be used in the hull shader.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-partitioning'],
    },
    {
        name: 'patchconstantfunc',
        description: 'Defines the function for computing patch constant data.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-patchconstantfunc'],
    },
    {
        name: 'fastopt',
        description: 'Reduces the compile time but produces less aggressive optimizations.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-do',
        ],
    },
    {
        name: 'unroll',
        description: 'Unroll the loop until it stops executing.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
        ],
    },
    {
        name: 'loop',
        description: 'Use flow-control statements in the compiled shader; do not unroll the loop.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
        ],
    },
    {
        name: 'allow_uav_condition',
        description: 'Allows a compute shader loop termination condition to be based off of a UAV read.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
        ],
    },
    {
        name: 'branch',
        description: 'Evaluate only one side of the if statement depending on the given condition.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'flatten',
        description: 'Evaluate both sides of the if statement and choose between the two resulting values.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'call',
        description:
            'The bodies of the individual cases in the switch will be moved into hardware subroutines and the switch will be a series of subroutine calls.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters'],
    },
    {
        name: 'forcecase',
        description: 'Force a switch statement in the hardware.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters'],
    },
    {
        name: 'maxvertexcount',
        description: 'Declaration for the maximum number of vertices to create.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader'],
    },
    {
        name: 'ifAll',
    },
    {
        name: 'ifAny',
    },
    {
        name: 'isolate',
    },
    {
        name: 'maxexports',
    },
    {
        name: 'maxInstructionCount',
    },
    {
        name: 'maxtempreg',
    },
    {
        name: 'noExpressionOptimizations',
    },
    {
        name: 'predicate',
    },
    {
        name: 'predicateBlock',
    },
    {
        name: 'reduceTempRegUsage',
    },
    {
        name: 'removeUnusedInputs',
    },
    {
        name: 'sampreg',
    },
    {
        name: 'unused',
    },
    {
        name: 'xps',
    },
    {
        name: 'WaveSize',
        description:
            'May be specified on compute shader entry points, to indicate that the function is only compatible with a specific wave size.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html#hlsl-attribute'],
    },
    {
        name: 'WaveOpsIncludeHelperLanes',
        description:
            'The attribute indicates that the shader code requires helper lanes to participate in wave intrinsics.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_Wave_Ops_Include_Helper_Lanes.html'],
    },
    {
        name: 'shader',
    },
];

export const hlslSemantics: LanguageElementInfo[] = [
    {
        name: 'BINORMAL',
        description: 'Binormal',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'BLENDINDICES',
        description: 'Blend indices',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'BLENDWEIGHT',
        description: 'Blend weights',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'COLOR',
        description: 'Output color',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#pixel-shader-semantics',
        ],
    },
    {
        name: 'NORMAL',
        description: 'Normal vector',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'POSITION',
        description: 'Vertex position in object space.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'POSITIONT',
        description: 'Transformed vertex position.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'PSIZE',
        description: 'Point size',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'TANGENT',
        description: 'Tangent',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'TEXCOORD',
        description: 'Texture coordinates',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'TESSFACTOR',
        description: 'Tessellation factor',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantics',
        ],
    },
    {
        name: 'DEPTH',
        description: 'Output depth',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#pixel-shader-semantics',
        ],
    },
    {
        name: 'FOG',
        description: 'Vertex fog',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#vertex-shader-semantic',
        ],
    },
    {
        name: 'VFACE',
        description: 'Floating-point scalar that indicates a back-facing primitive.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#pixel-shader-semantics',
        ],
    },
    {
        name: 'VPOS',
        description: 'The pixel location (x,y) in screen space.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#pixel-shader-semantics',
        ],
    },
];

export const hlslSystemValueSemantics: LanguageElementInfo[] = [
    {
        name: 'SV_Target',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target0',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target1',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target2',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target3',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target4',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target5',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target6',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Target7',
        description:
            'The output value that will be stored in a render target. The index indicates which of the 8 possibly bound render targets to write to. The value is available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_ClipDistance',
        description:
            'Clip distance data. SV_ClipDistance values are each assumed to be a float32 signed distance to a plane.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_CullDistance',
        description:
            'Cull distance data. When component(s) of vertex Element(s) are given this label, these values are each assumed to be a float32 signed distance to a plane.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Coverage',
        description: 'A mask that can be specified on input, output, or both of a pixel shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Depth',
        description: 'Depth buffer data. Can be written by pixel shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_DepthGreaterEqual',
        description:
            'In a pixel shader, allows outputting depth, as long as it is greater than or equal to the value determined by the rasterizer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_DepthLessEqual',
        description:
            'In a pixel shader, allows outputting depth, as long as it is less than or equal to the value determined by the rasterizer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_DispatchThreadID',
        description:
            'Defines the group offset within a Dispatch call, per dimension of the dispatch call. Available as input to the compute shader. (read only)',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-dispatchthreadid',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_dispatchthreadid',
        ],
    },
    {
        name: 'SV_DomainLocation',
        description:
            'Defines the location on the hull of the current domain point being evaluated. Available as input to the domain shader. (read only)',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-domainlocation',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_GroupID',
        description:
            'Defines the group offset within a Dispatch call, per dimension of the dispatch call. Available as input to the compute shader. (read only)',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-groupid',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_groupid',
        ],
    },
    {
        name: 'SV_GroupIndex',
        description:
            'Provides a flattened index for a given thread within a given group. Available as input to the compute shader. (read only)',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-groupindex',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_groupindex',
        ],
    },
    {
        name: 'SV_GroupThreadID',
        description:
            'Defines the thread offset within the group, per dimension of the group. Available as input to the compute shader. (read only)',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-groupthreadid',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_groupthreadid',
        ],
    },
    {
        name: 'SV_GSInstanceID',
        description: 'Defines the instance of the geometry shader. Available as input to the geometry shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-gsinstanceid',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_InnerCoverage',
        description:
            'SV_InnerCoverage represents underestimated conservative rasterization information (i.e. whether a pixel is guaranteed-to-be-fully covered).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-innercoverage',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_StencilRef',
        description: 'SV_StencilRef represents the current pixel shader stencil reference value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-stencilref',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_InsideTessFactor',
        description:
            'Defines the tessellation amount within a patch surface. Available in the hull shader for writing, and available in the domain shader for reading.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-insidetessfactor',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_InstanceID',
        description:
            'Per-instance identifier automatically generated by the runtime (see Using System-Generated Values (Direct3D 10)). Available to all shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_IsFrontFace',
        description: 'Specifies whether a triangle is front facing.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_OutputControlPointID',
        description:
            'Defines the index of the control point ID being operated on by an invocation of the main entry point of the hull shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-outputcontrolpointid',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_Position',
        description:
            'When SV_Position is declared for input to a shader, it can have one of two interpolation modes specified: linearNoPerspective or linearNoPerspectiveCentroid, where the latter causes centroid-snapped xyzw values to be provided when multisample antialiasing.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_PrimitiveID',
        description:
            'Per-primitive identifier automatically generated by the runtime (see Using System-Generated Values (Direct3D 10)).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_primitiveid-in-the-pixel-shader',
        ],
    },
    {
        name: 'SV_RenderTargetArrayIndex',
        description:
            'Render-target array index. Applied to geometry shader output, and indicates the render target array slice that the primitive will be drawn to by the pixel shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_SampleIndex',
        description: 'Sample frequency index data.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_TessFactor',
        description: 'Defines the tessellation amount on each edge of a patch.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sv-tessfactor',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_VertexID',
        description:
            'Per-vertex identifier automatically generated by the runtime (see Using System-Generated Values (Direct3D 10)).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_ViewportArrayIndex',
        description:
            'Viewport array index. Applied to geometry shader output, and indicates which viewport to use for the primitive currently being written out.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
        ],
    },
    {
        name: 'SV_ShadingRate',
        description: 'Variable rate shading is supported as of this shader model. Only one token was added to HLSL.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics#system-value-semantics',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/Shader-Model-6.4#support-for-variable-rate-shading',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/hlsl-shader-model-6-4-features-for-direct3d-12#sv_shadingrate',
        ],
    },
    {
        name: 'SV_ViewID',
        description:
            'This feature enables instancing of the graphics pipeline by "view", in a manner that is orthogonal to draw instancing.',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/SV_ViewID',
            'https://microsoft.github.io/DirectX-Specs/d3d/ViewInstancing.html#sv_viewid',
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_viewid',
        ],
    },
    {
        name: 'SV_Barycentrics',
        description:
            'This is a new system-generated value available in pixel shaders, used for example to perform interpolation over small or unaligned values like a few bits from a 32-bit value.',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/SV_Barycentrics'],
    },
    {
        name: 'SV_CullPrimitive',
        description:
            'This is a per-primitive boolean culling value that indicates whether to cull the primitive for the current view (SV_ViewID).',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_cullprimitive'],
    },
];

export const hlslStructTypes: LanguageElementInfo[] = [
    {
        name: 'RayDesc',
        description: 'Passed to the TraceRay function to define the origin, direction, and extents of the ray.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/raydesc',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#ray-description-structure',
        ],
        keyword: 'struct',
        members: [
            { type: 'float3', name: 'Origin', description: 'The origin of the ray.' },
            { type: 'float', name: 'TMin', description: 'The minimum extent of the ray.' },
            { type: 'float3', name: 'Direction', description: 'The direction of the ray.' },
            { type: 'float', name: 'TMax', description: 'The maximum extent of the ray.' },
        ],
    },
    {
        name: 'BuiltInTriangleIntersectionAttributes',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#intersection-attributes-structure'],
        keyword: 'struct',
        members: [
            {
                type: 'float2',
                name: 'barycentrics',
                description:
                    'Given attributes a0, a1 and a2 for the 3 vertices of a triangle, barycentrics.x is the weight for a1 and barycentrics.y is the weight for a2.',
            },
        ],
    },
];

export const hlslOtherTypes: LanguageElementInfo[] = [
    {
        name: 'RaytracingAccelerationStructure',
        description:
            'A resource type that can be declared in HLSL and passed into TraceRay to indicate the top-level acceleration resource built using BuildRaytracingAccelerationStructure.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/raytracingaccelerationstructure',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracingaccelerationstructure',
        ],
    },
    {
        name: 'StateObjectConfig',
        description: 'The StateObjectConfig subobject type corresponds to a D3D12_STATE_OBJECT_CONFIG structure.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#stateobjectconfig',
        ],
    },
    {
        name: 'GlobalRootSignature',
        description:
            'A named root signature that can used globally in a raytracing pipeline or associated with shaders by name.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#globalrootsignature',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#root-signature',
        ],
    },
    {
        name: 'LocalRootSignature',
        description: 'A named local root signature that can be associated with shaders.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#localrootsignature',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#local-root-signature',
        ],
    },
    {
        name: 'SubobjectToEntrypointAssociation',
        description:
            'An association between one subobject, such as a local root signature and a list of shader entry points.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#subobjecttoexportsassocation',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#subobject-to-entrypoint-association',
        ],
    },
    {
        name: 'RaytracingShaderConfig',
        description: 'Defines the maximum sizes in bytes for the ray payload and intersection attributes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#raytracingshaderconfig',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-shader-config',
        ],
    },
    {
        name: 'RaytracingPipelineConfig',
        description: 'Defines the maximum TraceRay() recursion depth.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#raytracingpipelineconfig',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-pipeline-config',
        ],
    },
    {
        name: 'RaytracingPipelineConfig1',
        description: 'Defines the maximum TraceRay() recursion depth as well as raytracing pipeline flags.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-pipeline-config1'],
    },
    {
        name: 'TriangleHitGroup',
        description:
            'A TriangleHitGroup corresponds to a D3D12_HIT_GROUP_DESC structure whose Type field is set to D3D12_HIT_GROUP_TYPE_TRIANGLES.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#trianglehitgroup',
        ],
    },
    {
        name: 'ProceduralPrimitiveHitGroup',
        description:
            'A ProceduralPrimitiveHitGroup corresponds to a D3D12_HIT_GROUP_DESC structure whose Type field is set to D3D12_HIT_GROUP_TYPE_PROCEDURAL_PRIMITIVE.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-state-object#proceduralprimitivehitgroup',
        ],
    },
];

export const hlslEnumTypes: LanguageElementInfo[] = [
    {
        name: 'RAY_FLAG',
        description:
            'Ray flags are passed to TraceRay() or RayQuery::TraceRayInline() to override transparency, culling, and early-out behavior.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#ray-flags'],
        type: 'uint',
        keyword: 'enum',
        members: [
            { name: 'RAY_FLAG_NONE', value: '0x00', description: 'No options selected.' },
            {
                name: 'RAY_FLAG_FORCE_OPAQUE',
                value: '0x01',
                description: 'All ray-primitive intersections encountered in a raytrace are treated as opaque.',
            },
            {
                name: 'RAY_FLAG_FORCE_NON_OPAQUE',
                value: '0x02',
                description: 'All ray-primitive intersections encountered in a raytrace are treated as non-opaque.',
            },
            {
                name: 'RAY_FLAG_ACCEPT_FIRST_HIT_AND_END_SEARCH',
                value: '0x04',
                description:
                    'The first ray-primitive intersection encountered in a raytrace automatically causes AcceptHitAndEndSearch() to be called immediately after the any hit shader (including if there is no any hit shader).',
            },
            {
                name: 'RAY_FLAG_SKIP_CLOSEST_HIT_SHADER',
                value: '0x08',
                description:
                    'Even if at least one hit has been committed, and the hit group for the closest hit contains a closest hit shader, skip execution of that shader.',
            },
            {
                name: 'RAY_FLAG_CULL_BACK_FACING_TRIANGLES',
                value: '0x10',
                description: 'Enables culling of back facing triangles.',
            },
            {
                name: 'RAY_FLAG_CULL_FRONT_FACING_TRIANGLES',
                value: '0x20',
                description: 'Enables culling of front facing triangles.',
            },
            {
                name: 'RAY_FLAG_CULL_OPAQUE',
                value: '0x40',
                description:
                    'Culls all primitives that are considered opaque based on their geometry and instance flags.',
            },
            {
                name: 'RAY_FLAG_CULL_NON_OPAQUE',
                value: '0x80',
                description:
                    'Culls all primitives that are considered non-opaque based on their geometry and instance flags.',
            },
            { name: 'RAY_FLAG_SKIP_TRIANGLES', value: '0x100', description: 'Culls all triangles.' },
            {
                name: 'RAY_FLAG_SKIP_PROCEDURAL_PRIMITIVES',
                value: '0x200',
                description: 'Culls all procedural primitives.',
            },
        ],
    },
    {
        name: 'RAYTRACING_PIPELINE_FLAG',
        description: 'Flags used in Raytracing pipeline config1 subobject.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-pipeline-flags'],
        type: 'uint',
        keyword: 'enum',
        members: [
            { name: 'RAYTRACING_PIPELINE_FLAG_NONE', value: '0x0' },
            { name: 'RAYTRACING_PIPELINE_FLAG_SKIP_TRIANGLES', value: '0x100' },
            { name: 'RAYTRACING_PIPELINE_FLAG_SKIP_PROCEDURAL_PRIMITIVES', value: '0x200' },
        ],
    },
    {
        name: 'COMMITTED_STATUS',
        description: 'Return value for RayQuery::CommittedStatus().',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#committed_status'],
        type: 'uint',
        keyword: 'enum',
        members: [
            { name: 'COMMITTED_NOTHING', description: 'No hits have been committed yet.' },
            {
                name: 'COMMITTED_TRIANGLE_HIT',
                description:
                    'Closest hit so far is a triangle, a result of either the shader previously calling RayQuery::CommitNonOpaqueTriangleHit() or a fixed function opaque triangle intersection.',
            },
            {
                name: 'COMMITTED_PROCEDURAL_PRIMITIVE_HIT',
                description:
                    'Closest hit so far is a procedural primitive, a result of the shader previously calling RayQuery::CommittProceduralPrimitiveHit().',
            },
        ],
    },
    {
        name: 'CANDIDATE_TYPE',
        description: 'Return value for RayQuery::CandidateType().',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#candidate_type'],
        type: 'uint',
        keyword: 'enum',
        members: [
            {
                name: 'CANDIDATE_NON_OPAQUE_TRIANGLE',
                description:
                    'Acceleration structure traversal has encountered a non opaque triangle (that would be the closest hit so far if committed) for the shader to evaluate.',
            },
            {
                name: 'CANDIDATE_PROCEDURAL_PRIMITIVE',
                description:
                    'Acceleration structure traversal has encountered a procedural primitive for the shader to evaluate.',
            },
        ],
    },
];

export const hlslBufferTypes: LanguageElementInfo[] = [
    {
        name: 'AppendStructuredBuffer',
        description:
            'Output buffer that appears as a stream the shader may append to. Only structured buffers can take T types that are structures.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-appendstructuredbuffer'],
        methods: [
            {
                name: 'Append',
                description: 'Appends a value to the end of the buffer.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'T', // TODO: generic
                        name: 'value',
                        description: 'The input value.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Gets the resource dimensions.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'numStructs',
                        description: 'The number of structures.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'stride',
                        description: 'The number of bytes in each element.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
        ],
    },
    {
        name: 'Buffer',
        description: 'Buffer type as it exists in Shader Model 4 plus resource variables and buffer info.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-buffer'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'The length, in elements, of the Buffer as set in the Shader Resource View.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'dim',
                        description: 'The length, in bytes, of the buffer.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data and returns status of the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'ByteAddressBuffer',
        description: 'A read-only buffer that is indexed in bytes.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-byteaddressbuffer'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Gets the length of the buffer.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'dim',
                        description: 'The length, in bytes, of the buffer.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Gets one value.',
                returnType: 'uint',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data and returns status of the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'int',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
        ],
    },
    {
        name: 'ConsumeStructuredBuffer',
        description:
            'An input buffer that appears as a stream the shader may pull values from. Only structured buffers can take T types that are structures.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-consumestructuredbuffer'],
        methods: [
            {
                name: 'Consume',
                description: 'Removes a value from the end of the buffer.',
                returnType: 'T', // TODO: generic
                parameters: [],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Gets the resource dimensions.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'numStructs',
                        description: 'The number of structures.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'stride',
                        description: 'The stride, in bytes, of each element.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
        ],
    },
    {
        name: 'RWBuffer',
        description: 'A read/write buffer.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwbuffer'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Gets the length of the buffer.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'dim',
                        description: 'The length, in elements, of the Buffer as set in the Unordered Resource View.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data and returns status of the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'RWByteAddressBuffer',
        description: 'A read/write buffer that indexes in bytes.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwbyteaddressbuffer'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Gets the length of the buffer.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'dim',
                        description: 'The length, in bytes, of the buffer.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'InterlockedAdd',
                description: 'Adds the value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedAnd',
                description: 'Ands the value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedCompareExchange',
                description: 'Compares the input to the comparison value and exchanges the result, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'compare_value',
                        description: 'The comparison value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedCompareStore',
                description: 'Compares the input to the comparison value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'compare_value',
                        description: 'The comparison value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedExchange',
                description: 'Exchanges a value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedMax',
                description: 'Finds the maximum value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedMin',
                description: 'Finds the minimum value, atomically.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedOr',
                description: 'Performs an atomic OR on the value.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'InterlockedXor',
                description: 'Performs an atomic XOR on the value.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'dest',
                        description: 'The destination address.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'original_value',
                        description: 'The original value.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Gets one value.',
                returnType: 'uint',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Gets one value and returns status of the operation.',
                returnType: 'uint',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load2',
                description: 'Gets two values.',
                returnType: 'uint2',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load2',
                description: 'Gets two values and returns status of the operation.',
                returnType: 'uint2',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load3',
                description: 'Gets three values.',
                returnType: 'uint3',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load3',
                description: 'Gets three values and returns status of the operation.',
                returnType: 'uint3',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load3',
                description: 'Gets three values.',
                returnType: 'uint3',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load3',
                description: 'Gets three values and returns status of the operation.',
                returnType: 'uint3',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load4',
                description: 'Gets four values.',
                returnType: 'uint4',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load4',
                description: 'Gets four values and returns status of the operation.',
                returnType: 'uint4',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Store',
                description: 'Sets one value.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'One input value.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Store2',
                description: 'Sets two values.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint2',
                        name: 'values',
                        description: 'Two input values.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Store3',
                description: 'Sets three values.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint3',
                        name: 'values',
                        description: 'Three input values.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Store4',
                description: 'Sets four values.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'address',
                        description: 'The input address in bytes, which must be a multiple of 4.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint4',
                        name: 'values',
                        description: 'Four input values.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
        ],
    },
    {
        name: 'RWStructuredBuffer',
        description: 'A read/write buffer that can take a T type that is a structure.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwstructuredbuffer'],
        methods: [
            {
                name: 'DecrementCounter',
                description: "Decrements the object's hidden counter.",
                returnType: 'uint',
                parameters: [],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Gets the resource dimensions.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'numStructs',
                        description: 'The number of structures.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'stride',
                        description: 'The number of bytes in each element.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'IncrementCounter',
                description: "Increments the object's hidden counter.",
                returnType: 'uint',
                parameters: [],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data and returns status of the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'StructuredBuffer',
        description: 'A read-only buffer, which can take a T type that is a structure.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-structuredbuffer'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Gets the resource dimensions.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'numStructs',
                        description: 'The number of structures.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'stride',
                        description: 'The number of bytes in each element.',
                    },
                ],
                available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads buffer data and returns status of the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the buffer.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'cbuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-constants'],
    },
    {
        name: 'tbuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-constants'],
    },
    {
        name: 'ConstantBuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d12/resource-binding-in-hlsl#constant-buffers'],
    },
    {
        name: 'RasterizerOrderedBuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects'],
    },
    {
        name: 'RasterizerOrderedByteAddressBuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects'],
    },
    {
        name: 'RasterizerOrderedStructuredBuffer',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects'],
    },
];

export const hlslTextureTypes: LanguageElementInfo[] = [
    {
        name: 'sampler',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'sampler1D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'sampler2D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'sampler3D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'samplerCUBE',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'texture',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture'],
    },
    {
        name: 'texture1D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture'],
    },
    {
        name: 'texture2D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture'],
    },
    {
        name: 'texture3D',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture'],
    },
    {
        name: 'textureCUBE',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture'],
    },
    {
        name: 'RWTexture1D',
        description: 'A read/write resource.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture1d'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data and returns status about the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'RWTexture1DArray',
        description: 'A read/write resource.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture1darray'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data and returns status about the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'RWTexture2D',
        description: 'A read/write resource.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture2d'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data and returns status about the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'RWTexture2DArray',
        description: 'A read/write resource.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture2darray'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'he number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Elements',
                        description: 'he number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data and returns status about the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'RWTexture3D',
        description: 'A read/write resource.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture3d'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Depth',
                        description: 'The resource depth, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Height',
                        description: 'The resource height, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Depth',
                        description: 'The resource depth, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'Load',
                description: 'Reads texture data and returns status about the operation.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'int',
                        name: 'Location',
                        description: 'The location of the texture.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Status',
                        description:
                            "The status of the operation. You can't access the status directly; instead, pass the status to the CheckAccessFullyMapped intrinsic function. CheckAccessFullyMapped returns TRUE if all values from the corresponding Sample, Gather, or Load operation accessed mapped tiles in a tiled resource. If any values were taken from an unmapped tile, CheckAccessFullyMapped returns FALSE.",
                    },
                ],
                available: ['pixel', 'compute'],
            },
            // TODO: operator[]
        ],
    },
    {
        name: 'Texture1D',
        description: 'A 1D texture type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture1d'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            ...load,
            ...sample,
            ...sampleBias,
            ...sampleCmpLevelZero,
            ...sampleGrad,
            ...sampleLevel,
            // TODO: operator[]
        ],
    },
    {
        name: 'Texture1DArray',
        description: 'Texture1DArray type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture1darray'],
        methods: [
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            ...load,
            ...sample,
            ...sampleBias,
            ...sampleCmp,
            ...sampleCmpLevelZero,
            ...sampleGrad,
            ...sampleLevel,
            // TODO: operator[]
        ],
    },
    {
        name: 'Texture2D',
        description: 'Texture2D type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2d'],
        methods: [
            ...gather,
            ...gatherAlpha,
            ...gatherBlue,
            ...gatherCmp,
            ...gatherCmpAlpha,
            // ...gatherCmpBlue,
            // ...gatherCmpGreen,
            // ...gatherCompRed,
            // ...gatherGreen,
            // ...gatherRed,
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'MipLevel',
                        description: 'Optional. Mipmap level (must be specified if NumberOfLevels is used).',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'NumberOfLevels',
                        description: 'The number of mipmap levels (requires MipLevel also).',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            {
                name: 'GetDimensions',
                description: 'Returns the dimensions of the resource.',
                returnType: 'void',
                parameters: [
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'Width',
                        description: 'The resource width, in texels.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'Elements',
                        description: 'The number of elements in the array.',
                    },
                ],
                available: ['pixel', 'compute'],
            },
            ...load,
            ...sample,
            ...sampleBias,
            ...sampleCmp,
            ...sampleCmpLevelZero,
            ...sampleGrad,
            ...sampleLevel,
            // TODO: operator[]
        ],
    },
    {
        name: 'Texture2DArray',
        description: 'Texture2DArray type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2darray'],
    },
    {
        name: 'Texture2DMS',
        description: 'Texture2DMS type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2dms'],
    },
    {
        name: 'Texture2DMSArray',
        description: 'Texture2DMSArray type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2dmsarray'],
    },
    {
        name: 'Texture3D',
        description: 'Texture3D type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture3d'],
    },
    {
        name: 'TextureCube',
        description: 'TextureCube type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/texturecube'],
    },
    {
        name: 'TextureCubeArray',
        description: 'TextureCubeArray type (as it exists in Shader Model 4) plus resource variables.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/texturecubearray'],
    },
    {
        name: 'FeedbackTexture2D',
        description: 'For writing to feedback maps using template parameter type.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'FeedbackTexture2DArray',
        description: 'For writing to feedback maps using template parameter type.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'RasterizerOrderedTexture1D',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'RasterizerOrderedTexture1DArray',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'RasterizerOrderedTexture2D',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'RasterizerOrderedTexture2DArray',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'RasterizerOrderedTexture3D',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
];

export const hlslNonPrimitiveTypes: LanguageElementInfo[] = [
    {
        name: 'BlendState',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d11/d3d11-effect-states#defining-and-using-state-objects',
        ],
    },
    {
        name: 'DepthStencilState',
    },
    {
        name: 'InputPatch',
        description: 'Represents an array of control points that are available to the hull shader as inputs.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-inputpatch'],
    },
    {
        name: 'LineStream',
        description: 'A sequence of line primitives.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type'],
    },
    {
        name: 'OutputPatch',
        description:
            "Represents an array of output control points that are available to the hull shader's patch-constant function as well as the domain shader.",
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-outputpatch'],
    },
    {
        name: 'PointStream',
        description: 'A sequence of point primitives.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type'],
    },
    {
        name: 'RasterizerState',
    },
    {
        name: 'SamplerState',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'SamplerComparisonState',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'TriangleStream',
        description: 'A sequence of triangle primitives.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type'],
    },
    {
        name: 'sampler_state',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler'],
    },
    {
        name: 'ComputeShader',
    },
    {
        name: 'DomainShader',
    },
    {
        name: 'GeometryShader',
    },
    {
        name: 'HullShader',
    },
    {
        name: 'PixelShader',
    },
    {
        name: 'VertexShader',
    },
    {
        name: 'RenderTargetView',
    },
    {
        name: 'DepthStencilView',
    },
    {
        name: 'Technique',
    },
    {
        name: 'RayQuery',
        description: 'Enables inline access to raytracing operations.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#rayquery'],
    },
];

export const hlslVectorMatrixStringTypes: LanguageElementInfo[] = [
    {
        name: 'vector',
        description:
            'A vector contains between one and four scalar components; every component of a vector must be of the same type.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-vector'],
    },
    {
        name: 'matrix',
        description:
            'A matrix is a special data type that contains between one and sixteen components. Every component of a matrix must be of the same type.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-matrix'],
    },
    {
        name: 'string',
        description:
            'HLSL also supports a string type, which is an ASCII string. There are no operations or states that accept strings; but effects can query string parameters and annotations.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar#string-type'],
    },
];

export const hlslPrimitiveTypes: LanguageElementInfo[] = [
    {
        name: 'bool',
        description: 'true or false.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar'],
    },
    {
        name: 'int',
        description: '32-bit signed integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'uint',
        description: '32-bit unsigned integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'dword',
        description: '32-bit unsigned integer.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar'],
    },
    {
        name: 'half',
        description: '16-bit floating point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'float',
        description: '32-bit floating point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'double',
        description: '64-bit floating point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'min16float',
        description: 'minimum 16-bit floating point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'min10float',
        description: 'minimum 10-bit floating point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'min16int',
        description: 'minimum 16-bit signed integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'min12int',
        description: 'minimum 12-bit signed integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'min16uint',
        description: 'minimum 16-bit unsigned integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'uint64_t',
        description: 'A 64-bit unsigned integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'int64_t',
        description: 'A 64-bit signed integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'float16_t',
        description:
            'Always a 16-bit floating point value (as opposed to other 16-bit floats, which may or may not be 16-bit).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'uint16_t',
        description: 'A 16-bit unsigned integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'int16_t',
        description: 'A 16-bit signed integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'float32_t',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
    {
        name: 'float64_t',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
    {
        name: 'int32_t',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
    {
        name: 'uint32_t',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
    {
        name: 'uint8_t4_packed',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
    {
        name: 'int8_t4_packed',
        links: ['https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types'],
    },
];

export const hlslVariables: LanguageElementInfo[] = [
    {
        name: 'ResourceDescriptorHeap',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_DynamicResources.html#resourcedescriptorheap-and-samplerdescriptorheap',
        ],
    },
    {
        name: 'SamplerDescriptorHeap',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_DynamicResources.html#resourcedescriptorheap-and-samplerdescriptorheap',
        ],
    },
];
