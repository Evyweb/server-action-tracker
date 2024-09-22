import {Project} from "ts-morph";

export function createBasicFileWithFunction(project: Project, name: string) {
    return project.createSourceFile(`${name}.ts`, `
        export const ${name} = () => {
            console.log('${name}');
        }
    `);
}