# How to build, and debug

## Desktop and web versions

This repository contains 2 versions of the language server: the desktop version can run in IDEs supporting the Language Server Protocol, the web version can run in https://github.dev or https://vscode.dev. At the moment the desktop and the web versions have exactly the same features, but in the future, there will be differences (for example the web version won't be able to run the compiler).

## Build

1. Download and install Node.js (<https://nodejs.org/en/download>)
2. Download and install git (<https://git-scm.com/downloads>)
3. Open cmd
4. Clone the repository

    ```
    git clone https://github.com/Gaijin-Games-KFT/Dagor-Shader-Language-Server.git
    ```

5. Go inside the repository's root folder

    ```
    cd Dagor-Shader-Language-Server
    ```

6. Install dependencies

    ```
    npm install
    ```

7. Open the client's folder in Visual Studio Code

    ```
    code .
    ```

    When Visual Studio Code opens, it'll suggest you to install the recommanded extensions. They're all useful, but none of them is required.

8. Build the code

    ```
    npm run build
    ```

## Debug

### TypeScript code

-   If you want to write something to the console, use `log`, ˛`logInfo`, `logWarning`, or `logError` (actually, if you run the server from Visual Studio Code, `console.log` will work, however, in Visual Studio, `console.log` will break the extension).
-   If you want to use breakpoints, you have to configure the client properly. For more informations see the [Visual Studio Code client's build instructions](https://github.com/Gaijin-Games-KFT/Dagor-Shader-Language-Support-for-Visual-Studio-Code/blob/main/BUILD.md).

### TextMate grammar

-   If you want to know which TextMate rule matched at the cursor, press F1, and select **Developer: Inspect Editor Tokens and Scopes**.
-   If you want to read the steps of the TextMate matching, press F1, and select **Developer: Start Text Mate Syntax Grammar Logging**.

## Scripts

-   **build-production**: Builds both desktop and the web versions of the server in production mode.
-   **build**: Builds both the server in development mode.
-   **watch**: Same as **build**, but it rebuilds the code as you change (and save) a file.
-   **eslint**: Runs ESLint and lists the possible problems in the code. It has to be succesful to be able to merge a pull request.
-   **prettier-lint**: Prettier checks if all files are formatted correctly. It has to be succesful to be able to merge a pull request.
-   **prettier-format**: Prettier formats all files. Usually not necesary to use it, because files are automatically formatted before commiting.
-   **prepare**: Automatically runs when you install dependencies to register the formatting pre-commit hook.
