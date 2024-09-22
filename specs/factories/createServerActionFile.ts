import {Project} from "ts-morph";

export function createServerActionFile(project: Project, name: string) {
    return project.createSourceFile(`${name}.ts`, `
        "use server";
        export const ${name} = () => {
            console.log('${name}');
        }
    `);
}