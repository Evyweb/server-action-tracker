import {Project} from "ts-morph";
import {ServerActionScanner} from "../src/ServerActionScanner";
import {ServerAction} from "../src/ServerAction";

describe('ServerActionScanner', () => {
    it('should list all files containing server actions', () => {
        // Arrange
        const project = new Project({useInMemoryFileSystem: true});
        project.createSourceFile('firstServerAction.ts', `
            "use server";
            export function firstServerAction() {
                console.log('firstServerAction');
            }
        `);
        project.createSourceFile('secondServerAction.ts', `       
            export function secondServerAction() {
                "use server";
                console.log('secondServerAction');
            }
        `);
        project.createSourceFile('notServerAction.ts', `
            export const notServerAction = () => {
                console.log('notServerAction');
            }
        `);
        project.createSourceFile('clientFunction.ts', `
            "use client";
            export const clientFunction = () => {
                console.log('clientFunction');
            }
        `);
        project.createSourceFile('emptyFile.ts', '');

        const scanner = new ServerActionScanner(project.getSourceFiles());

        // Act
        const result = scanner.getServerActions();

        // Assert
        expect(result).toEqual([
            new ServerAction('firstServerAction.ts', 'firstServerAction'),
            new ServerAction('secondServerAction.ts', 'secondServerAction')
        ]);
    });
});