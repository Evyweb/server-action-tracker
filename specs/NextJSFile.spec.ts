import {Project} from "ts-morph";
import {NextJSFile} from "../src/NextJSFile";
import {createServerActionFile} from "./factories/createServerActionFile";
import {createBasicFileWithFunction} from "./factories/createBasicFileWithFunction";
import {createClientFileWithFunction} from "./factories/createClientFileWithFunction";
import {createEmptyFile} from "./factories/createEmptyFile";

describe('NextJSFile', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({useInMemoryFileSystem: true});
    });

    describe('When the file contains the "use server" directive at the top of the file', () => {
        it('should be a server action', () => {
            const sourceFile = createServerActionFile(project, "serverAction");
            expectFileToBeServerAction(sourceFile.getFilePath());
        });
    });

    describe('When the file does not contain the "use server" directive at the top of the file', () => {
        it('should not be a server action', () => {
            const sourceFile = createBasicFileWithFunction(project, "notServerAction");
            expectFileNotToBeServerAction(sourceFile.getFilePath());
        });
    });

    describe('When the file has an other directive at the top of the file', () => {
        it('should not be a server action', () => {
            const sourceFile = createClientFileWithFunction(project, "notServerAction");
            expectFileNotToBeServerAction(sourceFile.getFilePath());
        });
    });

    describe('When the file is empty', () => {
        it('should not be a server action', () => {
            const sourceFile = createEmptyFile(project, "emptyFile");
            expectFileNotToBeServerAction(sourceFile.getFilePath());
        });
    });

    function expectFileToBeServerAction(fileName: string) {
        const sourceFile = project.getSourceFileOrThrow(fileName);
        const nextJSFile = new NextJSFile(sourceFile);
        expect(nextJSFile.isServerAction()).toBe(true);
    }

    function expectFileNotToBeServerAction(fileName: string) {
        const sourceFile = project.getSourceFileOrThrow(fileName);
        const nextJSFile = new NextJSFile(sourceFile);
        expect(nextJSFile.isServerAction()).toBe(false);
    }
});