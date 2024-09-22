import {SourceFile} from "ts-morph";
import {NextJSFile} from "./NextJSFile";
import {ServerAction} from "./ServerAction";

export class ServerActionScanner {

    private readonly sourceFiles: SourceFile[];

    constructor(sourceFiles: SourceFile[]) {
        this.sourceFiles = sourceFiles;
    }

    getServerActions(): ServerAction[] {
        return this.sourceFiles
            .map(sourceFile => new NextJSFile(sourceFile))
            .map(nextJSFile => nextJSFile.extractServerActions())
            .reduce((acc, serverActions) => acc.concat(serverActions), []);
    }
}