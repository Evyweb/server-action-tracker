import {SourceFile} from "ts-morph";
import {NextJSFile} from "./NextJSFile";

export class ServerActionScanner {

    private readonly sourceFiles: SourceFile[];

    constructor(sourceFiles: SourceFile[]) {
        this.sourceFiles = sourceFiles;
    }

    getServerActions(): string[] {
        return this.sourceFiles
            .map(sourceFile => new NextJSFile(sourceFile))
            .filter(nextJSFile => nextJSFile.isServerAction())
            .map(nextJSFile => nextJSFile.getFileName());
    }
}