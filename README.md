# Dagor Shader Language Server

[![build](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Server/actions/workflows/build.yml/badge.svg)](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Server/actions/workflows/build.yml)

Language Server for the Dagor Shader Language. At the moment it's work in progress. There is a [Visual Studio Code client](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Support-for-Visual-Studio-Code), and a [Visual Studio client](https://github.com/GaijinEntertainment/Dagor-Shader-Language-Support-for-Visual-Studio). In order to use the language server, you have to install Node.js if you're not on x64 architecture.

## Features

-   Diagnostics (at the moment, the compiler only runs when the user saves the document)
-   Formatting (whole document, range, ranges)
-   Folding ranges (for blocks and DSHL macros)

### DSHL

|                      | types | variables | functions | shaders | block statements | macros | includes | keywords, modifiers |
| -------------------- | ----- | --------- | --------- | ------- | ---------------- | ------ | -------- | ------------------- |
| Code completion      | ✓     | ✓         | ✓         | ✓       | ✓                | ✓      | ✓        | ✓                   |
| Go to definition     |       | ✓         |           | ✓       | ✓                | ✓      | ✓        |                     |
| Go to declaration    |       | ✓         |           | ✓       | ✓                | ✓      | ✓        |                     |
| Go to implementation |       |           |           | ✓       | ✓                | ✓      | ✓        |                     |
| Hover                |       | ✓         | ✓         | ✓       | ✓                | ✓      |          |                     |
| Document highlights  |       | ✓         | ✓         | ✓       | ✓                | ✓      |          |                     |
| Signature help       |       |           | ✓         |         |                  | ✓      |          |                     |
| Inlay hints          |       |           | ✓         |         |                  | ✓      |          |                     |
| Document symbols     |       | ✓         |           | ✓       | ✓                | ✓      |          |                     |
| Semantic highlight   |       | ✓         |           |         |                  |        |          |                     |
| References           |       | ✓         | ✓         | ✓       | ✓                | ✓      |          |                     |
| Rename               |       | ✓         | ✓         | ✓       | ✓                | ✓      |          |                     |

### HLSL

|                       | types | variables | functions | defines | includes | keywords, modifiers, semantics, attributes, preprocessor directives |
| --------------------- | ----- | --------- | --------- | ------- | -------- | ------------------------------------------------------------------- |
| Code completion       | ✓     | ✓         | ✓         | ✓       | ✓        | ✓                                                                   |
| Go to definition      | ✓     | ✓         | ✓         | ✓       | ✓        |                                                                     |
| Go to declaration     | ✓     | ✓         | ✓         | ✓       | ✓        |                                                                     |
| Go to implementation  | ✓     |           | ✓         | ✓       | ✓        |                                                                     |
| Go to type definition |       | ✓         |           |         |          |                                                                     |
| Hover                 | ✓     | ✓         | ✓         | ✓       |          |                                                                     |
| Document highlights   | ✓     | ✓         | ✓         | ✓       |          |                                                                     |
| Signature help        |       |           | ✓         |         |          |                                                                     |
| Inlay hints           |       |           | ✓         | ✓       |          |                                                                     |
| Document symbols      | ✓     | ✓         | ✓         | ✓       |          |                                                                     |
| Type hierarchy        | ✓     |           |           |         |          |                                                                     |
| Semantic highlight    | ✓     | ✓         |           |         |          |                                                                     |
| Rename                | ✓     | ✓         | ✓         | ✓       |          |                                                                     |

### Features that are part of the repository, but not part of the actual language server

-   Syntax highlight
-   Code snippets
-   Comment toggling
-   Bracket matching
-   Auto closing pairs
-   Surrounding pairs
-   Folding regions
-   Indentation

## Issues

If you have any problems or feature request for the language server, feel free to create an issue.
