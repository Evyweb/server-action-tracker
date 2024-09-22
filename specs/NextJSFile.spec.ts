import {Project} from "ts-morph";
import {NextJSFile} from "../src/NextJSFile";

describe('NextJSFile', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({useInMemoryFileSystem: true});
    });

    describe('When the file contains the "use server" directive at the top of the file', () => {
        it('should be a server action', () => {
            // Arrange
            const sourceFile = project.createSourceFile("serverAction.ts", `
                "use server";
                export const serverAction = () => {
                    console.log('server action');
                }
            `);

            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const result = nextJSFile.isServerAction();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('When the file does not contain the "use server" directive at the top of the file', () => {
        it('should not be a server action', () => {
            // Arrange
            const sourceFile = project.createSourceFile("notServerAction.ts", `
                export const notServerAction = () => {
                    console.log('not a server action');
                }
            `);

            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const result = nextJSFile.isServerAction();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('When the file has an other directive at the top of the file', () => {
        it('should not be a server action', () => {
            // Arrange
            const sourceFile = project.createSourceFile("notServerAction.ts", `
                "use client";
                export const notServerAction = () => {
                    console.log('not a server action');
                }
            `);

            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const result = nextJSFile.isServerAction();

            // Assert
            expect(result).toBe(false);
        });
    });
});