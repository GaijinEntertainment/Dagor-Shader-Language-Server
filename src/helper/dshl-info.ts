import { FunctionInfo } from '../interface/function/function-info';
import { LanguageElementInfo } from '../interface/language-element-info';

export const dshlKeywords: LanguageElementInfo[] = [
    { name: 'true' },
    { name: 'false' },
    {
        name: 'NULL',
        description:
            'A special value of NULL will be assigned to the shader variant that has dont_render. When NULL dynamic variant is selected during runtime, no rendering happens. If a ShaderElement is being created from a NULL static shader variant, it will just return NULL.',
    },
    { name: 'hlsl' },
    {
        name: 'if',
        description:
            'if, else, else if directives are used to perform conditional compilation of different shader variants in DSHL. For each branch of the conditional statement, there will be created a shader variant. These variants are to be switched in runtime, based on the values in the conditionals.',
    },
    {
        name: 'else',
        description:
            'if, else, else if directives are used to perform conditional compilation of different shader variants in DSHL. For each branch of the conditional statement, there will be created a shader variant. These variants are to be switched in runtime, based on the values in the conditionals.',
    },
    { name: 'compile' },
    {
        name: 'include',
        description:
            'Includes in *.dshl files are always included one time, and should not be confused with #include directive in hlsl files and blocks, where they follow the regular preprocessor rules (and can be included multiple times).',
    },
    {
        name: 'include_optional',
        description:
            'Includes in *.dshl files are always included one time, and should not be confused with #include directive in hlsl files and blocks, where they follow the regular preprocessor rules (and can be included multiple times).',
    },
    {
        name: 'assume',
        description:
            'Shader variables can be assigned a fixed value when the shader is compiled via assume. Such shader vars may not be changed at runtime, their values will be constant in the binary. This allows to reduce number of shader variants or disable specific features for specific platforms.',
    },
    {
        name: 'dont_render',
        description:
            'dont_render is used to disable a shader, meaning that the shader containing dont_render will not be created at all. Most common use-case is to disable redundant variants of a shader, which is using some shared interval.',
    },
    {
        name: 'no_dynstcode',
        description:
            'no_dynstcode disallows the shader to use any kind of dynamic stcode in its body. This means that the shader can only access material variables, or variables defined in a shader block :ref:`shader-blocks`, which is supported by the shader.',
    },
    { name: 'render_trans' },
    { name: 'no_ablend' },
    { name: 'render_stage' },
    {
        name: 'interval',
        description:
            'Intervals are a way to generate multiple variants of a single shader, based on whether the value of a special variable falls into specific range. They can be created from an int or float shader variable using the interval keyword.',
    },
    { name: 'macro' },
    { name: 'define_macro_if_not_defined' },
    { name: 'endmacro' },
    { name: 'shader' },
    {
        name: 'block',
        description:
            'Shader Blocks are an extension of the Preshader idea and define variables/constants which are common for multiple shaders that support them. The intent is to optimize constant/texture switching.',
    },
    { name: 'supports' },
    { name: 'vs', description: 'Vertex Shader' },
    { name: 'hs', description: 'Hull Shader' },
    { name: 'ds', description: 'Domain Shader' },
    { name: 'gs', description: 'Geometry Shader' },
    { name: 'ps', description: 'Pixel Shader' },
    { name: 'cs', description: 'Compute Shader' },
    { name: 'ms', description: 'Mesh Shader' },
    { name: 'as', description: 'Amplification Shader' },
];

export const dshlEnumValues: LanguageElementInfo[] = [
    { name: 'zero' },
    { name: 'one' },
    { name: 'sc' },
    { name: 'isc' },
    { name: 'sa' },
    { name: 'isa' },
    { name: 'da' },
    { name: 'ida' },
    { name: 'dc' },
    { name: 'idc' },
    { name: 'sasat' },
    { name: 'bf' },
    { name: 'ibf' },
    { name: 'ccw' },
    { name: 'cw' },
    { name: 'none' },
    { name: 'never' },
    { name: 'less' },
    { name: 'equal' },
    { name: 'lessequal' },
    { name: 'greater' },
    { name: 'notequal' },
    { name: 'greaterequal' },
    { name: 'always' },
    { name: 'keep' },
    { name: 'replace' },
    { name: 'incrsat' },
    { name: 'decrsat' },
    { name: 'incr' },
    { name: 'dect' },
];

export const dshlModifiers: LanguageElementInfo[] = [
    {
        name: 'always_referenced',
        description:
            'always_referenced flag disallows shader compiler to remove any unused in global shader variables. This is helpful for providing some information for C++ code, i.e. the value of such variable can be obtained in C++ code.',
    },
    {
        name: 'static',
        description:
            'Means that the variable is a material parameter, which is set only once on material instantiation. All permutations on static variables are resolved during instantiating.',
    },
    {
        name: 'dynamic',
        description:
            'Similarly to static is a material parameter, but can be different in each material instance. Using dynamic variables causes all permutations on them to be resolved each frame, which adds some overhead, compared to using static variables.',
    },
    {
        name: 'local',
        description:
            'Basically on-stack variables that are not visible outside the shader and are not visible on the CPU side, they are only needed for some temporary calculations in shader blocks.',
    },
    {
        name: 'channel',
        description:
            'Data types that follow the channel keyword differ from those native DSHL types described in Data types and variables. These types are considered convertable, meaning that they are always casted to native HLSL data types when piped to variables in hlsl{...} blocks.',
    },
    {
        name: 'no_warnings',
        description:
            'It is a modifier for static variables only. It is used when we need to access shader variables on the CPU, without using them in shaders (which normally triggers warnings).',
    },
    { name: 'const' },
    { name: 'undefined_value' },
    { name: 'signed_pack', description: 'Converts data from [0..1] range to [-1..1] range' },
    { name: 'unsigned_pack', description: 'Converts data from [-1..1] range to [0..1] range' },
    { name: 'mul_1k', description: 'Multiplies data by 1024' },
    { name: 'mul_2k', description: 'Multiplies data by 2048' },
    { name: 'mul_4k', description: 'Multiplies data by 4096' },
    { name: 'mul_8k', description: 'Multiplies data by 8192' },
    { name: 'mul_16k', description: 'Multiplies data by 16384' },
    { name: 'mul_32767', description: 'Multiplies data by 32767 and clamps it to [-32767..32767] range' },
    {
        name: 'bounding_pack',
        description: 'Rescales data from [min..max] to [0..1] if usage_dst is unsigned or [-1..1] if it is signed',
    },
    { name: 'register' },
    {
        name: 'optional',
        description:
            'If the interval is used in HLSL code blocks, you can make this interval optional. All conditions in HLSL code which use optional intervals will be replaced with HLSL branches, thus reducing the number of shader variants.',
    },
    { name: 'global' },
];

export const dshlProperties: LanguageElementInfo[] = [
    { name: 'blend_asrc' },
    { name: 'blend_adst' },
    { name: 'blend_src' },
    { name: 'blend_dst' },
    { name: 'cull_mode' },
    { name: 'z_func' },
    { name: 'stencil_func' },
    { name: 'stencil_pass' },
    { name: 'stencil_fail' },
    { name: 'stencil_zfail' },
    { name: 'color_write' },
    { name: 'alpha_to_coverage' },
    { name: 'view_instances' },
    {
        name: 'extra',
        description: 'Extra, can be used only as usage_src (used for providing additional info for vertices)',
    },
    { name: 'globtm', description: 'float4x4 world-view-projection matrix', type: 'float4x4' },
    { name: 'projtm', description: 'float4x4 projection matrix', type: 'float4x4' },
    { name: 'viewprojtm', description: 'float4x4 view-projection matrix', type: 'float4x4' },
    { name: 'hardware' },
    { name: 'local_view_x', description: 'column of inverse view matrix, in float3 format', type: 'float3' },
    { name: 'local_view_y', description: 'column of inverse view matrix, in float3 format', type: 'float3' },
    { name: 'local_view_z', description: 'column of inverse view matrix, in float3 format', type: 'float3' },
    { name: 'local_view_pos' },
    { name: 'world_local_x', description: 'column of world transform matrix, in float3 format', type: 'float3' },
    { name: 'world_local_y', description: 'column of world transform matrix, in float3 format', type: 'float3' },
    { name: 'world_local_z', description: 'column of world transform matrix, in float3 format', type: 'float3' },
    { name: 'world_local_pos' },
    {
        name: 'material',
        description:
            'Textures can be referenced by using material keyword. You, as a shader creator, specify how many material.texture[..] channels a shader must have just by referencing these channels in code.',
    },
    { name: 'norm', description: 'Normal' },
    { name: 'pos', description: 'Position' },
    { name: 'slope_z_bias' },
    { name: 'tc', description: 'Texture coordinates' },
    { name: 'vcol', description: 'Vertex color' },
    { name: 'z_bias' },
    { name: 'two_sided' },
    { name: 'z_write' },
    { name: 'z_test' },
    { name: 'real_two_sided' },
    { name: 'immediate_dword_count' },
    { name: 'stencil' },
    { name: 'stencil_ref' },
];

export const dshlNonPrimitiveTypes: LanguageElementInfo[] = [
    { name: 'texture' },
    { name: 'buffer' },
    { name: 'const_buffer' },
    { name: 'sampler' },
];

export const dshlPrimitiveTypes: LanguageElementInfo[] = [
    { name: 'bool' },
    { name: 'float' },
    { name: 'float1', description: '1D float (x, 0, 0, 1)' },
    { name: 'float2', description: '2D float (x, y, 0, 1)' },
    { name: 'float3', description: '3D float (x, y, z, 1)' },
    { name: 'float4', description: '4D float (x, y, z, w)' },
    { name: 'float4x4' },
    { name: 'int' },
    { name: 'int4' },
    { name: 'color8', description: '4-byte (R, G, B, A) color in [0..1] range' },
    { name: 'short2', description: '2D signed short (x, y, 0, 1)' },
    { name: 'short4', description: '4D signed short (x, y, z, w)' },
    { name: 'ubyte4', description: '4D uint8_t (x, y, z, w)' },
    { name: 'short2n', description: '2D signed short normalized (x/32767.0, y/32767.0 , 0, 1)' },
    { name: 'short4n', description: '4D signed short normalized (x/32767.0, y/32767.0 , z/32767.0, w/32767.0)' },
    { name: 'ushort2n', description: '2D unsigned short normalized (x/32767.0, y/32767.0 , 0, 1)' },
    { name: 'ushort4n', description: '4D unsigned short normalized (x/32767.0, y/32767.0 , z/32767.0, w/32767.0)' },
    { name: 'half2', description: '2D 16-bit float (x, y, 0, 1)' },
    { name: 'half4', description: '4D 16-bit float (x, y, z, w)' },
    { name: 'udec3', description: '3D unsigned 10-bit float (x, y, z, 1)' },
    { name: 'dec3n', description: '3D signed 10-bit float normalized (x/511.0, y/511.0, z/511.0, 1)' },
];

export const dshlNonPrimitiveShortTypes: LanguageElementInfo[] = [
    { name: '@tex', sortName: 'tex', description: 'Texture without SamplerState' },
    { name: '@tex2d', sortName: 'tex2d', description: 'Texture2D without SamplerState' },
    { name: '@tex3d', sortName: 'tex3d', description: 'Texture3D without SamplerState' },
    { name: '@texArray', sortName: 'texArray', description: 'Texture2DArray without SamplerState' },
    { name: '@texCube', sortName: 'texCube', description: 'TextureCube without SamplerState' },
    { name: '@texCubeArray', sortName: 'texCubeArray', description: 'TextureCubeArray without SamplerState' },
    { name: '@smp', sortName: 'smp', description: 'Texture/SamplerState' },
    { name: '@smp2d', sortName: 'smp2d', description: 'Texture2D/SamplerState ' },
    { name: '@smp3d', sortName: 'smp3d', description: 'Texture3D/SamplerState' },
    { name: '@smpArray', sortName: 'smpArray', description: 'Texture2DArray/SamplerState' },
    { name: '@smpCube', sortName: 'smpCube', description: 'TextureCube/SamplerState' },
    { name: '@smpCubeArray', sortName: 'smpCubeArray', description: 'TextureCubeArray/SamplerState' },
    { name: '@shd', sortName: 'shd', description: 'Texture2D/SamplerComparisonState' },
    { name: '@buf', sortName: 'buf', description: 'Buffer/StructuredBuffer' },
    { name: '@cbuf', sortName: 'cbuf', description: 'ConstantBuffer' },
    { name: '@uav', sortName: 'uav', description: 'Unordered Access View Texture' },
];

export const dshlPrimitiveShortTypes: LanguageElementInfo[] = [
    { name: '@f1', sortName: 'f1', description: 'float' },
    { name: '@f2', sortName: 'f2', description: 'float2' },
    { name: '@f3', sortName: 'f3', description: 'float3' },
    { name: '@f4', sortName: 'f4', description: 'float4' },
    { name: '@i1', sortName: 'i1', description: 'int' },
    { name: '@i2', sortName: 'i2', description: 'int2' },
    { name: '@i3', sortName: 'i3', description: 'int3' },
    { name: '@i4', sortName: 'i4', description: 'int4' },
    { name: '@f44', sortName: 'f44', description: 'float4x4' },
];

export const dshlFunctions: FunctionInfo[] = [
    {
        name: 'error',
        description: 'You can cause a compilation error with the message.',
        type: 'void',
        parameters: [
            {
                name: 'message',
                type: 'string',
            },
        ],
    },
    {
        name: 'maybe',
        description:
            'The maybe intrinsic can be used in a bool-expression. The argument is any identifier. If this identifier is not a Boolean variable, the intrinsic will return false, otherwise the value of this Boolean variable.',
        type: 'bool',
        parameters: [
            {
                name: 'condition',
                type: 'bool',
            },
        ],
    },
    {
        name: 'time_phase',
        type: 'float',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
        ],
    },
    {
        name: 'sin',
        type: 'float',
        parameters: [
            {
                name: 'value',
                type: 'float',
            },
        ],
    },
    {
        name: 'cos',
        type: 'float',
        parameters: [
            {
                name: 'value',
                type: 'float',
            },
        ],
    },
    {
        name: 'pow',
        type: 'float',
        parameters: [
            {
                name: 'base',
                type: 'float',
            },
            {
                name: 'exponent',
                type: 'float',
            },
        ],
    },
    {
        name: 'sRGBread',
        type: 'float4',
        parameters: [
            {
                name: 'value',
                type: 'float4',
            },
        ],
    },
    {
        name: 'vecpow',
        type: 'float4',
        parameters: [
            {
                name: 'base',
                type: 'float4',
            },
            {
                name: 'exponent',
                type: 'float',
            },
        ],
    },
    {
        name: 'fsel',
        type: 'float',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
            {
                name: 'f3',
                type: 'float',
            },
        ],
    },
    {
        name: 'sqrt',
        type: 'float',
        parameters: [
            {
                name: 'value',
                type: 'float',
            },
        ],
    },
    {
        name: 'min',
        type: 'float',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
        ],
    },
    {
        name: 'max',
        type: 'float',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
        ],
    },
    {
        name: 'anim_frame',
        type: 'float4',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
            {
                name: 'f3',
                type: 'float',
            },
            {
                name: 'f4',
                type: 'float',
            },
        ],
    },
    {
        name: 'wind_coeff',
        type: 'float4',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
        ],
    },
    {
        name: 'fade_val',
        type: 'float',
        parameters: [
            {
                name: 'f1',
                type: 'float',
            },
            {
                name: 'f2',
                type: 'float',
            },
            {
                name: 'f3',
                type: 'float',
            },
            {
                name: 'f4',
                type: 'float',
            },
        ],
    },
    {
        name: 'get_dimensions',
        type: 'float4',
        description: 'Returns the width, height, array count or depth, and mip count.',
        parameters: [
            {
                name: 'tex',
                type: 'texture',
            },
            {
                name: 'mip',
                type: 'float',
            },
        ],
    },
    {
        name: 'get_size',
        type: 'float',
        parameters: [
            {
                name: 'buf',
                type: 'buffer',
            },
        ],
    },
    { name: 'get_viewport', type: 'float4', parameters: [] },
];
