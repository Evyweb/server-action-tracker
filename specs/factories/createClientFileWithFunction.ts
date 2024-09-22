import {Project} from "ts-morph";

export function createClientFileWithFunction(project: Project, name: string) {
    return project.createSourceFile(`${name}.ts`, `
        "use client";
        export const ${name} = () => {
            console.log('${name}');
        }
    `);
}