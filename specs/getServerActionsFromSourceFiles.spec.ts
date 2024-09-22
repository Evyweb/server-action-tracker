import {Project} from "ts-morph";
import {getServerActionsFromSourceFiles} from "../src/getServerActionsFromSourceFiles";

describe('getServerActionsFromSourceFiles', () => {
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
        project.createSourceFile('thirdServerAction.tsx', `
            "use client";
            const thirdServerAction = () => {
                "use server";
                console.log('thirdServerAction');
            }
        `);
        project.createSourceFile('emptyFile.ts', '');

        // Act
        const result = getServerActionsFromSourceFiles(project.getSourceFiles());

        // Assert
        expect(result).toEqual([
            {fileName: 'firstServerAction.ts', functionName: 'firstServerAction'},
            {fileName: 'secondServerAction.ts', functionName: 'secondServerAction'},
            {fileName: 'thirdServerAction.tsx', functionName: 'thirdServerAction'},
        ]);
    });
});