# How to build, and debug

## Desktop and web versions

This repository contains 2 versions of the language server: the desktop version can run in IDEs supporting the Language Server Protocol, the web version can run in https://github.dev or https://vscode.dev. The web version doesn't support document links, because in the browser, VS Code uses virtual workspaces and therefore the language server can't access directly files. For the desktop version, in production mode, platform-specific executables are generated (only on x64 architecture) to make it easier to create Node.js independent clients.

## Build

1. Download and install Node.js (<https://nodejs.org/en/download>)
2. Download and install git (<https://git-scm.com/downloads>)
3. Download and install OpenJDK (<https://learn.microsoft.com/en-us/java/openjdk/download>)
4. Open cmd
5. Clone the repository

    ```
    git clone https://github.com/Gaijin-Games-KFT/Dagor-Shader-Language-Server.git
    ```

6. Go inside the repository's root folder

    ```
    cd Dagor-Shader-Language-Server
    ```

7. Install dependencies

    ```
    npm install
    ```

8. Generate code with ANTLR

    ```
    npm run generate-antlr
    ```

    You have to generate code again, every time you change ANTLR grammars in the **grammar/antlr** folder.

9. Build the code

    ```
    npm run build
    ```

    or

    ```
    npm run build-production
    ```

## Debug

### TypeScript code

-   If you want to write something to the console, use `log`, ˛`logInfo`, `logWarning`, or `logError` (actually, if you run the server from Visual Studio Code, `console.log` will work, however, in Visual Studio, `console.log` will break the extension).
-   If you want to use breakpoints, you have to configure the client properly. For more informations see the [Visual Studio Code client's build instructions](https://github.com/Gaijin-Games-KFT/Dagor-Shader-Language-Support-for-Visual-Studio-Code/blob/main/BUILD.md).

### TextMate grammar

-   If you want to know which TextMate rule matched at the cursor, press F1, and select **Developer: Inspect Editor Tokens and Scopes**.
-   If you want to read the steps of the TextMate matching, press F1, and select **Developer: Start Text Mate Syntax Grammar Logging**.

## Scripts

-   **build-production**: Builds both the desktop and the web versions of the server in production mode. It also generates platform-specific executables from them.
-   **build**: Builds both the server in development mode.
-   **watch**: Same as **build**, but it rebuilds the code as you change (and save) a file.
-   **generate-antlr**: Generates the ANTLR lexer's and parser's code. It's required to run it before building, if you changed the ANTLR grammars (or if you haven't ever generated code).
-   **eslint**: Runs ESLint and lists the possible problems in the code. It has to be succesful to be able to merge a pull request.
-   **prettier-lint**: Prettier checks if all files are formatted correctly. It has to be succesful to be able to merge a pull request.
-   **prettier-format**: Prettier formats all files. Usually not necesary to use it, because files are automatically formatted before commiting.
-   **prepare**: Automatically runs when you install dependencies to register the formatting pre-commit hook.
