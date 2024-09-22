import {SourceFile} from "ts-morph";
import {extractServerActions} from "./extractServerActions";
import {ServerAction} from "./types";

export function getServerActionsFromSourceFiles(sourceFiles: SourceFile[]): ServerAction[] {
    return sourceFiles.map(extractServerActions).flat();
}