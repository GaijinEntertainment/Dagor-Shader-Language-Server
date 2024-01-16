import { LanguageElementInfo } from '../interface/language-element-info';

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
        description:
            'Optional keyword for assigning a shader variable to a particular register.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-register',
        ],
    },
    {
        name: 'packoffset',
        description: 'Optional shader constant packing keyword.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-packoffset',
        ],
    },
    {
        name: 'template',
        description:
            'Functions can be defined with generic type arguments provided those types support all the methods and operators used in the function.',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/HLSL-2021#template-functions-and-structs',
        ],
    },
    {
        name: 'break',
        description: 'Exit the surrounding loop (do, for, while).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-break',
        ],
    },
    {
        name: 'continue',
        description:
            'Stop executing the current loop (do, for, while), update the loop conditions, and begin executing from the top of the loop.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-continue',
        ],
    },
    {
        name: 'discard',
        description: 'Do not output the result of the current pixel.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-discard',
        ],
    },
    {
        name: 'return',
        description: 'A return statement signals the end of a function.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-return',
        ],
    },
    {
        name: 'for',
        description:
            'Iteratively executes a series of statements, based on the evaluation of the conditional expression.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for',
        ],
    },
    {
        name: 'if',
        description:
            'Conditionally execute a series of statements, based on the evaluation of the conditional expression.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if',
        ],
    },
    {
        name: 'else',
        description:
            'Conditionally execute a series of statements, based on the evaluation of the conditional expression.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if',
        ],
    },
    {
        name: 'switch',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch',
        ],
    },
    {
        name: 'case',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch',
        ],
    },
    {
        name: 'default',
        description:
            'Transfer control to a different statement block within the switch body depending on the value of a selector.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch',
        ],
    },
    {
        name: 'do',
        description:
            'Execute a series of statements continuously until the conditional expression fails.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-do',
        ],
    },
    {
        name: 'while',
        description:
            'Executes a statement block until the conditional expression fails.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while',
        ],
    },
    {
        name: 'compile',
        description: 'Declare a shader variable within an effect pass.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-shader',
        ],
    },
    {
        name: 'compile_fragment',
        description:
            'Each Microsoft High Level Shader Language (HLSL) function can be converted into a shader fragment with the addition of a fragment declaration.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax',
        ],
    },
    {
        name: 'typedef',
        description:
            'In addition to the built-in intrinsic data types, HLSL supports user-defined or custom types.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-user-defined',
        ],
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
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax',
        ],
    },
    {
        name: 'vertexfragment',
        description:
            'Each Microsoft High Level Shader Language (HLSL) function can be converted into a shader fragment with the addition of a fragment declaration.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/fragment-declaration-syntax',
        ],
    },
    {
        name: 'stateblock',
    },
    {
        name: 'stateblock_state',
    },
    {
        name: 'technique',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax',
        ],
    },
    {
        name: 'technique10',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax',
        ],
    },
    {
        name: 'technique11',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d11/d3d11-effect-technique-syntax',
        ],
    },
    {
        name: 'pass',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-effect-technique-syntax',
        ],
    },
    {
        name: 'struct',
        description: 'Declares a structure using HLSL.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct',
        ],
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
        description:
            'An interface functions in a similar manner to an abstract base class in C++.',
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
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/HLSL-2021#template-functions-and-structs',
        ],
    },
];

export const hlslPreprocessorDirectives: LanguageElementInfo[] = [
    {
        name: '#define',
        sortName: 'define',
        description:
            'Preprocessor directive that defines a constant or a macro.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-define',
        ],
    },
    {
        name: '#undef',
        sortName: 'undef',
        description:
            'Preprocessor directive that removes the current definition of a constant or macro that was previously defined using the #define directive.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-undef',
        ],
    },
    {
        name: '#ifdef',
        sortName: 'ifdef',
        description:
            'Preprocessor directives that determine whether a specific preprocessor constant or macro is defined.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-ifdef',
        ],
    },
    {
        name: '#ifndef',
        sortName: 'ifndef',
        description:
            'Preprocessor directives that determine whether a specific preprocessor constant or macro is defined.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-ifdef',
        ],
    },
    {
        name: '#if',
        sortName: 'if',
        description:
            'Preprocessor directives that control compilation of portions of a source file.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if',
        ],
    },
    {
        name: '#elif',
        sortName: 'elif',
        description:
            'Preprocessor directives that control compilation of portions of a source file.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if',
        ],
    },
    {
        name: '#else',
        sortName: 'else',
        description:
            'Preprocessor directives that control compilation of portions of a source file.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if',
        ],
    },
    {
        name: '#endif',
        sortName: 'endif',
        description:
            'Preprocessor directives that control compilation of portions of a source file.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-if',
        ],
    },
    {
        name: '#error',
        sortName: 'error',
        description:
            'Preprocessor directive that produces compiler-time error messages.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-error',
        ],
    },
    {
        name: '#include',
        sortName: 'include',
        description:
            'Preprocessor directive that inserts the contents of the specified file into the source program at the point where the directive appears.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-include',
        ],
    },
    {
        name: '#line',
        sortName: 'line',
        description:
            "Preprocessor directive that sets the compiler's internally-stored line number and filename to the specified values.",
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-line',
        ],
    },
    {
        name: '#pragma',
        sortName: 'pragma',
        description:
            'Preprocessor directive that provides machine-specific or operating system-specific features while retaining overall compatibility with the C and C++ languages.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma',
        ],
    },
];

export const hlslPreprocessorPragmaDirectives: LanguageElementInfo[] = [
    {
        name: 'def',
        description:
            'Pragma directive that manually allocates a floating-point shader register.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma-def',
        ],
    },
    {
        name: 'message',
        description: 'Pragma directive that produces compiler-time messages.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/message-pragma-directive--directx-hlsl-',
        ],
    },
    {
        name: 'pack_matrix',
        description:
            'Pragma directive that specifies packing alignment for matrices.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-appendix-pre-pragma-pack-matrix',
        ],
    },
    {
        name: 'warning',
        description:
            'Pragma directive that modifies the behavior of compiler warning messages.',
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
        description:
            'Mark a variable that stores 4 components in a single column to optimize matrix math.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    { name: 'const' },
    {
        name: 'export',
        description:
            'Use export to mark functions that you package into a library.',
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
        description:
            'Mark a variable for thread-group-shared memory for compute shaders.',
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
        description:
            'Do not perform perspective-correction during interpolation.',
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
        description:
            'Interpolate at sample location rather than at the pixel center.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-struct#interpolation-modifiers-introduced-in-shader-model-4',
        ],
    },
    {
        name: 'shared',
        description:
            'Mark a variable for sharing between effects; this is a hint to the compiler.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-variable-syntax#parameters',
        ],
    },
    {
        name: 'snorm',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
        ],
    },
    {
        name: 'static',
        description:
            'Mark a local variable so that it is initialized one time and persists between function calls.',
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
        description:
            'Triangle list with adjacency or triangle strip with adjacency.',
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
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
        ],
    },
    { name: 'unsigned' },
    {
        name: 'volatile',
        description:
            'Mark a variable that changes frequently; this is a hint to the compiler.',
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
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-domain',
        ],
    },
    {
        name: 'earlydepthstencil',
        description: 'Forces depth-stencil testing before a shader executes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-earlydepthstencil',
        ],
    },
    {
        name: 'instance',
        description: 'Use this attribute to instance a geometry shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-instance',
        ],
    },
    {
        name: 'maxtessfactor',
        description:
            'Indicates the maximum value that the hull shader would return for any tessellation factor.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-maxtessfactor',
        ],
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
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-outputcontrolpoints',
        ],
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
        description:
            'Defines the tesselation scheme to be used in the hull shader.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-partitioning',
        ],
    },
    {
        name: 'patchconstantfunc',
        description: 'Defines the function for computing patch constant data.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-patchconstantfunc',
        ],
    },
    {
        name: 'fastopt',
        description:
            'Reduces the compile time but produces less aggressive optimizations.',
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
        description:
            'Use flow-control statements in the compiled shader; do not unroll the loop.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
        ],
    },
    {
        name: 'allow_uav_condition',
        description:
            'Allows a compute shader loop termination condition to be based off of a UAV read.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-for#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-while#parameters',
        ],
    },
    {
        name: 'branch',
        description:
            'Evaluate only one side of the if statement depending on the given condition.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'flatten',
        description:
            'Evaluate both sides of the if statement and choose between the two resulting values.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-if#parameters',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'call',
        description:
            'The bodies of the individual cases in the switch will be moved into hardware subroutines and the switch will be a series of subroutine calls.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'forcecase',
        description: 'Force a switch statement in the hardware.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-switch#parameters',
        ],
    },
    {
        name: 'maxvertexcount',
        description:
            'Declaration for the maximum number of vertices to create.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-geometry-shader',
        ],
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
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html#hlsl-attribute',
        ],
    },
    {
        name: 'WaveOpsIncludeHelperLanes',
        description:
            'The attribute indicates that the shader code requires helper lanes to participate in wave intrinsics.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_Wave_Ops_Include_Helper_Lanes.html',
        ],
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
        description:
            'Floating-point scalar that indicates a back-facing primitive.',
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
        description:
            'A mask that can be specified on input, output, or both of a pixel shader.',
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
        description:
            'Defines the instance of the geometry shader. Available as input to the geometry shader.',
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
        description:
            'SV_StencilRef represents the current pixel shader stencil reference value.',
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
        description:
            'Variable rate shading is supported as of this shader model. Only one token was added to HLSL.',
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
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/SV_Barycentrics',
        ],
    },
    {
        name: 'SV_CullPrimitive',
        description:
            'This is a per-primitive boolean culling value that indicates whether to cull the primitive for the current view (SV_ViewID).',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#sv_cullprimitive',
        ],
    },
];

export const hlslStructTypes: LanguageElementInfo[] = [
    {
        name: 'RayDesc',
        description:
            'Passed to the TraceRay function to define the origin, direction, and extents of the ray.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/raydesc',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#ray-description-structure',
        ],
    },
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
        name: 'BuiltInTriangleIntersectionAttributes',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#intersection-attributes-structure',
        ],
    },
    {
        name: 'StateObjectConfig',
        description:
            'The StateObjectConfig subobject type corresponds to a D3D12_STATE_OBJECT_CONFIG structure.',
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
        description:
            'A named local root signature that can be associated with shaders.',
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
        description:
            'Defines the maximum sizes in bytes for the ray payload and intersection attributes.',
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
        description:
            'Defines the maximum TraceRay() recursion depth as well as raytracing pipeline flags.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-pipeline-config1',
        ],
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
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#ray-flags',
        ],
    },
    {
        name: 'RAYTRACING_PIPELINE_FLAG',
        description: 'Flags used in Raytracing pipeline config1 subobject.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytracing-pipeline-flags',
        ],
    },
    {
        name: 'COMMITTED_STATUS',
        description: 'Return value for RayQuery::CommittedStatus().',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#committed_status',
        ],
    },
    {
        name: 'CANDIDATE_TYPE',
        description: 'Return value for RayQuery::CandidateType().',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#candidate_type',
        ],
    },
];

export const hlslBufferTypes: LanguageElementInfo[] = [
    {
        name: 'AppendStructuredBuffer',
        description:
            'Output buffer that appears as a stream the shader may append to. Only structured buffers can take T types that are structures.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-appendstructuredbuffer',
        ],
    },
    {
        name: 'Buffer',
        description:
            'Buffer type as it exists in Shader Model 4 plus resource variables and buffer info.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-buffer',
        ],
    },
    {
        name: 'ByteAddressBuffer',
        description: 'A read-only buffer that is indexed in bytes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-byteaddressbuffer',
        ],
    },
    {
        name: 'ConsumeStructuredBuffer',
        description:
            'An input buffer that appears as a stream the shader may pull values from. Only structured buffers can take T types that are structures.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-consumestructuredbuffer',
        ],
    },
    {
        name: 'RWBuffer',
        description: 'A read/write buffer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwbuffer',
        ],
    },
    {
        name: 'RWByteAddressBuffer',
        description: 'A read/write buffer that indexes in bytes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwbyteaddressbuffer',
        ],
    },
    {
        name: 'RWStructuredBuffer',
        description:
            'A read/write buffer that can take a T type that is a structure.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwstructuredbuffer',
        ],
    },
    {
        name: 'StructuredBuffer',
        description:
            'A read-only buffer, which can take a T type that is a structure.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-structuredbuffer',
        ],
    },
    {
        name: 'cbuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-constants',
        ],
    },
    {
        name: 'tbuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-constants',
        ],
    },
    {
        name: 'ConstantBuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/resource-binding-in-hlsl#constant-buffers',
        ],
    },
    {
        name: 'RasterizerOrderedBuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects',
        ],
    },
    {
        name: 'RasterizerOrderedByteAddressBuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects',
        ],
    },
    {
        name: 'RasterizerOrderedStructuredBuffer',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/shader-model-5-1-objects',
        ],
    },
];

export const hlslTextureTypes: LanguageElementInfo[] = [
    {
        name: 'sampler',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'sampler1D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'sampler2D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'sampler3D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'samplerCUBE',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'texture',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture',
        ],
    },
    {
        name: 'texture1D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture',
        ],
    },
    {
        name: 'texture2D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture',
        ],
    },
    {
        name: 'texture3D',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture',
        ],
    },
    {
        name: 'textureCUBE',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texture',
        ],
    },
    {
        name: 'RWTexture1D',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture1d',
        ],
    },
    {
        name: 'RWTexture1D',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture1d',
        ],
    },
    {
        name: 'RWTexture1DArray',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture1darray',
        ],
    },
    {
        name: 'RWTexture2D',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture2d',
        ],
    },
    {
        name: 'RWTexture2DArray',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture2darray',
        ],
    },
    {
        name: 'RWTexture3D',
        description: 'A read/write resource.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-rwtexture3d',
        ],
    },
    {
        name: 'Texture1D',
        description:
            'A 1D texture type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture1d',
        ],
    },
    {
        name: 'Texture1DArray',
        description:
            'Texture1DArray type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture1darray',
        ],
    },
    {
        name: 'Texture2D',
        description:
            'Texture2D type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2d',
        ],
    },
    {
        name: 'Texture2DArray',
        description:
            'Texture2DArray type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2darray',
        ],
    },
    {
        name: 'Texture2DMS',
        description:
            'Texture2DMS type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2dms',
        ],
    },
    {
        name: 'Texture2DMSArray',
        description:
            'Texture2DMSArray type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture2dmsarray',
        ],
    },
    {
        name: 'Texture3D',
        description:
            'Texture3D type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-texture3d',
        ],
    },
    {
        name: 'TextureCube',
        description:
            'TextureCube type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/texturecube',
        ],
    },
    {
        name: 'TextureCubeArray',
        description:
            'TextureCubeArray type (as it exists in Shader Model 4) plus resource variables.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/texturecubearray',
        ],
    },
    {
        name: 'FeedbackTexture2D',
        description:
            'For writing to feedback maps using template parameter type.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'FeedbackTexture2DArray',
        description:
            'For writing to feedback maps using template parameter type.',
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
        description:
            'Represents an array of control points that are available to the hull shader as inputs.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-inputpatch',
        ],
    },
    {
        name: 'LineStream',
        description: 'A sequence of line primitives.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type',
        ],
    },
    {
        name: 'OutputPatch',
        description:
            "Represents an array of output control points that are available to the hull shader's patch-constant function as well as the domain shader.",
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-object-outputpatch',
        ],
    },
    {
        name: 'PointStream',
        description: 'A sequence of point primitives.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type',
        ],
    },
    {
        name: 'RasterizerState',
    },
    {
        name: 'SamplerState',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'SamplerComparisonState',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
    },
    {
        name: 'TriangleStream',
        description: 'A sequence of triangle primitives.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-so-type',
        ],
    },
    {
        name: 'sampler_state',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sampler',
        ],
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
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#rayquery',
        ],
    },
];

export const hlslVectorMatrixStringTypes: LanguageElementInfo[] = [
    {
        name: 'vector',
        description:
            'A vector contains between one and four scalar components; every component of a vector must be of the same type.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-vector',
        ],
    },
    {
        name: 'matrix',
        description:
            'A matrix is a special data type that contains between one and sixteen components. Every component of a matrix must be of the same type.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-matrix',
        ],
    },
    {
        name: 'string',
        description:
            'HLSL also supports a string type, which is an ASCII string. There are no operations or states that accept strings; but effects can query string parameters and annotations.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar#string-type',
        ],
    },
];

export const hlslPrimitiveTypes: LanguageElementInfo[] = [
    {
        name: 'bool',
        description: 'true or false.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
        ],
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
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-scalar',
        ],
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
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'float64_t',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'int32_t',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'uint32_t',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'uint8_t4_packed',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
    },
    {
        name: 'int8_t4_packed',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/16-Bit-Scalar-Types',
        ],
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

export const hlslFunctions: LanguageElementInfo[] = [
    {
        name: 'abort',
        description:
            'Submits an error message to the information queue and terminates the current draw or dispatch call being executed.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/abort',
        ],
    },
    {
        name: 'abs',
        description: 'Returns the absolute value of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-abs',
        ],
    },
    {
        name: 'acos',
        description: 'Returns the arccosine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-acos',
        ],
    },
    {
        name: 'all',
        description:
            'Determines if all components of the specified value are non-zero.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-all',
        ],
    },
    {
        name: 'AllMemoryBarrier',
        description:
            'Blocks execution of all threads in a group until all memory accesses have been completed.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/allmemorybarrier',
        ],
    },
    {
        name: 'AllMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all memory accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/allmemorybarrierwithgroupsync',
        ],
    },
    {
        name: 'any',
        description:
            'Determines if any components of the specified value are non-zero.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-any',
        ],
    },
    {
        name: 'asdouble',
        description:
            'Reinterprets a cast value (two 32-bit values) into a double.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asdouble',
        ],
    },
    {
        name: 'asfloat',
        description:
            'Interprets the bit pattern of x as a floating-point number.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asfloat',
        ],
    },
    {
        name: 'asin',
        description: 'Returns the arcsine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asin',
        ],
    },
    {
        name: 'asint',
        description:
            'Interprets the bit pattern of an input value as an integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asint',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asint',
        ],
    },
    {
        name: 'asuint',
        description:
            'Reinterprets the bit pattern of a 64-bit value as two unsigned 32-bit integers.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asuint',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asuint',
        ],
    },
    {
        name: 'atan',
        description: 'Returns the arctangent of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-atan',
        ],
    },
    {
        name: 'atan2',
        description: 'Returns the arctangent of two values (x,y).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-atan2',
        ],
    },
    {
        name: 'ceil',
        description:
            'Returns the smallest integer value that is greater than or equal to the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ceil',
        ],
    },
    {
        name: 'CheckAccessFullyMapped',
        description:
            'Determines whether all values from a Sample, Gather, or Load operation accessed mapped tiles in a tiled resource.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/checkaccessfullymapped',
        ],
    },
    {
        name: 'clamp',
        description:
            'Clamps the specified value to the specified minimum and maximum range.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-clamp',
        ],
    },
    {
        name: 'clip',
        description:
            'Discards the current pixel if the specified value is less than zero.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-clip',
        ],
    },
    {
        name: 'cos',
        description: 'Returns the cosine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cos',
        ],
    },
    {
        name: 'cosh',
        description: 'Returns the hyperbolic cosine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cosh',
        ],
    },
    {
        name: 'countbits',
        description:
            'Counts the number of bits (per component) set in the input integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/countbits',
        ],
    },
    {
        name: 'cross',
        description:
            'Returns the cross product of two floating-point, 3D vectors.',
        type: 'float3',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cross',
        ],
    },
    {
        name: 'D3DCOLORtoUBYTE4',
        description:
            'Converts a floating-point, 4D vector set by a D3DCOLOR to a UBYTE4.',
        type: 'int4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-d3dcolortoubyte4',
        ],
    },
    {
        name: 'ddx',
        description:
            'Returns the partial derivative of the specified value with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ddx',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'ddx_coarse',
        description:
            'Computes a low precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddx-coarse',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'ddx_fine',
        description:
            'Computes a high precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddx-fine',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'ddy',
        description:
            'Returns the partial derivative of the specified value with respect to the screen-space y-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ddy',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'ddy_coarse',
        description:
            'Computes a low precision partial derivative with respect to the screen-space y-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddy-coarse',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'ddy_fine',
        description:
            'Computes a high precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddy-fine',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
    },
    {
        name: 'degrees',
        description: 'Converts the specified value from radians to degrees.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-degrees',
        ],
    },
    {
        name: 'determinant',
        description:
            'Returns the determinant of the specified floating-point, square matrix.',
        type: 'float',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-determinant',
        ],
    },
    {
        name: 'DeviceMemoryBarrier',
        description:
            'Blocks execution of all threads in a group until all device memory accesses have been completed.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/devicememorybarrier',
        ],
    },
    {
        name: 'DeviceMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all device memory accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/devicememorybarrierwithgroupsync',
        ],
    },
    {
        name: 'distance',
        description: 'Returns a distance scalar between two vectors.',
        type: 'float',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-distance',
        ],
    },
    {
        name: 'dot',
        description: 'Returns the dot product of two vectors.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-dot',
        ],
    },
    {
        name: 'dst',
        description: 'Calculates a distance vector.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dst',
        ],
    },
    {
        name: 'errorf',
        description: 'Submits an error message to the information queue.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/errorf',
        ],
    },
    {
        name: 'EvaluateAttributeCentroid',
        description: 'Evaluates at the pixel centroid.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributecentroid',
        ],
    },
    {
        name: 'EvaluateAttributeAtSample',
        description: 'Evaluates at the indexed sample location.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributeatsample',
        ],
    },
    {
        name: 'EvaluateAttributeSnapped',
        description: 'Evaluates at the pixel centroid with an offset.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributesnapped',
        ],
    },
    {
        name: 'exp',
        description:
            'Returns the base-e exponential, or eⁿ, of the specified value.',
        //used e^n, instead of e^x, because there is a superscript unicode character for n, but not for x
        //<sup> doesn't work, because IDEs sanitize HTML
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-exp',
        ],
    },
    {
        name: 'exp2',
        description:
            'Returns the base 2 exponential, or 2ⁿ, of the specified value.',
        //same as exp
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-exp2',
        ],
    },
    {
        name: 'f16tof32',
        description:
            'Converts the float16 stored in the low-half of the uint to a float.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/f16tof32',
        ],
    },
    {
        name: 'f32tof16',
        description: 'Converts an input into a float16 type.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/f32tof16',
        ],
    },
    {
        name: 'faceforward',
        description:
            'Flips the surface-normal (if needed) to face in a direction opposite to i; returns the result in n.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-faceforward',
        ],
    },
    {
        name: 'firstbithigh',
        description:
            'Gets the location of the first set bit starting from the highest order bit and working downward, per component.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/firstbithigh',
        ],
    },
    {
        name: 'firstbitlow',
        description:
            'Returns the location of the first set bit starting from the lowest order bit and working upward, per component.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/firstbitlow',
        ],
    },
    {
        name: 'floor',
        description:
            'Returns the largest integer that is less than or equal to the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-floor',
        ],
    },
    {
        name: 'fma',
        description:
            'Returns the double-precision fused multiply-addition of a * b + c.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fma',
        ],
    },
    {
        name: 'fmod',
        description: 'Returns the floating-point remainder of x/y.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fmod',
        ],
    },
    {
        name: 'frac',
        description:
            'Returns the fractional (or decimal) part of x; which is greater than or equal to 0 and less than 1.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-frac',
        ],
    },
    {
        name: 'frexp',
        description:
            'Returns the mantissa and exponent of the specified floating-point value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-frexp',
        ],
    },
    {
        name: 'fwidth',
        description:
            'Returns the absolute value of the partial derivatives of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fwidth',
        ],
    },
    {
        name: 'GetRenderTargetSampleCount',
        description: 'Gets the number of samples for a render target.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-getrendertargetsamplecount',
        ],
    },
    {
        name: 'GetRenderTargetSamplePosition',
        description:
            'Gets the sampling position (x,y) for a given sample index.',
        type: 'float2',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-getrendertargetsampleposition',
        ],
    },
    {
        name: 'GroupMemoryBarrier',
        description:
            'Blocks execution of all threads in a group until all group shared accesses have been completed.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/groupmemorybarrier',
        ],
    },
    {
        name: 'GroupMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all group shared accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/groupmemorybarrierwithgroupsync',
        ],
    },
    {
        name: 'InterlockedAdd',
        description:
            'Performs a guaranteed atomic add of value to the dest resource variable.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedadd',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedadd',
        ],
    },
    {
        name: 'InterlockedAnd',
        description: 'Performs a guaranteed atomic and.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedand',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedand',
        ],
    },
    {
        name: 'InterlockedCompareExchange',
        description:
            "Atomically compares the destination with the comparison value. If they are identical, the destination is overwritten with the input value. The original value is set to the destination's original value.",
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedcompareexchange',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedcompareexchange',
        ],
    },
    {
        name: 'InterlockedCompareStore',
        description:
            'Atomically compares the destination to the comparison value. If they are identical, the destination is overwritten with the input value.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedcomparestore',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedcomparestore',
        ],
    },
    {
        name: 'InterlockedExchange',
        description: 'Assigns value to dest and returns the original value.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedexchange',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedexchange',
        ],
    },
    {
        name: 'InterlockedMax',
        description: 'Performs a guaranteed atomic max.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedmax',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedmax',
        ],
    },
    {
        name: 'InterlockedMin',
        description: 'Performs a guaranteed atomic min.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedmin',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedmin',
        ],
    },
    {
        name: 'InterlockedOr',
        description: 'Performs a guaranteed atomic or.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedor',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedor',
        ],
    },
    {
        name: 'InterlockedXor',
        description: 'Performs a guaranteed atomic xor.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedxor',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedxor',
        ],
    },
    {
        name: 'isfinite',
        description:
            'Determines if the specified floating-point value is finite.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isfinite',
        ],
    },
    {
        name: 'isinf',
        description: 'Determines if the specified value is infinite.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isinf',
        ],
    },
    {
        name: 'isnan',
        description: 'Determines if the specified value is NAN or QNAN.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isnan',
        ],
    },
    {
        name: 'ldexp',
        description:
            'Returns the result of multiplying the specified value by two, raised to the power of the specified exponent.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ldexp',
        ],
    },
    {
        name: 'length',
        description:
            'Returns the length of the specified floating-point vector.',
        type: 'float',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-length',
        ],
    },
    {
        name: 'lerp',
        description: 'Performs a linear interpolation.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-lerp',
        ],
    },
    {
        name: 'lit',
        description: 'Returns a lighting coefficient vector.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-lit',
        ],
    },
    {
        name: 'log',
        description: 'Returns the base-e logarithm of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log',
        ],
    },
    {
        name: 'log10',
        description: 'Returns the base-10 logarithm of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log10',
        ],
    },
    {
        name: 'log2',
        description: 'Returns the base-2 logarithm of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log2',
        ],
    },
    {
        name: 'mad',
        description:
            'Performs an arithmetic multiply/add operation on three values.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/mad',
        ],
    },
    {
        name: 'max',
        description: 'Selects the greater of x and y.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-max',
        ],
    },
    {
        name: 'min',
        description: 'Selects the lesser of x and y.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-min',
        ],
    },
    {
        name: 'modf',
        description:
            'Splits the value x into fractional and integer parts, each of which has the same sign as x.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-modf',
        ],
    },
    {
        name: 'msad4',
        description:
            'Compares a 4-byte reference value and an 8-byte source value and accumulates a vector of 4 sums. Each sum corresponds to the masked sum of absolute differences of a different byte alignment between the reference value and the source value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-msad4',
        ],
    },
    {
        name: 'mul',
        description:
            'Multiplies x and y using matrix math. The inner dimension x-columns and y-rows must be equal.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-mul',
        ],
    },
    {
        name: 'noise',
        description:
            'Generates a random value using the Perlin-noise algorithm.',
        type: 'float',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-noise',
        ],
    },
    {
        name: 'normalize',
        description:
            'Normalizes the specified floating-point vector according to x / length(x).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-normalize',
        ],
    },
    {
        name: 'pow',
        description:
            'Returns the specified value raised to the specified power.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-pow',
        ],
    },
    {
        name: 'printf',
        description:
            'Submits a custom shader message to the information queue.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/printf',
        ],
    },
    {
        name: 'Process2DQuadTessFactorsAvg',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsavg',
        ],
    },
    {
        name: 'Process2DQuadTessFactorsMax',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsmax',
        ],
    },
    {
        name: 'Process2DQuadTessFactorsMin',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsmin',
        ],
    },
    {
        name: 'ProcessIsolineTessFactors',
        description:
            'Generates the rounded tessellation factors for an isoline.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processisolinetessfactors',
        ],
    },
    {
        name: 'ProcessQuadTessFactorsAvg',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsavg',
        ],
    },
    {
        name: 'ProcessQuadTessFactorsMax',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsmax',
        ],
    },
    {
        name: 'ProcessQuadTessFactorsMin',
        description:
            'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsmin',
        ],
    },
    {
        name: 'ProcessTriTessFactorsAvg',
        description:
            'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsavg',
        ],
    },
    {
        name: 'ProcessTriTessFactorsMax',
        description:
            'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsmax',
        ],
    },
    {
        name: 'ProcessTriTessFactorsMin',
        description:
            'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsmin',
        ],
    },
    {
        name: 'radians',
        description: 'Converts the specified value from degrees to radians.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-radians',
        ],
    },
    {
        name: 'rcp',
        description:
            'Calculates a fast, approximate, per-component reciprocal.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/rcp',
        ],
    },
    {
        name: 'reflect',
        description:
            'Returns a reflection vector using an incident ray and a surface normal.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-reflect',
        ],
    },
    {
        name: 'refract',
        description:
            'Returns a refraction vector using an entering ray, a surface normal, and a refraction index.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-refract',
        ],
    },
    {
        name: 'reversebits',
        description: 'Reverses the order of the bits, per component.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/reversebits',
        ],
    },
    {
        name: 'round',
        description:
            'Rounds the specified value to the nearest integer. Halfway cases are rounded to the nearest even.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-round',
        ],
    },
    {
        name: 'rsqrt',
        description:
            'Returns the reciprocal of the square root of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-rsqrt',
        ],
    },
    {
        name: 'saturate',
        description: 'Clamps the specified value within the range of 0 to 1.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-saturate',
        ],
    },
    {
        name: 'sign',
        description: 'Returns the sign of x.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sign',
        ],
    },
    {
        name: 'sin',
        description: 'Returns the sine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sin',
        ],
    },
    {
        name: 'sincos',
        description: 'Returns the sine and cosine of x.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sincos',
        ],
    },
    {
        name: 'sinh',
        description: 'Returns the hyperbolic sine of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sinh',
        ],
    },
    {
        name: 'smoothstep',
        description:
            'Returns a smooth Hermite interpolation between 0 and 1, if x is in the range [min, max].',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-smoothstep',
        ],
    },
    {
        name: 'sqrt',
        description:
            'Returns the square root of the specified floating-point value, per component.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sqrt',
        ],
    },
    {
        name: 'step',
        description:
            'Compares two values, returning 0 or 1 based on which value is greater.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-step',
        ],
    },
    {
        name: 'tan',
        description: 'Returns the tangent of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tan',
        ],
    },
    {
        name: 'tanh',
        description: 'Returns the hyperbolic tangent of the specified value.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tanh',
        ],
    },
    {
        name: 'tex1D',
        description: 'Samples a 1D texture.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1d',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1d-s-t-ddx-ddy',
        ],
    },
    {
        name: 'tex1Dbias',
        description: 'Samples a 1D texture after biasing the mip level by t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dbias',
        ],
    },
    {
        name: 'tex1Dgrad',
        description:
            'Samples a 1D texture using a gradient to select the mip level.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dgrad',
        ],
    },
    {
        name: 'tex1Dlod',
        description:
            'Samples a 1D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dlod',
        ],
    },
    {
        name: 'tex1Dproj',
        description:
            'Samples a 1D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dproj',
        ],
    },
    {
        name: 'tex2D',
        description: 'Samples a 2D texture.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2d',
        ],
    },
    {
        name: 'tex2Dbias',
        description: 'Samples a 2D texture after biasing the mip level by t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dbias',
        ],
    },
    {
        name: 'tex2Dgrad',
        description:
            'Samples a 2D texture using a gradient to select the mip level.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dgrad',
        ],
    },
    {
        name: 'tex2Dlod',
        description:
            'Samples a 2D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dlod',
        ],
    },
    {
        name: 'tex2Dproj',
        description:
            'Samples a 2D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dproj',
        ],
    },
    {
        name: 'tex3D',
        description: 'Samples a 3D texture.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3d',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3d-s-t-ddx-ddy',
        ],
    },
    {
        name: 'tex3Dbias',
        description: 'Samples a 3D texture after biasing the mip level by t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dbias',
        ],
    },
    {
        name: 'tex3Dgrad',
        description:
            'Samples a 3D texture using a gradient to select the mip level.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dgrad',
        ],
    },
    {
        name: 'tex3Dlod',
        description:
            'Samples a 3D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dlod',
        ],
    },
    {
        name: 'tex3Dproj',
        description:
            'Samples a 3D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dproj',
        ],
    },
    {
        name: 'texCUBE',
        description: 'Samples a cube texture.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcube',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcube-s-t-ddx-ddy',
        ],
    },
    {
        name: 'texCUBEbias',
        description:
            'Samples a cube texture after biasing the mip level by t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubebias',
        ],
    },
    {
        name: 'texCUBEgrad',
        description:
            'Samples a cube texture using a gradient to select the mip level.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubegrad',
        ],
    },
    {
        name: 'texCUBElod',
        description:
            'Samples a cube texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubelod',
        ],
    },
    {
        name: 'texCUBEproj',
        description:
            'Samples a cube texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubeproj',
        ],
    },
    {
        name: 'transpose',
        description: 'Transposes the specified input matrix.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-transpose',
        ],
    },
    {
        name: 'trunc',
        description:
            'Truncates a floating-point value to the integer component.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-trunc',
        ],
    },
    // shader model 6
    {
        name: 'QuadReadAcrossDiagonal',
        description:
            'Returns the specified local value which is read from the diagonally opposite lane in this quad.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadreadacrossdiagonal',
        ],
    },
    {
        name: 'QuadReadLaneAt',
        description:
            'Returns the specified source value from the lane identified by the lane ID within the current quad.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadreadlaneat',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#quad-read-functions',
        ],
    },
    {
        name: 'QuadReadAcrossX',
        description:
            'Returns the specified local value read from the other lane in this quad in the X direction.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadswapx',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#quad-read-functions',
        ],
    },
    {
        name: 'QuadReadAcrossY',
        description:
            'Returns the specified source value read from the other lane in this quad in the Y direction.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadswapy',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#quad-read-functions',
        ],
    },
    {
        name: 'WaveActiveAllEqual',
        description:
            'Returns true if the expression is the same for every active lane in the current wave (and thus uniform across it).',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveactiveallequal',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#booln-waveactiveallequaltype-expr-',
        ],
    },
    {
        name: 'WaveActiveBitAnd',
        description:
            'Returns the bitwise AND of all the values of the expression across all active lanes in the current wave and replicates it back to all active lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallbitand',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#int_type-waveactivebitand-int_type-expr',
        ],
    },
    {
        name: 'WaveActiveBitOr',
        description:
            'Returns the bitwise OR of all the values of <expr> across all active non-helper lanes in the current wave, and replicates it back to all active non-helper lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallbitor',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#int_type-waveactivebitor-int_type-expr-',
        ],
    },
    {
        name: 'WaveActiveBitXor',
        description:
            'Returns the bitwise XOR of all the values of the expression across all active lanes in the current wave and replicates it back to all active lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallbitxor',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#int_type-waveactivebitxor-int_type-expr',
        ],
    },
    {
        name: 'WaveActiveCountBits',
        description:
            'Counts the number of boolean variables which evaluate to true across all active lanes in the current wave, and replicates the result to all lanes in the wave.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveactivecountbits',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-waveactivecountbits-bool-bbit-',
        ],
        type: 'uint',
    },
    {
        name: 'WaveActiveMax',
        description:
            'Returns the maximum value of the expression across all active lanes in the current wave and replicates it back to all active lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallmax',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveactivemax-type-expr',
        ],
    },
    {
        name: 'WaveActiveMin',
        description:
            'Returns the minimum value of the expression across all active lanes in the current wave replicates it back to all active lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallmin',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveactivemin-type-expr',
        ],
    },
    {
        name: 'WaveActiveProduct',
        description:
            'Multiplies the values of the expression together across all active lanes in the current wave and replicates it back to all active lanes.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallproduct',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveactiveproduct-type-expr',
        ],
    },
    {
        name: 'WaveActiveSum',
        description:
            'Sums up the value of the expression across all active lanes in the current wave and replicates it to all lanes in the current wave.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveallsum',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveactivesum-type-expr-',
        ],
    },
    {
        name: 'WaveActiveAllTrue',
        description:
            'Returns true if the expression is true in all active lanes in the current wave.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavealltrue',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#bool-waveactivealltrue-bool-expr-',
        ],
    },
    {
        name: 'WaveActiveAnyTrue',
        description:
            'Returns true if the expression is true in any of the active lanes in the current wave.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveanytrue',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#bool-waveactiveanytrue-bool-expr-',
        ],
    },
    {
        name: 'WaveActiveBallot',
        description:
            'Returns a uint4 containing a bitmask of the evaluation of the Boolean expression for all active lanes in the current wave.',
        type: 'uint4',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveballot',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint4-waveactiveballot-bool-expr-',
        ],
    },
    {
        name: 'WaveGetLaneCount',
        description:
            'Returns the number of lanes in a wave on this architecture.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavegetlanecount',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-wavegetlanecount',
        ],
    },
    {
        name: 'WaveGetLaneIndex',
        description:
            'Returns the index of the current lane within the current wave.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavegetlaneindex',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-wavegetlaneindex',
        ],
    },
    {
        name: 'WaveIsFirstLane',
        description:
            'Returns true only for the active lane in the current wave with the smallest index.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveisfirstlane',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#bool-waveisfirstlane',
        ],
    },
    {
        name: 'WavePrefixCountBits',
        description:
            'Returns the sum of all the specified boolean variables set to true across all active lanes with indices smaller than the current lane.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveprefixcountbytes',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-waveprefixcountbits-bool-bbit-',
        ],
    },
    {
        name: 'WavePrefixProduct',
        description:
            'Returns the product of all of the values in the active lanes in this wave with indices less than this lane.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveprefixproduct',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveprefixproduct-type-value-',
        ],
    },
    {
        name: 'WavePrefixSum',
        description:
            'Returns the sum of all of the values in the active lanes with smaller indices than this one.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/waveprefixsum',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-waveprefixsum-type-value-',
        ],
    },
    {
        name: 'WaveReadLaneFirst',
        description:
            'Returns the value of the expression for the active lane of the current wave with the smallest index.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavereadfirstlane',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-wavereadlanefirst-type-expr-',
        ],
    },
    {
        name: 'WaveReadLaneAt',
        description:
            'Returns the value of the expression for the given lane index within the specified wave.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavereadlaneat',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#type-wavereadlaneat-type-expr-uint-laneindex',
        ],
    },
    // shader model 6.4
    {
        name: 'dot4add_u8packed',
        description:
            ' A 4-dimensional unsigned integer dot-product with add. Multiplies together each corresponding pair of unsigned 8-bit int bytes in the two input DWORDs, and sums the results into the 32-bit unsigned integer accumulator. This instruction operates within a single 32-bit wide SIMD lane. The inputs are also assumed to be 32-bit quantities.',
        type: 'uint32',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/Shader-Model-6.4#unsigned-integer-dot-product-of-4-elements-and-accumulate',
        ],
    },
    {
        name: 'dot4add_i8packed',
        description:
            ' A 4-dimensional signed integer dot-product with add. Multiplies together each corresponding pair of signed 8-bit int bytes in the two input DWORDs, and sums the results into the 32-bit signed integer accumulator. This instruction operates within a single 32-bit wide SIMD lane. The inputs are also assumed to be 32-bit quantities.',
        type: 'int32',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/Shader-Model-6.4#signed-integer-dot-product-of-4-elements-and-accumulate',
        ],
    },
    {
        name: 'dot2add',
        description:
            ' A 2-dimensional floating point dot product of half2 vectors with add. Multiplies the elements of the two half-precision float input vectors together and sums the results into the 32-bit float accumulator. These instructions operate within a single 32-bit wide SIMD lane. The inputs are 16-bit quantities packed into the same lane. This is not considered a ‘fused’ operation, and so need not emit INF due to fp16 overflow unless the precise declaration is used.',
        type: 'float',
        links: [
            'https://github.com/microsoft/DirectXShaderCompiler/wiki/Shader-Model-6.4#single-precision-floating-point-2-element-dot-product-and-accumulate',
        ],
    },
    // shader model 6.5
    {
        name: 'WaveMatch',
        description:
            "The WaveMatch() intrinsic compares the value of the expression in the current lane to its value in all other active lanes in the current wave and returns a bitmask representing the set of lanes matching current lane's value.",
        type: 'uint4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavematch-function',
        ],
    },
    {
        name: 'WaveMultiPrefixSum',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
    },

    {
        name: 'WaveMultiPrefixProduct',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
    },
    {
        name: 'WaveMultiPrefixCountBits',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
        type: 'uint',
    },
    {
        name: 'WaveMultiPrefixAnd',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
    },
    {
        name: 'WaveMultiPrefixOr',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
    },
    {
        name: 'WaveMultiPrefixXor',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions',
        ],
    },
    // shader model 6.6
    {
        name: 'InterlockedCompareStoreFloatBitwise',
        description:
            'Atomically compares and assigns the indicated floating-point value using a bitwise compare. The value in dest or indexed by dest_offset is compared to compare_value using a bitwise comparison of the value without consideration for floating-point special cases. If they are bitwise identical, the provided value is assigned to the that location.',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedcomparestorefloatbitwise',
        ],
    },
    {
        name: 'InterlockedCompareExchangeFloatBitwise',
        description:
            'Atomically compares, returns and assigns the indicated floating-point value using a bitwise compare.',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedcompareexchangefloatbitwise',
        ],
    },
    {
        name: 'IsHelperLane',
        description:
            'Returns true if a given lane in a pixel shader is a helper lane.',
        type: 'bool',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_6.html#ishelperlane',
        ],
    },
    {
        name: 'unpack_s8s16',
        description:
            'A set of unpack intrinsics are being added to unpack 4 signed or unsigned 8-bit values into a vector of 16 bit values or a 32 bit values. The 32 bit vector will not require the 16 bit native support.',
        type: 'int16_t4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#unpack-intrinsics',
        ],
    },
    {
        name: 'unpack_u8u16',
        description:
            'A set of unpack intrinsics are being added to unpack 4 signed or unsigned 8-bit values into a vector of 16 bit values or a 32 bit values. The 32 bit vector will not require the 16 bit native support.',
        type: 'uint16_t4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#unpack-intrinsics',
        ],
    },
    {
        name: 'unpack_s8s32',
        description:
            'A set of unpack intrinsics are being added to unpack 4 signed or unsigned 8-bit values into a vector of 16 bit values or a 32 bit values. The 32 bit vector will not require the 16 bit native support.',
        type: 'int32_t4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#unpack-intrinsics',
        ],
    },
    {
        name: 'unpack_u8u32',
        description:
            'A set of unpack intrinsics are being added to unpack 4 signed or unsigned 8-bit values into a vector of 16 bit values or a 32 bit values. The 32 bit vector will not require the 16 bit native support.',
        type: 'uint32_t4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#unpack-intrinsics',
        ],
    },
    {
        name: 'pack_u8',
        description:
            'Pack intrinsics will pack a vector of 4 signed or unsigned values into a packed 32 bit uint32_t represented by one of the new packed datatypes.',
        type: 'uint8_t4_packed',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#pack-intrinsics',
        ],
    },
    {
        name: 'pack_s8',
        description:
            'Pack intrinsics will pack a vector of 4 signed or unsigned values into a packed 32 bit uint32_t represented by one of the new packed datatypes.',
        type: 'int8_t4_packed',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#pack-intrinsics',
        ],
    },
    {
        name: 'pack_clamp_u8',
        description:
            'Pack intrinsics will pack a vector of 4 signed or unsigned values into a packed 32 bit uint32_t represented by one of the new packed datatypes.',
        type: 'uint8_t4_packed',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#pack-intrinsics',
        ],
    },
    {
        name: 'pack_clamp_s8',
        description:
            'Pack intrinsics will pack a vector of 4 signed or unsigned values into a packed 32 bit uint32_t represented by one of the new packed datatypes.',
        type: 'int8_t4_packed',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Pack_Unpack_Intrinsics.html#pack-intrinsics',
        ],
    },
    // mesh shader
    {
        name: 'SetMeshOutputCounts',
        description:
            'At the beginning of the shader the implementation internally sets a count of vertices and primitives to be exported from a threadgroup to 0. It means that if a mesh shader returns without calling this function, it will not output any mesh. This function sets the actual number of outputs from the threadgroup.',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#setmeshoutputcounts',
        ],
    },
    {
        name: 'DispatchMesh',
        description:
            'This function, called from the amplification shader, launches the threadgroups for the mesh shader.',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#dispatchmesh-intrinsic',
        ],
    },
    {
        name: 'WriteSamplerFeedback',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'WriteSamplerFeedbackBias',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'WriteSamplerFeedbackGrad',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    {
        name: 'WriteSamplerFeedbackLevel',
        type: 'void',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/SamplerFeedback.html#hlsl-constructs-for-writing-to-feedback-maps-1',
        ],
    },
    //QuadAny and QuadAll Intrinsics
    {
        name: 'QuadAny',
        description:
            'Returns true if <expr> is true in any lane of the current quad.',
        type: 'bool',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_QuadAny_QuadAll.html#quadall',
        ],
    },
    {
        name: 'QuadAll',
        description:
            'Returns true if <expr> is true in all lanes of the current quad.',
        type: 'bool',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_QuadAny_QuadAll.html#quadall',
        ],
    },
    // raytracing
    {
        name: 'AcceptHitAndEndSearch',
        description:
            'Used in an any hit shader to commit the current hit and then stop searching for more hits for the ray.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/accepthitandendsearch-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#accepthitandendsearch',
        ],
    },
    {
        name: 'CallShader',
        description: 'Invokes another shader from within a shader.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/callshader-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#callshader',
        ],
    },
    {
        name: 'IgnoreHit',
        description:
            'Called from an any hit shader to reject the hit and end the shader. The hit search continues on without committing the distance and attributes for the current hit.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/ignorehit-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#ignorehit',
        ],
    },
    {
        name: 'PrimitiveIndex',
        description:
            'Retrieves the autogenerated index of the primitive within the geometry inside the bottom-level acceleration structure instance.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/primitiveindex',
        ],
    },
    {
        name: 'ReportHit',
        description:
            'Called by an intersection shader to report a ray intersection.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/reporthit-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#reporthit',
        ],
    },
    {
        name: 'TraceRay',
        description:
            'Sends a ray into a search for hits in an acceleration structure.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/traceray-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#traceray',
        ],
    },
    {
        name: 'DispatchRaysIndex',
        description:
            'The current x and y location within the Width and Height made available through the DispatchRaysDimensions() system value intrinsic.',
        type: 'uint3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#dispatchraysindex',
        ],
    },
    {
        name: 'DispatchRaysDimensions',
        description:
            'The Width, Height and Depth values from the D3D12_DISPATCH_RAYS_DESC structure provided to the originating DispatchRays() call.',
        type: 'uint3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#dispatchraysdimensions',
        ],
    },
    {
        name: 'WorldRayOrigin',
        description: 'The world-space origin for the current ray.',
        type: 'float3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldrayorigin',
        ],
    },
    {
        name: 'WorldRayDirection',
        description: 'The world-space direction for the current ray.',
        type: 'float3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldraydirection',
        ],
    },
    {
        name: 'RayTMin',
        description:
            'This is a float representing the parametric starting point for the ray.',
        type: 'float',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytmin',
        ],
    },
    {
        name: 'RayTCurrent',
        description:
            'This is a float representing the current parametric ending point for the ray.',
        type: 'float',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytcurrent',
        ],
    },
    {
        name: 'RayFlags',
        description: 'This is a uint containing the current ray flags (only).',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#rayflags',
        ],
    },
    {
        name: 'InstanceIndex',
        description:
            'The autogenerated index of the current instance in the top-level structure.',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#instanceindex',
        ],
    },
    {
        name: 'InstanceID',
        description:
            'The user-provided InstanceID on the bottom-level acceleration structure instance within the top-level structure.',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#instanceid',
        ],
    },
    {
        name: 'GeometryIndex',
        description:
            'The autogenerated index of the current geometry in the bottom-level acceleration structure.',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#geometryindex',
        ],
    },
    {
        name: 'PrimitiveIndex',
        description:
            'The autogenerated index of the primitive within the geometry inside the bottom-level acceleration structure instance.',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#primitiveindex',
        ],
    },
    {
        name: 'ObjectRayOrigin',
        description: 'Object-space origin for the current ray.',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objectrayorigin',
        ],
    },
    {
        name: 'ObjectRayDirection',
        description: 'Object-space direction for the current ray.',
        type: 'float3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objectraydirection',
        ],
    },
    {
        name: 'ObjectToWorld3x4',
        description:
            'Matrix for transforming from object-space to world-space.',
        type: 'float3x4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objecttoworld3x4',
        ],
    },
    {
        name: 'ObjectToWorld4x3',
        description:
            'Matrix for transforming from object-space to world-space.',
        type: 'float4x3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objecttoworld4x3',
        ],
    },
    {
        name: 'WorldToObject3x4',
        description:
            'Matrix for transforming from world-space to object-space.',
        type: 'float3x4',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldtoobject3x4',
        ],
    },
    {
        name: 'WorldToObject4x3',
        description:
            'Matrix for transforming from world-space to object-space.',
        type: 'float4x3',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldtoobject4x3',
        ],
    },
    {
        name: 'HitKind',
        description: 'Returns the value passed as HitKind in ReportHit().',
        type: 'uint',
        links: [
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#hitkind',
        ],
    },
];
