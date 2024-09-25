import path from "path";
import fs from "fs";

export function getFilesFromPackageJson(): string[] {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        return packageJson.nextServerActionScan?.files || [
            "app/**/*.ts",
            "src/**/*.ts",
            "packages/**/*.ts",
            "!**/*.spec.ts",
            "!**/specs/**/*.ts",
        ];
    }

    throw new Error("No package.json found or no file to include defined in nextServerActionScan options.");
}