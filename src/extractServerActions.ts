import {
    ArrowFunction,
    FunctionDeclaration,
    FunctionExpression,
    Node,
    SourceFile,
    Statement,
    SyntaxKind,
} from "ts-morph";
import {ServerAction} from "./types";

export function extractServerActions(sourceFile: SourceFile): ServerAction[] {
    if (isEmptyFile(sourceFile)) {
        return [];
    }

    const fileName = sourceFile.getFilePath();

    const functionNames = hasUseServerDirectiveOnTopOfFile(sourceFile)
        ? getExportedFunctionNames(sourceFile)
        : getFunctionNamesContainingUseServerDirective(sourceFile);

    return createServerActions(fileName, functionNames);
}

function isEmptyFile(sourceFile: SourceFile): boolean {
    const statements = sourceFile.getStatements();
    return statements.length === 0;
}

function hasUseServerDirectiveOnTopOfFile(sourceFile: SourceFile): boolean {
    const statements = sourceFile.getStatements();
    return statements.some(isUseServerDirectiveStatement);
}

function isUseServerDirectiveStatement(statement: Statement): boolean {
    if (!Node.isExpressionStatement(statement)) {
        return false;
    }

    const expression = statement.getExpression();
    return Node.isStringLiteral(expression) && expression.getLiteralText() === 'use server';
}

function getExportedFunctionNames(sourceFile: SourceFile): string[] {
    return sourceFile.getExportSymbols()
        .flatMap(symbol => symbol.getDeclarations())
        .map(getFunctionName)
        .filter((name): name is string => name !== undefined);
}

function getFunctionName(node: Node): string | undefined {
    if (Node.isFunctionDeclaration(node)) {
        return node.getName();
    }

    if (Node.isVariableDeclaration(node)) {
        const initializer = node.getInitializer();
        if (initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer) || Node.isCallExpression(initializer))) {
            return node.getName();
        }
    }

    return undefined;
}

function getFunctionNamesContainingUseServerDirective(sourceFile: SourceFile): string[] {
    return sourceFile.getDescendants()
        .map(getFunctionNameIfContainsDirective)
        .filter((name): name is string => name !== undefined);
}

function getFunctionNameIfContainsDirective(node: Node): string | undefined {
    if (Node.isFunctionDeclaration(node) && hasUseServerDirectiveInBody(node)) {
        return node.getName();
    }

    if (Node.isVariableDeclaration(node)) {
        const initializer = node.getInitializer();
        if (
            initializer &&
            (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) &&
            hasUseServerDirectiveInBody(initializer)
        ) {
            return node.getName();
        }
    }

    return undefined;
}

function hasUseServerDirectiveInBody(
    functionNode: FunctionDeclaration | ArrowFunction | FunctionExpression
): boolean {
    const body = functionNode.getBody();

    if (!body || !body.isKind(SyntaxKind.Block)) {
        return false;
    }

    const bodyBlock = body.asKind(SyntaxKind.Block)!;
    const statements = bodyBlock.getStatements();

    return statements.some(isUseServerDirectiveStatement);
}

function createServerActions(fileName: string, functionNames: string[]): ServerAction[] {
    return functionNames.map(functionName => ({ fileName, functionName }));
}
