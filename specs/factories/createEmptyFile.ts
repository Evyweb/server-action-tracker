import {Project} from "ts-morph";

export function createEmptyFile(project: Project, name: string) {
    return project.createSourceFile(`${name}.ts`, '');
}