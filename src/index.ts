#!/usr/bin/env node
import {Project} from "ts-morph";
import * as path from "path";

import {extractServerActions} from "./extractServerActions";
import {getFilesFromPackageJson} from "./utils";

const filesToScan = getFilesFromPackageJson();
const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(filesToScan);

const serverActions = project.getSourceFiles().map(extractServerActions).flat();

console.log("Server actions found:");
console.table(serverActions);
