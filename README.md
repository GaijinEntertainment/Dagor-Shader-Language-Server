# Dagor Shader Language Server

[![build](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Server/actions/workflows/build.yml/badge.svg)](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Server/actions/workflows/build.yml)

Language Server for the Dagor Shader Language. At the moment it's work in progress. There is a [Visual Studio Code client](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Support-for-Visual-Studio-Code), and a [Visual Studio client](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Support-for-Visual-Studio). In order to use the language server, you have to install Node.js if you're not on x64 architecture.

## Features

-   Syntax highlight (not part of the actual language server)
-   Code completion (types, variables, functions, constructors, keywords, modifiers, semantics, attributes, shaders, block statements, preprocessor directives, code snippets, DSHL macros, and HLSL defines)
-   Diagnostics (at the moment, the compiler only runs when the user saves the document)
-   Go to / Peek definition (DSHL variables, functions, shaders, block statements, macros, HLSL defines, DSHL includes, and HLSL includes)
-   Go to / Peek declaration (DSHL variables, functions, shaders, block statements, macros, HLSL defines, DSHL includes, and HLSL includes)
-   Go to / Peek implementation (DSHL functions, shaders, block statements, macros, HLSL defines, DSHL includes, and HLSL includes)
-   Hover (DSHL variables, functions, shaders, block statements, macros, HLSL defines)
-   Document highlights (DSHL variables, functions, shaders, block statements, macros, HLSL defines)
-   Signature help (DSHL functions, DSHL macros)
-   Inlay hints (DSHL functions, DSHL macro, HLSL defines)
-   Document symbols (DSHL variables, shaders, block statements, macros, HLSL defines)
-   Code formatting (document, range, ranges)
-   Folding ranges (except scopes without blocks)
-   Comment toggling (not part of the actual language server)
-   Bracket matching (not part of the actual language server)
-   Auto closing pairs (not part of the actual language server)
-   Surrounding pairs (not part of the actual language server)
-   Folding regions (not part of the actual language server)
-   Indentation (not part of the actual language server)

## Issues

If you have any problems or feature request for the language server, feel free to create an issue.
