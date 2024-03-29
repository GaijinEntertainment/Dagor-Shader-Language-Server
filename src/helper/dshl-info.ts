import { FunctionInfo } from '../interface/function/function-info';
import { LanguageElementInfo } from '../interface/language-element-info';

export const dshlKeywords: LanguageElementInfo[] = [
    { name: 'true' },
    { name: 'false' },
    { name: 'NULL' },
    { name: 'hlsl' },
    { name: 'if' },
    { name: 'else' },
    { name: 'compile' },
    { name: 'include' },
    { name: 'include_optional' },
    { name: 'assume' },
    { name: 'dont_render' },
    { name: 'no_dynstcode' },
    { name: 'render_trans' },
    { name: 'no_ablend' },
    { name: 'render_stage' },
    { name: 'interval' },
    { name: 'macro' },
    { name: 'define_macro_if_not_defined' },
    { name: 'endmacro' },
    { name: 'shader' },
    { name: 'block' },
    { name: 'supports' },
    { name: 'vs' },
    { name: 'hs' },
    { name: 'ds' },
    { name: 'gs' },
    { name: 'ps' },
    { name: 'cs' },
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
    { name: 'always_referenced' },
    { name: 'static' },
    { name: 'dynamic' },
    { name: 'local' },
    { name: 'channel' },
    { name: 'no_warnings' },
    { name: 'const' },
    { name: 'undefined_value' },
    { name: 'public' },
    { name: 'signed_pack' },
    { name: 'unsigned_pack' },
    { name: 'mul_1k' },
    { name: 'mul_2k' },
    { name: 'mul_4k' },
    { name: 'mul_8k' },
    { name: 'mul_16k' },
    { name: 'mul_32767' },
    { name: 'bounding_pack' },
    { name: 'register' },
    { name: 'optional' },
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
    { name: 'extra' },
    { name: 'globtm' },
    { name: 'projtm' },
    { name: 'viewprojtm' },
    { name: 'hardware' },
    { name: 'local_view_x' },
    { name: 'local_view_y' },
    { name: 'local_view_z' },
    { name: 'local_view_pos' },
    { name: 'world_local_x' },
    { name: 'world_local_y' },
    { name: 'world_local_z' },
    { name: 'world_local_pos' },
    { name: 'material' },
    { name: 'norm' },
    { name: 'pos' },
    { name: 'slope_z_bias' },
    { name: 'tc' },
    { name: 'vcol' },
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
    { name: 'float1' },
    { name: 'float2' },
    { name: 'float3' },
    { name: 'float4' },
    { name: 'float4x4' },
    { name: 'int' },
    { name: 'int4' },
    { name: 'color8' },
    { name: 'short2' },
    { name: 'short4' },
    { name: 'ubyte4' },
    { name: 'short2n' },
    { name: 'short4n' },
    { name: 'ushort2n' },
    { name: 'ushort4n' },
    { name: 'half2' },
    { name: 'half4' },
    { name: 'udec3' },
    { name: 'dec3n' },
];

export const dshlNonPrimitiveShortTypes: LanguageElementInfo[] = [
    {
        name: '@tex',
        sortName: 'tex',
        description: 'Texture without SamplerState',
    },
    {
        name: '@tex2d',
        sortName: 'tex2d',
        description: 'Texture2D without SamplerState',
    },
    {
        name: '@tex3d',
        sortName: 'tex3d',
        description: 'Texture3D without SamplerState',
    },
    {
        name: '@texArray',
        sortName: 'texArray',
        description: 'Texture2DArray without SamplerState',
    },
    {
        name: '@texCube',
        sortName: 'texCube',
        description: 'TextureCube without SamplerState',
    },
    {
        name: '@texCubeArray',
        sortName: 'texCubeArray',
        description: 'TextureCubeArray without SamplerState',
    },
    { name: '@smp', sortName: 'smp' },
    {
        name: '@smp2d',
        sortName: 'smp2d',
        description: 'Texture2D/SamplerState ',
    },
    {
        name: '@smp3d',
        sortName: 'smp3d',
        description: 'Texture3D/SamplerState',
    },
    {
        name: '@smpArray',
        sortName: 'smpArray',
        description: 'Texture2DArray/SamplerState',
    },
    {
        name: '@smpCube',
        sortName: 'smpCube',
        description: 'TextureCube/SamplerState',
    },
    {
        name: '@smpCubeArray',
        sortName: 'smpCubeArray',
        description: 'TextureCubeArray/SamplerState',
    },
    {
        name: '@shd',
        sortName: 'shd',
        description: 'Texture2D/SamplerComparisonState',
    },
    { name: '@buf', sortName: 'buf', description: 'Buffer/StructuredBuffer' },
    { name: '@cbuf', sortName: 'cbuf', description: 'ConstantBuffer' },
    { name: '@uav', sortName: 'uav' },
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
        parameters: [
            {
                name: 'tex',
                type: 'texture',
            },
            {
                name: 'value',
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
