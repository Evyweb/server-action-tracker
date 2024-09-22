import {Project} from "ts-morph";
import {NextJSFile} from "../src/NextJSFile";
import {describe} from "vitest";
import {ServerAction} from "../src/ServerAction";

describe('NextJSFile', () => {
    let project: Project;

    const NO_CONTENT = '';

    beforeEach(() => {
        project = new Project({useInMemoryFileSystem: true});
    });

    describe('When the file contains the "use server" directive at the top of the file', () => {
        it('should add all exported functions to the list of server actions', () => {
            // Arrange
            const sourceFile = project.createSourceFile('serverAction.ts', `
                "use server";
                export async function serverAction1() {
                    console.log('serverAction1');
                }
                
                export function serverAction2() {
                    console.log('serverAction2');
                }
            `);

            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const serverActions = nextJSFile.extractServerActions();

            // Assert
            expect(serverActions).toEqual([
                new ServerAction("serverAction.ts", "serverAction1"),
                new ServerAction("serverAction.ts", "serverAction2")
            ]);
        });
    });

    describe('When the file does not contain the "use server" directive at the top of the file', () => {
        describe('When exported functions inside the file has the "use server" directive', () => {
            it('should add the functions to the list of server actions', () => {
                // Arrange
                const sourceFile = project.createSourceFile('serverAction.ts', `       
                    export function serverAction1() {
                        "use server";
                        console.log('serverAction1');
                    }
             
                    export async function serverAction2() {
                        "use server";
                        console.log('serverAction2');
                    }
                `);
                const nextJSFile = new NextJSFile(sourceFile);

                // Act
                const serverActions = nextJSFile.extractServerActions();

                // Assert
                expect(serverActions).toEqual([
                    new ServerAction("serverAction.ts", "serverAction1"),
                    new ServerAction("serverAction.ts", "serverAction2")
                ]);
            });
        });

        describe('When no exported function inside the file have the "use server" directive', () => {
            it('should not add the function to the list of server actions', () => {
                // Arrange
                const sourceFile = project.createSourceFile('notServerAction.ts', `
                    export function notServerAction() {
                        console.log('notServerAction');
                    }
                `);
                const nextJSFile = new NextJSFile(sourceFile);

                // Act
                const serverActions = nextJSFile.extractServerActions();

                // Assert
                expect(serverActions).toHaveLength(0);
            });
        });
    });

    describe('When the file has an other directive at the top of the file', () => {
        it('should not add the function to the list of server actions', () => {
            // Arrange
            const sourceFile = project.createSourceFile('notServerAction.ts', `
                "use client";
                export function notServerAction() {
                    console.log('notServerAction');
                }
            `);
            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const serverActions = nextJSFile.extractServerActions();

            // Assert
            expect(serverActions).toHaveLength(0);
        });
    });

    describe('When the file is empty', () => {
        it('should not add anything to the list of server actions', () => {
            // Arrange
            const sourceFile = project.createSourceFile('emptyFile.ts', NO_CONTENT);
            const nextJSFile = new NextJSFile(sourceFile);

            // Act
            const serverActions = nextJSFile.extractServerActions();

            // Assert
            expect(serverActions).toHaveLength(0);
        });
    });
});