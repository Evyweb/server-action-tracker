import {Project} from "ts-morph";
import {createFileWithUseServerOnTop} from "./factories/createFileWithUseServerOnTop";
import {createBasicFileWithFunction} from "./factories/createBasicFileWithFunction";
import {createClientFileWithFunction} from "./factories/createClientFileWithFunction";
import {ServerActionScanner} from "../src/ServerActionScanner";
import {createEmptyFile} from "./factories/createEmptyFile";

describe('ServerActionScanner', () => {
    it('should list all files containing server actions', () => {
        // Arrange
        const project = new Project({useInMemoryFileSystem: true});
        createFileWithUseServerOnTop(project, "firstServerAction");
        createFileWithUseServerOnTop(project, "secondServerAction");
        createBasicFileWithFunction(project, "notServerAction");
        createClientFileWithFunction(project, "clientFunction");
        createEmptyFile(project, "emptyFile");

        const scanner = new ServerActionScanner(project.getSourceFiles());

        // Act
        const result = scanner.getServerActions();

        // Assert
        expect(result).toEqual(["firstServerAction.ts", "secondServerAction.ts"]);
    });
});