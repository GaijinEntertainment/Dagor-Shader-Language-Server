import { LanguageElementInfo } from '../interface/language-element-info';

export const hlslFunctions: LanguageElementInfo[] = [
    {
        name: 'abort',
        description:
            'Submits an error message to the information queue and terminates the current draw or dispatch call being executed.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/abort'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
    },
    {
        name: 'abs',
        description: 'Returns the absolute value of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-abs'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['same'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'acos',
        description: 'Returns the arccosine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-acos'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description:
                            'The specified value. Each component should be a floating-point value within the range of -1 to 1.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'all',
        description: 'Determines if all components of the specified value are non-zero.',
        type: 'bool',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-all'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int', 'bool'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['bool'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'AllMemoryBarrier',
        description: 'Blocks execution of all threads in a group until all memory accesses have been completed.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/allmemorybarrier'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['compute'],
    },
    {
        name: 'AllMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all memory accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/allmemorybarrierwithgroupsync'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['compute'],
    },
    {
        name: 'any',
        description: 'Determines if any components of the specified value are non-zero.',
        type: 'bool',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-any'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int', 'bool'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['bool'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'asdouble',
        description: 'Reinterprets a cast value (two 32-bit values) into a double.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asdouble'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'lowbits',
                        description: 'The low 32-bit pattern of the input value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'highbits',
                        description: 'The high 32-bit pattern of the input value.',
                    },
                ],
                returnType: 'double',
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint2',
                        name: 'lowbits',
                        description: 'The low 32-bit pattern of the input value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint2',
                        name: 'highbits',
                        description: 'The high 32-bit pattern of the input value.',
                    },
                ],
                returnType: 'double2',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'asfloat',
        description: 'Interprets the bit pattern of x as a floating-point number.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asfloat'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int', 'uint'],
                        size: 'any',
                        description: 'The input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'asin',
        description: 'Returns the arcsine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asin'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'asint',
        description: 'Interprets the bit pattern of an input value as an integer.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asint',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asint',
        ],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'uint'],
                        size: 'any',
                        description: 'The input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'asuint',
        description: 'Reinterprets the bit pattern of a 64-bit value as two unsigned 32-bit integers.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-asuint',
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/asuint',
        ],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'double',
                        name: 'value',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'lowbits',
                        description: 'The low 32-bit pattern of value.',
                    },
                    {
                        modifiers: 'out',
                        type: 'uint',
                        name: 'highbits',
                        description: 'The high 32-bit pattern of value.',
                    },
                ],
                returnType: 'void',
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['uint'],
                    size: 'same',
                },
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'atan',
        description: 'Returns the arctangent of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-atan'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'atan2',
        description: 'Returns the arctangent of two values (x,y).',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-atan2'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The y value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The x value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'ceil',
        description: 'Returns the smallest integer value that is greater than or equal to the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ceil'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'CheckAccessFullyMapped',
        description:
            'Determines whether all values from a Sample, Gather, or Load operation accessed mapped tiles in a tiled resource.',
        type: 'bool',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/checkaccessfullymapped'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'x',
                        description:
                            "The status value that is returned from a Sample, Gather, or Load operation. Because you can't access this status value directly, you need to pass it to CheckAccessFullyMapped.",
                    },
                ],
                returnType: 'bool',
            },
        ],
        available: ['pixel', 'compute'],
    },
    {
        name: 'clamp',
        description: 'Clamps the specified value to the specified minimum and maximum range.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-clamp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'A value to clamp.',
                    },
                    {
                        modifiers: 'in',
                        name: 'min',
                        templateType: ['same'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The specified minimum range.',
                    },
                    {
                        modifiers: 'in',
                        name: 'max',
                        templateType: ['same'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The specified maximum range.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'clip',
        description: 'Discards the current pixel if the specified value is less than zero.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-clip'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: 'void',
            },
        ],
    },
    {
        name: 'cos',
        description: 'Returns the cosine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cos'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'cosh',
        description: 'Returns the hyperbolic cosine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cosh'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'countbits',
        description: 'Counts the number of bits (per component) set in the input integer.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/countbits'],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'uint', name: 'value', description: 'The input value.' }],
                returnType: 'uint',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint2', name: 'value', description: 'The input value.' }],
                returnType: 'uint2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint3', name: 'value', description: 'The input value.' }],
                returnType: 'uint3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint4', name: 'value', description: 'The input value.' }],
                returnType: 'uint4',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'cross',
        description: 'Returns the cross product of two floating-point, 3D vectors.',
        type: 'float3',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-cross'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 3,
                        description: 'The first floating-point, 3D vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 3,
                        description: 'The second floating-point, 3D vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 3,
                },
            },
        ],
    },
    {
        name: 'D3DCOLORtoUBYTE4',
        description: 'Converts a floating-point, 4D vector set by a D3DCOLOR to a UBYTE4.',
        type: 'int4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-d3dcolortoubyte4'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 4,
                        description: 'The floating-point vector4 to convert.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['int'],
                    size: 4,
                },
            },
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
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'ddx_coarse',
        description: 'Computes a low precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddx-coarse',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'float', name: 'value', description: 'The input value.' }],
                returnType: 'float',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float2', name: 'value', description: 'The input value.' }],
                returnType: 'float2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float3', name: 'value', description: 'The input value.' }],
                returnType: 'float3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float4', name: 'value', description: 'The input value.' }],
                returnType: 'float4',
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'ddx_fine',
        description: 'Computes a high precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddx-fine',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'float', name: 'value', description: 'The input value.' }],
                returnType: 'float',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float2', name: 'value', description: 'The input value.' }],
                returnType: 'float2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float3', name: 'value', description: 'The input value.' }],
                returnType: 'float3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float4', name: 'value', description: 'The input value.' }],
                returnType: 'float4',
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'ddy',
        description:
            'Returns the partial derivative of the specified value with respect to the screen-space y-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ddy',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'ddy_coarse',
        description: 'Computes a low precision partial derivative with respect to the screen-space y-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddy-coarse',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'float', name: 'value', description: 'The input value.' }],
                returnType: 'float',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float2', name: 'value', description: 'The input value.' }],
                returnType: 'float2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float3', name: 'value', description: 'The input value.' }],
                returnType: 'float3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float4', name: 'value', description: 'The input value.' }],
                returnType: 'float4',
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'ddy_fine',
        description: 'Computes a high precision partial derivative with respect to the screen-space x-coordinate.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/ddy-fine',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#derivative-functions',
        ],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'float', name: 'value', description: 'The input value.' }],
                returnType: 'float',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float2', name: 'value', description: 'The input value.' }],
                returnType: 'float2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float3', name: 'value', description: 'The input value.' }],
                returnType: 'float3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float4', name: 'value', description: 'The input value.' }],
                returnType: 'float4',
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'degrees',
        description: 'Converts the specified value from radians to degrees.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-degrees'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'determinant',
        description: 'Returns the determinant of the specified floating-point, square matrix.',
        type: 'float',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-determinant'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'm',
                        templateType: ['matrix'],
                        componentType: ['float'],
                        size: 'any', //TODO: only square
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'DeviceMemoryBarrier',
        description: 'Blocks execution of all threads in a group until all device memory accesses have been completed.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/devicememorybarrier'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['pixel', 'compute'],
    },
    {
        name: 'DeviceMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all device memory accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/devicememorybarrierwithgroupsync'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['compute'],
    },
    {
        name: 'distance',
        description: 'Returns a distance scalar between two vectors.',
        type: 'float',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-distance'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The first floating-point vector to compare.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The second floating-point vector to compare.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'dot',
        description: 'Returns the dot product of two vectors.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-dot'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The first vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The second vector.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float', 'int'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'dst',
        description: 'Calculates a distance vector.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dst'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'src0',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The first vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'src1',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The second vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'errorf',
        description: 'Submits an error message to the information queue.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/errorf'],
        // TODO: varargs
    },
    {
        name: 'EvaluateAttributeCentroid',
        description: 'Evaluates at the pixel centroid.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributecentroid'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in attrib',
                        name: 'value',
                        templateType: ['scalar'],
                        componentType: ['float', 'int', 'uint'], //TODO: numeric
                        size: 'any',
                        description: 'The first vector.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float', 'int', 'uint'],
                    size: 'same',
                },
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'EvaluateAttributeAtSample',
        description: 'Evaluates at the indexed sample location.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributeatsample'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in attrib',
                        name: 'value',
                        templateType: ['scalar'],
                        componentType: ['float', 'int', 'uint'], // TODO: numeric
                        size: 'any',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'sampleindex',
                        description: 'The sample location.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float', 'int', 'uint'],
                    size: 'same',
                },
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'EvaluateAttributeSnapped',
        description: 'Evaluates at the pixel centroid with an offset.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/evaluateattributesnapped'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in attrib',
                        name: 'value',
                        templateType: ['scalar'],
                        componentType: ['float', 'int', 'uint'], // TODO: numeric
                        size: 'any',
                        description: 'The input value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'int2',
                        name: 'offset',
                        description: 'A 2D offset from the pixel center using a 16x16 grid.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float', 'int', 'uint'],
                    size: 'same',
                },
            },
        ],
        available: ['pixel'],
    },
    {
        name: 'exp',
        description: 'Returns the base-e exponential, or eⁿ, of the specified value.',
        //used e^n, instead of e^x, because there is a superscript unicode character for n, but not for x
        //<sup> doesn't work, because IDEs sanitize HTML
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-exp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'exp2',
        description: 'Returns the base 2 exponential, or 2ⁿ, of the specified value.',
        //same as exp
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-exp2'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'f16tof32',
        description: 'Converts the float16 stored in the low-half of the uint to a float.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/f16tof32'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: 'float',
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint2',
                        name: 'value',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: 'float2',
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint3',
                        name: 'value',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: 'float3',
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint4',
                        name: 'value',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: 'float4',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'f32tof16',
        description: 'Converts an input into a float16 type.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/f32tof16'],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'float', name: 'value', description: 'The input value.' }],
                returnType: 'uint',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float2', name: 'value', description: 'The input value.' }],
                returnType: 'uint2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float3', name: 'value', description: 'The input value.' }],
                returnType: 'uint3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'float4', name: 'value', description: 'The input value.' }],
                returnType: 'uint4',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'faceforward',
        description:
            'Flips the surface-normal (if needed) to face in a direction opposite to i; returns the result in n.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-faceforward'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'n',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The resulting floating-point surface-normal vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'i',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description:
                            'A floating-point, incident vector that points from the view position to the shading position.',
                    },
                    {
                        modifiers: 'in',
                        name: 'ng',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'A floating-point surface-normal vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'firstbithigh',
        description:
            'Gets the location of the first set bit starting from the highest order bit and working downward, per component.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/firstbithigh'],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'int', name: 'value', description: 'The input value.' }],
                returnType: 'int',
            },
            {
                parameters: [{ modifiers: 'in', type: 'int2', name: 'value', description: 'The input value.' }],
                returnType: 'int2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'int3', name: 'value', description: 'The input value.' }],
                returnType: 'int3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'int4', name: 'value', description: 'The input value.' }],
                returnType: 'int4',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint', name: 'value', description: 'The input value.' }],
                returnType: 'uint',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint2', name: 'value', description: 'The input value.' }],
                returnType: 'uint2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint3', name: 'value', description: 'The input value.' }],
                returnType: 'uint3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint4', name: 'value', description: 'The input value.' }],
                returnType: 'uint4',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'firstbitlow',
        description:
            'Returns the location of the first set bit starting from the lowest order bit and working upward, per component.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/firstbitlow'],
        overloads: [
            {
                parameters: [{ modifiers: 'in', type: 'uint', name: 'value', description: 'The input value.' }],
                returnType: 'uint',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint2', name: 'value', description: 'The input value.' }],
                returnType: 'uint2',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint3', name: 'value', description: 'The input value.' }],
                returnType: 'uint3',
            },
            {
                parameters: [{ modifiers: 'in', type: 'uint4', name: 'value', description: 'The input value.' }],
                returnType: 'uint4',
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'floor',
        description: 'Returns the largest integer that is less than or equal to the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-floor'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'fma',
        description: 'Returns the double-precision fused multiply-addition of a * b + c.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fma'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'a',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['double'],
                        size: 'any',
                        description: 'The first value in the fused multiply-addition.',
                    },
                    {
                        modifiers: 'in',
                        name: 'b',
                        templateType: ['same'],
                        componentType: ['double'],
                        size: 'same',
                        description: 'The second value in the fused multiply-addition.',
                    },
                    {
                        modifiers: 'in',
                        name: 'c',
                        templateType: ['same'],
                        componentType: ['double'],
                        size: 'same',
                        description: 'The third value in the fused multiply-addition.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['double'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'fmod',
        description: 'Returns the floating-point remainder of x/y.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fmod'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The floating-point dividend.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The floating-point divisor.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'frac',
        description:
            'Returns the fractional (or decimal) part of x; which is greater than or equal to 0 and less than 1.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-frac'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'frexp',
        description: 'Returns the mantissa and exponent of the specified floating-point value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-frexp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description:
                            'The specified floating-point value. If the x parameter is 0, this function returns 0 for both the mantissa and the exponent.',
                    },
                    {
                        modifiers: 'out',
                        name: 'exp',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The returned exponent of the x parameter.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'fwidth',
        description: 'Returns the absolute value of the partial derivatives of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-fwidth'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'GetRenderTargetSampleCount',
        description: 'Gets the number of samples for a render target.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-getrendertargetsamplecount',
        ],
        overloads: [
            {
                parameters: [],
                returnType: 'uint',
            },
        ],
    },
    {
        name: 'GetRenderTargetSamplePosition',
        description: 'Gets the sampling position (x,y) for a given sample index.',
        type: 'float2',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-getrendertargetsampleposition',
        ],
        overloads: [
            {
                parameters: [
                    { modifiers: 'in', type: 'int', name: 'index', description: 'A zero-based sample index.' },
                ],
                returnType: 'float2',
            },
        ],
    },
    {
        name: 'GroupMemoryBarrier',
        description: 'Blocks execution of all threads in a group until all group shared accesses have been completed.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/groupmemorybarrier'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['compute'],
    },
    {
        name: 'GroupMemoryBarrierWithGroupSync',
        description:
            'Blocks execution of all threads in a group until all group shared accesses have been completed and all threads in the group have reached this call.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/groupmemorybarrierwithgroupsync'],
        overloads: [
            {
                parameters: [],
                returnType: 'void',
            },
        ],
        available: ['compute'],
    },
    {
        name: 'InterlockedAdd',
        description: 'Performs a guaranteed atomic add of value to the dest resource variable.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedadd',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedadd',
        ],
        // TODO: template
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'InterlockedAnd',
        description: 'Performs a guaranteed atomic and.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedand',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedand',
        ],
        // TODO: template
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
        // TODO: template
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
        // TODO: template
    },
    {
        name: 'InterlockedExchange',
        description: 'Assigns value to dest and returns the original value.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedexchange',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedexchange',
        ],
        // TODO: template
    },
    {
        name: 'InterlockedMax',
        description: 'Performs a guaranteed atomic max.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedmax',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedmax',
        ],
        // TODO: template
    },
    {
        name: 'InterlockedMin',
        description: 'Performs a guaranteed atomic min.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedmin',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedmin',
        ],
        // TODO: template
    },
    {
        name: 'InterlockedOr',
        description: 'Performs a guaranteed atomic or.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedor',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedor',
        ],
        // TODO: template
    },
    {
        name: 'InterlockedXor',
        description: 'Performs a guaranteed atomic xor.',
        type: 'void',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/interlockedxor',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Int64_and_Float_Atomics.html#interlockedxor',
        ],
        // TODO: template
    },
    {
        name: 'isfinite',
        description: 'Determines if the specified floating-point value is finite.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isfinite'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['bool'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'isinf',
        description: 'Determines if the specified value is infinite.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isinf'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['bool'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'isnan',
        description: 'Determines if the specified value is NAN or QNAN.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-isnan'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['bool'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'ldexp',
        description:
            'Returns the result of multiplying the specified value by two, raised to the power of the specified exponent.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-ldexp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'exp',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The specified exponent.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'length',
        description: 'Returns the length of the specified floating-point vector.',
        type: 'float',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-length'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified floating-point vector.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'lerp',
        description: 'Performs a linear interpolation.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-lerp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The first-floating point value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The second-floating point value.',
                    },
                    {
                        modifiers: 'in',
                        name: 's',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'A value that linearly interpolates between the x parameter and the y parameter.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'lit',
        description: 'Returns a lighting coefficient vector.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-lit'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'n_dot_l',
                        templateType: ['scalar'],
                        componentType: ['float'],
                        size: 1,
                        description: 'The dot product of the normalized surface normal and the light vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'n_dot_h',
                        templateType: ['scalar'],
                        componentType: ['float'],
                        size: 1,
                        description: 'The dot product of the half-angle vector and the surface normal.',
                    },
                    {
                        modifiers: 'in',
                        name: 'm',
                        templateType: ['scalar'],
                        componentType: ['float'],
                        size: 1,
                        description: 'A specular exponent.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 4,
                },
            },
        ],
    },
    {
        name: 'log',
        description: 'Returns the base-e logarithm of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'log10',
        description: 'Returns the base-10 logarithm of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log10'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'log2',
        description: 'Returns the base-2 logarithm of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-log2'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'mad',
        description: 'Performs an arithmetic multiply/add operation on three values.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/mad'],
        // TODO: numeric
    },
    {
        name: 'max',
        description: 'Selects the greater of x and y.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-max'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['same'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The y input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'min',
        description: 'Selects the lesser of x and y.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-min'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['same'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The y input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'modf',
        description: 'Splits the value x into fractional and integer parts, each of which has the same sign as x.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-modf'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value.',
                    },
                    {
                        modifiers: 'out',
                        name: 'ip',
                        templateType: ['same'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The integer portion of x.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'msad4',
        description:
            'Compares a 4-byte reference value and an 8-byte source value and accumulates a vector of 4 sums. Each sum corresponds to the masked sum of absolute differences of a different byte alignment between the reference value and the source value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-msad4'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'reference',
                        description: 'The reference array of 4 bytes in one uint value.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint2',
                        name: 'source',
                        description: 'The source array of 8 bytes in two uint2 values.',
                    },
                    {
                        modifiers: 'in',
                        type: 'uint4',
                        name: 'accum',
                        description:
                            'A vector of 4 values. msad4 adds this vector to the masked sum of absolute differences of the different byte alignments between the reference value and the source value.',
                    },
                ],
                returnType: 'uint4',
            },
        ],
    },
    {
        name: 'mul',
        description: 'Multiplies x and y using matrix math. The inner dimension x-columns and y-rows must be equal.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-mul'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar'],
                        componentType: ['float', 'int'],
                        size: 1,
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['scalar'],
                        componentType: ['same'],
                        size: 1,
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['same'],
                    size: 1,
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar'],
                        componentType: ['float', 'int'],
                        size: 1,
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar'],
                        componentType: ['float', 'int'],
                        size: 1,
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['matrix'],
                    componentType: ['same'],
                    size: 'same',
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['scalar'],
                        componentType: ['float', 'int'],
                        size: 1,
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'same',
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float', 'int'],
                    size: 1,
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'same', // TODO: same vs any
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['scalar'],
                        componentType: ['float', 'int'],
                        size: 1,
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['matrix'],
                    componentType: ['float', 'int'],
                    size: 'same',
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['vector'],
                        componentType: ['float', 'int'],
                        size: 'same', // TODO: same vs any
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float', 'int'],
                    size: 'same', // TODO: same vs any
                },
            },
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The x input value. If x is a vector, it treated as a row vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['matrix'],
                        componentType: ['float', 'int'],
                        size: 'same', // TODO: same vs any
                        description: 'The y input value. If y is a vector, it treated as a column vector.',
                    },
                ],
                returnType: {
                    templateType: ['matrix'],
                    componentType: ['float', 'int'],
                    size: 'same', // TODO: same vs any
                },
            },
        ],
    },
    {
        name: 'noise',
        description: 'Generates a random value using the Perlin-noise algorithm.',
        type: 'float',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-noise'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'A floating-point vector from which to generate Perlin noise.',
                    },
                ],
                returnType: {
                    templateType: ['scalar'],
                    componentType: ['float'],
                    size: 1,
                },
            },
        ],
    },
    {
        name: 'normalize',
        description: 'Normalizes the specified floating-point vector according to x / length(x).',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-normalize'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified floating-point vector.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'pow',
        description: 'Returns the specified value raised to the specified power.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-pow'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The specified power.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'printf',
        description: 'Submits a custom shader message to the information queue.',
        type: 'void',
        //TODO: varargs
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/printf'],
    },
    {
        name: 'Process2DQuadTessFactorsAvg',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsavg'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float2',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'Process2DQuadTessFactorsMax',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsmax'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float2',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'Process2DQuadTessFactorsMin',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/process2dquadtessfactorsmin'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float2',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessIsolineTessFactors',
        description: 'Generates the rounded tessellation factors for an isoline.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processisolinetessfactors'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'RawDetailFactor',
                        description: 'The desired detail factor.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'RawDensityFactor',
                        description: 'The desired density factor.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'RoundedDetailFactor',
                        description:
                            'The rounded detail factor clamped to a range that can be used by the tessellator.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'RoundedDensityFactor',
                        description:
                            'The rounded density factor clamped to a rangethat can be used by the tessellator.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessQuadTessFactorsAvg',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsavg'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessQuadTessFactorsMax',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsmax'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessQuadTessFactorsMin',
        description: 'Generates the corrected tessellation factors for a quad patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processquadtessfactorsmin'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float4',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float2',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessTriTessFactorsAvg',
        description: 'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsavg'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float3',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'RoundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage, and rounded.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'UnroundedInsideTessFactors',
                        description:
                            'The original, unrounded, UV tessellation factors computed by the tessellation stage.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessTriTessFactorsMax',
        description: 'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsmax'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float3',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'RoundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage, and rounded.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'UnroundedInsideTessFactors',
                        description:
                            'The original, unrounded, UV tessellation factors computed by the tessellation stage.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'ProcessTriTessFactorsMin',
        description: 'Generates the corrected tessellation factors for a tri patch.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/processtritessfactorsmin'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'float4',
                        name: 'RawEdgeFactors',
                        description: 'The edge tessellation factors, passed into the tessellator stage.',
                    },
                    {
                        modifiers: 'in',
                        type: 'float',
                        name: 'InsideScale',
                        description:
                            'The scale factor applied to the UV tessellation factors computed by the tessellation stage. The allowable range for InsideScale is 0.0 to 1.0.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float3',
                        name: 'RoundedEdgeTessFactors',
                        description: 'The rounded edge-tessellation factors calculated by the tessellator stage.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'RoundedInsideTessFactors',
                        description:
                            'The rounded tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                    {
                        modifiers: 'out',
                        type: 'float',
                        name: 'UnroundedInsideTessFactors',
                        description: 'The tessellation factors calculated by the tessellator stage for inside edges.',
                    },
                ],
                returnType: 'void',
            },
        ],
        available: ['hull'],
    },
    {
        name: 'radians',
        description: 'Converts the specified value from degrees to radians.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-radians'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'rcp',
        description: 'Calculates a fast, approximate, per-component reciprocal.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/rcp'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'double'],
                        size: 'any',
                        description: 'The input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float', 'double'],
                    size: 'same',
                },
            },
        ],
        available: ['vertex', 'hull', 'domain', 'geometry', 'pixel', 'compute'],
    },
    {
        name: 'reflect',
        description: 'Returns a reflection vector using an incident ray and a surface normal.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-reflect'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'i',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'A floating-point, incident vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'n',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'A floating-point, normal vector.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'refract',
        description: 'Returns a refraction vector using an entering ray, a surface normal, and a refraction index.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-refract'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'i',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'A floating-point, ray direction vector.',
                    },
                    {
                        modifiers: 'in',
                        name: 'n',
                        templateType: ['vector'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'A floating-point, surface normal vector.',
                    },
                    {
                        modifiers: 'in',
                        name: '?', // TODO: wtf
                        templateType: ['scalar'],
                        componentType: ['float'],
                        size: 1,
                        description: 'A floating-point, refraction index scalar.',
                    },
                ],
                returnType: {
                    templateType: ['vector'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'reversebits',
        description: 'Reverses the order of the bits, per component.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/reversebits'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        type: 'uint',
                        name: 'value',
                        description: 'The input value.',
                    },
                ],
                returnType: 'uint',
            },
        ],
    },
    {
        name: 'round',
        description:
            'Rounds the specified value to the nearest integer. Halfway cases are rounded to the nearest even.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-round'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'rsqrt',
        description: 'Returns the reciprocal of the square root of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-rsqrt'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'saturate',
        description: 'Clamps the specified value within the range of 0 to 1.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-saturate'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'sign',
        description: 'Returns the sign of x.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sign'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float', 'int'],
                        size: 'any',
                        description: 'The input value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['int'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'sin',
        description: 'Returns the sine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sin'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'sincos',
        description: 'Returns the sine and cosine of x.',
        type: 'void',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sincos'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                    {
                        modifiers: 'out',
                        name: 's',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'Returns the sine of x.',
                    },
                    {
                        modifiers: 'out',
                        name: 'c',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'Returns the cosine of x.',
                    },
                ],
                returnType: 'void',
            },
        ],
    },
    {
        name: 'sinh',
        description: 'Returns the hyperbolic sine of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sinh'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'smoothstep',
        description: 'Returns a smooth Hermite interpolation between 0 and 1, if x is in the range [min, max].',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-smoothstep'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'min',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The minimum range of the x parameter.',
                    },
                    {
                        modifiers: 'in',
                        name: 'max',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The maximum range of the x parameter.',
                    },
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The specified value to be interpolated.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'sqrt',
        description: 'Returns the square root of the specified floating-point value, per component.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-sqrt'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified floating-point value.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'step',
        description: 'Compares two values, returning 0 or 1 based on which value is greater.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-step'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'y',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The first floating-point value to compare.',
                    },
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['same'],
                        componentType: ['float'],
                        size: 'same',
                        description: 'The second floating-point value to compare.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'tan',
        description: 'Returns the tangent of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tan'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
        ],
    },
    {
        name: 'tanh',
        description: 'Returns the hyperbolic tangent of the specified value.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tanh'],
        overloads: [
            {
                parameters: [
                    {
                        modifiers: 'in',
                        name: 'x',
                        templateType: ['scalar', 'vector', 'matrix'],
                        componentType: ['float'],
                        size: 'any',
                        description: 'The specified value, in radians.',
                    },
                ],
                returnType: {
                    templateType: ['same'],
                    componentType: ['float'],
                    size: 'same',
                },
            },
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
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dbias'],
    },
    {
        name: 'tex1Dgrad',
        description: 'Samples a 1D texture using a gradient to select the mip level.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dgrad'],
    },
    {
        name: 'tex1Dlod',
        description: 'Samples a 1D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dlod'],
    },
    {
        name: 'tex1Dproj',
        description:
            'Samples a 1D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex1dproj'],
    },
    {
        name: 'tex2D',
        description: 'Samples a 2D texture.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2d'],
    },
    {
        name: 'tex2Dbias',
        description: 'Samples a 2D texture after biasing the mip level by t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dbias'],
    },
    {
        name: 'tex2Dgrad',
        description: 'Samples a 2D texture using a gradient to select the mip level.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dgrad'],
    },
    {
        name: 'tex2Dlod',
        description: 'Samples a 2D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dlod'],
    },
    {
        name: 'tex2Dproj',
        description:
            'Samples a 2D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex2dproj'],
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
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dbias'],
    },
    {
        name: 'tex3Dgrad',
        description: 'Samples a 3D texture using a gradient to select the mip level.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dgrad'],
    },
    {
        name: 'tex3Dlod',
        description: 'Samples a 3D texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dlod'],
    },
    {
        name: 'tex3Dproj',
        description:
            'Samples a 3D texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-tex3dproj'],
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
        description: 'Samples a cube texture after biasing the mip level by t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubebias'],
    },
    {
        name: 'texCUBEgrad',
        description: 'Samples a cube texture using a gradient to select the mip level.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubegrad'],
    },
    {
        name: 'texCUBElod',
        description: 'Samples a cube texture with mipmaps. The mipmap LOD is specified in t.w.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubelod'],
    },
    {
        name: 'texCUBEproj',
        description:
            'Samples a cube texture using a projective divide; the texture coordinate is divided by t.w before the lookup takes place.',
        type: 'float4',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-texcubeproj'],
    },
    {
        name: 'transpose',
        description: 'Transposes the specified input matrix.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-transpose'],
    },
    {
        name: 'trunc',
        description: 'Truncates a floating-point value to the integer component.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-trunc'],
    },
    // shader model 6
    {
        name: 'QuadReadAcrossDiagonal',
        description: 'Returns the specified local value which is read from the diagonally opposite lane in this quad.',
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadreadacrossdiagonal'],
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
        description: 'Returns the specified local value read from the other lane in this quad in the X direction.',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/quadswapx',
            'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html#quad-read-functions',
        ],
    },
    {
        name: 'QuadReadAcrossY',
        description: 'Returns the specified source value read from the other lane in this quad in the Y direction.',
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
        description: 'Returns true if the expression is true in all active lanes in the current wave.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavealltrue',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#bool-waveactivealltrue-bool-expr-',
        ],
    },
    {
        name: 'WaveActiveAnyTrue',
        description: 'Returns true if the expression is true in any of the active lanes in the current wave.',
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
        description: 'Returns the number of lanes in a wave on this architecture.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavegetlanecount',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-wavegetlanecount',
        ],
    },
    {
        name: 'WaveGetLaneIndex',
        description: 'Returns the index of the current lane within the current wave.',
        type: 'uint',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/wavegetlaneindex',
            'https://github.com/Microsoft/DirectXShaderCompiler/wiki/Wave-Intrinsics#uint-wavegetlaneindex',
        ],
    },
    {
        name: 'WaveIsFirstLane',
        description: 'Returns true only for the active lane in the current wave with the smallest index.',
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
        description: 'Returns the sum of all of the values in the active lanes with smaller indices than this one.',
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
        description: 'Returns the value of the expression for the given lane index within the specified wave.',
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
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavematch-function'],
    },
    {
        name: 'WaveMultiPrefixSum',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
    },

    {
        name: 'WaveMultiPrefixProduct',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
    },
    {
        name: 'WaveMultiPrefixCountBits',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
        type: 'uint',
    },
    {
        name: 'WaveMultiPrefixAnd',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
    },
    {
        name: 'WaveMultiPrefixOr',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
    },
    {
        name: 'WaveMultiPrefixXor',
        description:
            'WaveMultiPrefix*() is a set of functions which implement multi-prefix operations among the set of active lanes in the current wave.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_5.html#wavemultiprefix-functions'],
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
        description: 'Returns true if a given lane in a pixel shader is a helper lane.',
        type: 'bool',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_ShaderModel6_6.html#ishelperlane'],
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
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#setmeshoutputcounts'],
    },
    {
        name: 'DispatchMesh',
        description:
            'This function, called from the amplification shader, launches the threadgroups for the mesh shader.',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/MeshShader.html#dispatchmesh-intrinsic'],
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
        description: 'Returns true if <expr> is true in any lane of the current quad.',
        type: 'bool',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_QuadAny_QuadAll.html#quadall'],
    },
    {
        name: 'QuadAll',
        description: 'Returns true if <expr> is true in all lanes of the current quad.',
        type: 'bool',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_QuadAny_QuadAll.html#quadall'],
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
        links: ['https://learn.microsoft.com/en-us/windows/win32/direct3d12/primitiveindex'],
    },
    {
        name: 'ReportHit',
        description: 'Called by an intersection shader to report a ray intersection.',
        type: 'bool',
        links: [
            'https://learn.microsoft.com/en-us/windows/win32/direct3d12/reporthit-function',
            'https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#reporthit',
        ],
    },
    {
        name: 'TraceRay',
        description: 'Sends a ray into a search for hits in an acceleration structure.',
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
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#dispatchraysindex'],
    },
    {
        name: 'DispatchRaysDimensions',
        description:
            'The Width, Height and Depth values from the D3D12_DISPATCH_RAYS_DESC structure provided to the originating DispatchRays() call.',
        type: 'uint3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#dispatchraysdimensions'],
    },
    {
        name: 'WorldRayOrigin',
        description: 'The world-space origin for the current ray.',
        type: 'float3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldrayorigin'],
    },
    {
        name: 'WorldRayDirection',
        description: 'The world-space direction for the current ray.',
        type: 'float3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldraydirection'],
    },
    {
        name: 'RayTMin',
        description: 'This is a float representing the parametric starting point for the ray.',
        type: 'float',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytmin'],
    },
    {
        name: 'RayTCurrent',
        description: 'This is a float representing the current parametric ending point for the ray.',
        type: 'float',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#raytcurrent'],
    },
    {
        name: 'RayFlags',
        description: 'This is a uint containing the current ray flags (only).',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#rayflags'],
    },
    {
        name: 'InstanceIndex',
        description: 'The autogenerated index of the current instance in the top-level structure.',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#instanceindex'],
    },
    {
        name: 'InstanceID',
        description:
            'The user-provided InstanceID on the bottom-level acceleration structure instance within the top-level structure.',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#instanceid'],
    },
    {
        name: 'GeometryIndex',
        description: 'The autogenerated index of the current geometry in the bottom-level acceleration structure.',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#geometryindex'],
    },
    {
        name: 'PrimitiveIndex',
        description:
            'The autogenerated index of the primitive within the geometry inside the bottom-level acceleration structure instance.',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#primitiveindex'],
    },
    {
        name: 'ObjectRayOrigin',
        description: 'Object-space origin for the current ray.',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objectrayorigin'],
    },
    {
        name: 'ObjectRayDirection',
        description: 'Object-space direction for the current ray.',
        type: 'float3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objectraydirection'],
    },
    {
        name: 'ObjectToWorld3x4',
        description: 'Matrix for transforming from object-space to world-space.',
        type: 'float3x4',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objecttoworld3x4'],
    },
    {
        name: 'ObjectToWorld4x3',
        description: 'Matrix for transforming from object-space to world-space.',
        type: 'float4x3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#objecttoworld4x3'],
    },
    {
        name: 'WorldToObject3x4',
        description: 'Matrix for transforming from world-space to object-space.',
        type: 'float3x4',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldtoobject3x4'],
    },
    {
        name: 'WorldToObject4x3',
        description: 'Matrix for transforming from world-space to object-space.',
        type: 'float4x3',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#worldtoobject4x3'],
    },
    {
        name: 'HitKind',
        description: 'Returns the value passed as HitKind in ReportHit().',
        type: 'uint',
        links: ['https://microsoft.github.io/DirectX-Specs/d3d/Raytracing.html#hitkind'],
    },
];
