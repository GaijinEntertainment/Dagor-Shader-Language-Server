import { Method } from '../interface/language-element-info';

export const load: Method[] = [
    {
        name: 'Load',
        description: 'Reads texture data.',
        returnType: 'void',
        parameters: [
            {
                modifiers: 'in',
                type: 'int',
                name: 'Location',
                description: 'The texture coordinates.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'An offset applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
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
                description: 'The texture coordinates.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'An offset applied to the texture coordinates before sampling.',
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
];

export const sample: Method[] = [
    {
        name: 'Sample',
        description: 'Samples a texture.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'Sample',
        description: 'Samples a texture with an optional value to clamp sample level-of-detail (LOD) values to.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'Sample',
        description:
            'Samples a texture with an optional value to clamp sample level-of-detail (LOD) values to, and returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
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
];

export const sampleBias: Method[] = [
    {
        name: 'SampleBias',
        description: 'Samples a texture, after applying the bias value to the mipmap level.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Bias',
                description:
                    'The bias value, which is a floating-point number between 0.0 and 1.0 inclusive, is applied to a mip level before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleBias',
        description:
            'Samples a texture, after applying the bias value to the mipmap level, with an optional value to clamp sample level-of-detail (LOD) values to.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Bias',
                description:
                    'The bias value, which is a floating-point number between 0.0 and 1.0 inclusive, is applied to a mip level before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleBias',
        description:
            'Samples a texture, after applying the bias value to the mipmap level, with an optional value to clamp sample level-of-detail (LOD) values to. Returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Bias',
                description:
                    'The bias value, which is a floating-point number between 0.0 and 1.0 inclusive, is applied to a mip level before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
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
];

export const sampleCmpLevelZero: Method[] = [
    {
        name: 'SampleCmpLevelZero',
        description: 'Samples a Texture1D on mipmap level 0 only and compares the result to a comparison value.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A floating-point value to use as a comparison value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleCmpLevelZero',
        description:
            'Samples a texture on mipmap level 0 only and compares the result to a comparison value. Returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A floating-point value to use as a comparison value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
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
];

export const sampleGrad: Method[] = [
    {
        name: 'SampleGrad',
        description: 'Samples a texture, using a gradient to influence the way the sample location is calculated.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDX',
                description:
                    'The rate of change of the surface geometry in the x direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDY',
                description:
                    'The rate of change of the surface geometry in the y direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleGrad',
        description:
            'Samples a texture, using a gradient to influence the way the sample location is calculated, with an optional value to clamp sample level-of-detail (LOD) values to.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDX',
                description:
                    'The rate of change of the surface geometry in the x direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDY',
                description:
                    'The rate of change of the surface geometry in the y direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleGrad',
        description:
            'Samples a texture, using a gradient to influence the way the sample location is calculated, with an optional value to clamp sample level-of-detail (LOD) values to. Returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDX',
                description:
                    'The rate of change of the surface geometry in the x direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'DDY',
                description:
                    'The rate of change of the surface geometry in the y direction. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
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
];

export const sampleLevel: Method[] = [
    {
        name: 'SampleLevel',
        description: 'Samples a texture on the specified mipmap level.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'LOD',
                description:
                    'A number that specifies the mipmap level. If the value is ≤ 0, mipmap level 0 (biggest map) is used. The fractional value (if supplied) is used to interpolate between two mipmap levels.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleLevel',
        description:
            'Samples a texture, using a gradient to influence the way the sample location is calculated, with an optional value to clamp sample level-of-detail (LOD) values to. Returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'LOD',
                description:
                    'A number that specifies the mipmap level. If the value is ≤ 0, mipmap level 0 (biggest map) is used. The fractional value (if supplied) is used to interpolate between two mipmap levels.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
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
];

export const sampleCmp: Method[] = [
    {
        name: 'SampleLevel',
        description: 'Samples a texture, using a comparison value to reject samples.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A floating-point value to use as a comparison value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleLevel',
        description:
            'Samples a texture, using a comparison value to reject samples, with an optional value to clamp sample level-of-detail (LOD) values to.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A floating-point value to use as a comparison value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'SampleLevel',
        description:
            'Samples a texture, using a comparison value to reject samples, with an optional value to clamp sample level-of-detail (LOD) values to. Returns status about the operation.',
        returnType: 'DXGI_FORMAT',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The texture coordinates. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A floating-point value to use as a comparison value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description:
                    'An optional texture coordinate offset, which can be used for any texture-object type; the offset is applied to the location before sampling. Use an offset only at an integer miplevel; otherwise, you may get results that do not translate well to hardware. The argument type is dependent on the texture-object type.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Clamp',
                description:
                    'An optional value to clamp sample LOD values to. For example, if you pass 2.0f for the clamp value, you ensure that no individual sample accesses a mip level less than 2.0f.',
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
];

export const gather: Method[] = [
    {
        name: 'Gather',
        description: 'Returns the four texel values that would be used in a bi-linear filtering operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'sampler',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'offset',
                description: 'The offset applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'Gather',
        description:
            'Returns the four texel values that would be used in a bi-linear filtering operation, along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description:
                    'A Sampler state. This is an object declared in an effect file that contains state assignments.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'The offset applied to the texture coordinates before sampling.',
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
];

export const gatherAlpha: Method[] = [
    {
        name: 'GatherAlpha',
        description:
            'Returns the alpha components of the four texel values that would be used in a bi-linear filtering operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'The offset applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherAlpha',
        description:
            'Returns the alpha components of the four texel values that would be used in a bi-linear filtering operation, along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'The offset applied to the texture coordinates before sampling.',
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
    {
        name: 'GatherAlpha',
        description:
            'Returns the alpha components of the four texel values that would be used in a bi-linear filtering operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherAlpha',
        description:
            'Returns the alpha components of the four texel values that would be used in a bi-linear filtering operation, along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
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
];

export const gatherBlue: Method[] = [
    {
        name: 'GatherBlue',
        description:
            'Returns the blue components of the four texel values that would be used in a bi-linear filtering operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'sampler',
                name: 's',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'offset',
                description: 'An offset that is applied to the texture coordinate before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherBlue',
        description:
            'Returns the blue components of the four texel values that would be used in a bi-linear filtering operation, along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'The offset applied to the texture coordinates before sampling.',
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
    {
        name: 'GatherBlue',
        description:
            'Returns the blue components of the four texel values that would be used in a bi-linear filtering operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherBlue',
        description:
            'Returns the blue components of the four texel values that would be used in a bi-linear filtering operation, along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
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
];

export const gatherCmp: Method[] = [
    {
        name: 'GatherCmp',
        description:
            'For four texel values that would be used in a bi-linear filtering operation, returns their comparison against a compare value.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset',
                description:
                    'The offset in texels applied to the texture coordinates before sampling. Must be a literal value.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherCmp',
        description:
            'For four texel values that would be used in a bi-linear filtering operation, returns their comparison against a compare value along with tile-mapping status.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset',
                description:
                    'The offset in texels applied to the texture coordinates before sampling. Must be a literal value.',
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
];

export const gatherCmpAlpha: Method[] = [
    {
        name: 'GatherCmpAlpha',
        description: 'Samples and compares a texture and returns the alpha component.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerComparisonState',
                name: 's',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'compare_value',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'offset',
                description: 'An offset that is applied to the texture coordinate before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherCmpAlpha',
        description:
            'Samples and compares a texture and returns the alpha component along with status about the operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int',
                name: 'Offset',
                description: 'The offset applied to the texture coordinates before sampling.',
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
    {
        name: 'GatherCmpAlpha',
        description: 'Samples and compares a texture and returns the alpha component.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'GatherCmpAlpha',
        description:
            'Samples and compares a texture and returns the alpha component along with status about the operation.',
        returnType: 'TemplateType',
        parameters: [
            {
                modifiers: 'in',
                type: 'SamplerState',
                name: 'S',
                description: 'The zero-based sampler index.',
            },
            {
                modifiers: 'in',
                type: 'float2',
                name: 'Location',
                description: 'The sample coordinates (u,v).',
            },
            {
                modifiers: 'in',
                type: 'float',
                name: 'CompareValue',
                description: 'A value to compare each against each sampled value.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset1',
                description: 'The first offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset2',
                description: 'The second offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset3',
                description: 'The third offset component applied to the texture coordinates before sampling.',
            },
            {
                modifiers: 'in',
                type: 'int2',
                name: 'Offset4',
                description: 'The fourth offset component applied to the texture coordinates before sampling.',
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
];
