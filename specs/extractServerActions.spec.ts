import {Project} from "ts-morph";
import {describe} from "vitest";
import {extractServerActions} from "../src/extractServerActions";

describe('extractServerActions', () => {
    let project: Project;

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
                
                export const serverAction2 = () => {
                    console.log('serverAction2');
                }
                
                export const serverAction3 = () => console.log('serverAction3');
                
                export const test = 'nothing';
            `);

            // Act
            const serverActions = extractServerActions(sourceFile);

            // Assert
            expect(serverActions).toEqual([
                {fileName: 'serverAction.ts', functionName: 'serverAction1'},
                {fileName: 'serverAction.ts', functionName: 'serverAction2'},
                {fileName: 'serverAction.ts', functionName: 'serverAction3'},
            ]);
        });
    });

    describe('When the file does not contain the "use server" directive at the top of the file', () => {
        describe('When functions inside the file has the "use server" directive', () => {
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
                    
                    export function AnyFunction() {
                        const serverAction3 = () => {
                            "use server";
                            console.log('serverAction3');
                        }
                    }
                    
                    export const nothing = () => {};
                `);

                // Act
                const serverActions = extractServerActions(sourceFile);

                // Assert
                expect(serverActions).toEqual([
                    {fileName: 'serverAction.ts', functionName: 'serverAction1'},
                    {fileName: 'serverAction.ts', functionName: 'serverAction2'},
                    {fileName: 'serverAction.ts', functionName: 'serverAction3'},
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

                // Act
                const serverActions = extractServerActions(sourceFile);

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

            // Act
            const serverActions = extractServerActions(sourceFile);

            // Assert
            expect(serverActions).toHaveLength(0);
        });
    });

    describe('When the file is empty', () => {
        it('should not add anything to the list of server actions', () => {
            // Arrange
            const sourceFile = project.createSourceFile('emptyFile.ts', '');

            // Act
            const serverActions = extractServerActions(sourceFile);

            // Assert
            expect(serverActions).toHaveLength(0);
        });
    });
});