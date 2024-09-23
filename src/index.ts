#!/usr/bin/env node
import { Project } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

import {getServerActionsFromSourceFiles} from "./getServerActionsFromSourceFiles";

function getGlobsFromPackageJson(): string[] {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        return packageJson.nextServerActionScan?.files || [];
    }

    throw new Error("No package.json found or no file to include defined in nextServerActionScan options.");
}

const filesToScan = getGlobsFromPackageJson();
const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(filesToScan);

const serverActions = getServerActionsFromSourceFiles(project.getSourceFiles());

console.log("Server actions found:");
console.table(serverActions);
