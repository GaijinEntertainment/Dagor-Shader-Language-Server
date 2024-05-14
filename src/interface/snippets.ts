import { LanguageElementInfo } from './language-element-info';

export const hlslSnippets: LanguageElementInfo[] = [
    {
        name: '#include',
        sortName: 'include',
        filterText: 'include',
        insertText: '#include "${1:file_name.hlsl}"',
        isSnippet: true,
    },
    {
        name: '#define',
        sortName: 'define',
        filterText: 'define',
        insertText: '#define ${1:MACRO_NAME} ${2:1}',
        isSnippet: true,
    },
    {
        name: '#define',
        sortName: 'define',
        filterText: 'define',
        insertText: '#define ${1:MACRO_NAME}(${2}) ${3:1}',
        isSnippet: true,
    },
    {
        name: '#if',
        sortName: 'if',
        filterText: 'if',
        insertText: '#if ${1:true}\n\t$0\n#endif',
        isSnippet: true,
    },
    {
        name: '#ifdef',
        sortName: 'ifdef',
        filterText: 'ifdef',
        insertText: '#ifdef ${1:MACRO_NAME}\n\t$0\n#endif',
        isSnippet: true,
    },
    {
        name: '#ifndef',
        sortName: 'ifndef',
        filterText: 'ifndef',
        insertText: '#ifndef ${1:MACRO_NAME}\n\t$0\n#endif',
        isSnippet: true,
    },
    {
        name: '##if',
        sortName: 'if',
        filterText: 'if',
        insertText: '##if ${1:true}\n\t$0\n##endif',
        isSnippet: true,
    },
    {
        name: 'numthreads',
        insertText: '[numthreads(${1:1}, ${2:1}, ${3:1})]',
        isSnippet: true,
    },
    {
        name: 'function',
        insertText: '${1:void} ${2:function_name}($3){\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'variable declaration',
        insertText: '${1:float} ${2:value};',
        isSnippet: true,
    },
    {
        name: 'for',
        insertText: 'for(${1:int} ${2:i} = ${3:0}; ${2:i} < ${4:16}; ${2:i}++) {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'while',
        insertText: 'while(${1:true}) {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'do-while',
        insertText: 'do {\n\t$0\n} while(${1:true});',
        isSnippet: true,
    },
    {
        name: 'if',
        insertText: 'if(${1:true}) {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'switch-case',
        insertText: 'switch(${1:name}) {\n\tcase ${2:1}: $3\n\tcase ${4:2}: $5\n\tdefault: $6\n}',
        isSnippet: true,
    },
    {
        name: 'struct',
        insertText: 'struct ${1:TypeName} {\n\t${2:float} ${3:variableName};$0\n};',
        isSnippet: true,
    },
];

export const dshlSnippets: LanguageElementInfo[] = [
    {
        name: 'include',
        insertText: 'include "${1:file_name.dshl}"',
        isSnippet: true,
        description:
            'Includes in `*.dshl` files are always included one time, and should not be confused with `#include` directive in hlsl files and blocks, where they follow the regular preprocessor rules (and can be included multiple times).',
    },
    {
        name: 'macro',
        insertText: 'macro ${1:${TM_FILENAME_BASE/(.*)/${1:/upcase}/}}($2)\n\t$0\nendmacro',
        isSnippet: true,
    },
    {
        name: 'define_macro_if_not_defined',
        insertText: 'define_macro_if_not_defined ${1:${TM_FILENAME_BASE/(.*)/${1:/upcase}/}}($2)\n\t$0\nendmacro',
        isSnippet: true,
    },
    {
        name: 'interval',
        insertText: 'interval ${1:variable_name}: ${2:lower_value} < ${3:1}, ${4:upper_value};',
        isSnippet: true,
        description:
            'Intervals are a way to generate multiple variants of a single `shader`, based on whether the value of a special variable falls into specific range.',
    },
    {
        name: 'variable declaration with interval',
        insertText:
            '${1:int} ${2:variable_name} = ${3:0};\ninterval ${2}: ${4:lower_value} < ${5:1}, ${6:upper_value};',
        isSnippet: true,
        description:
            'Intervals are a way to generate multiple variants of a single `shader`, based on whether the value of a special variable falls into specific range.',
    },
    {
        name: 'hlsl block',
        insertText: 'hlsl {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'hlsl block for a shader stage',
        insertText: 'hlsl(${1|cs,vs,hs,ds,gs,ps|}) {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'block',
        insertText: 'block(${1|scene,frame,global_const,object|}) {\n\t$0\n}',
        isSnippet: true,
        description:
            'Shader Blocks are an extension of the Preshader idea and define variables/constants which are common for multiple shaders that `support` them. The intent is to optimize constant/texture switching.',
    },
    {
        name: 'shader',
        insertText: 'shader ${1:$TM_FILENAME_BASE} {\n\t$0\n}',
        isSnippet: true,
    },
    {
        name: 'preshader',
        insertText:
            '(${1|cs,vs,ps|}) {\n\t${2:variable_name}@${3|f1,f2,f3,f4,f44,i1,i2,i3,i4,tex,tex2d,tex3d,texArray,texCube,texCubeArray,smp2d,smp3d,smpArray,smpCube,smpCubeArray,static,staticCube,staticTexArray,shd,buf,cbuf,uav|} = ${4:other_variable_name};$0\n}',
        isSnippet: true,
        description:
            'In addition to declaring just the shader code itself, DSHL allows you to declare a pre-shader, which is a simple script that allows you to easily pipe data from C++ to the shader.',
    },
    {
        name: 'blend',
        insertText:
            '${1|blend_asrc,blend_adst,blend_src,blend_dst|} = ${2|zero,one,sc,isc,sa,isa,da,ida,dc,idc,sasat,bf,ibf|};',
        isSnippet: true,
    },
    {
        name: 'cull mode',
        insertText: 'cull_mode = ${1|ccw,cw,none|};',
        isSnippet: true,
    },
    {
        name: 'depth-stencil func',
        insertText:
            '${1|z_func,stencil_func|} = ${2|never,less,equal,lessequal,greater,notequal,greaterequal,always|};',
        isSnippet: true,
    },
    {
        name: 'stencil',
        insertText:
            '${1|stencil_pass,stencil_fail,stencil_zfail|} = ${2|keep,zero,replace,incrsat,decrsat,incr,dect|};',
        isSnippet: true,
    },
    {
        name: 'cbuf',
        insertText:
            '${1:name}@cbuf = ${2:name} hlsl {\n\tcbuffer ${1}@cbuf {\n\t\t${4:float4} ${5:name}[${6:1024}];$0\n\t};\n}',
        isSnippet: true,
    },
    {
        name: 'compile',
        insertText:
            'compile("${1|target_cs,target_vs,target_vs_half,target_vs_for_tess,target_vs_for_gs,target_hs,target_ds,target_gs,target_ps,target_ps_half,target_ms|}", "${2:main}");',
        isSnippet: true,
    },
    {
        name: 'assume',
        insertText: 'assume ${1:name} = ${2:value};',
        isSnippet: true,
        description:
            'Shader variables can be assigned a fixed value when the shader is compiled via `assume`. Such shader vars may not be changed at runtime, their values will be constant in the binary. This allows to reduce number of shader variants or disable specific features for specific platforms.',
    },
    {
        name: 'supports',
        insertText: 'supports ${1:value};',
        isSnippet: true,
    },
];
