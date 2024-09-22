import {FunctionDeclaration, Node, SourceFile, Statement, SyntaxKind} from "ts-morph";
import {ServerAction} from "./ServerAction";

export class NextJSFile {

    private readonly USE_SERVER_DIRECTIVE = 'use server';

    private readonly sourceFile: SourceFile;
    private readonly statements: Statement[];

    constructor(sourceFile: SourceFile) {
        this.sourceFile = sourceFile;
        this.statements = this.sourceFile.getStatements();
    }

    extractServerActions(): ServerAction[] {
        const serverActions: ServerAction[] = [];
        if (this.isNotEmptyFile()) {
            if (this.hasUseServerDirectiveOnTopOfFile()) {
                const exportedFunctions = this.getExportedFunctions();
                exportedFunctions.forEach((functionName) => {
                    const serverAction = new ServerAction(this.getFileName(), functionName);
                    serverActions.push(serverAction);
                });
            } else {
                const exportedFunctionsWithUseServerInBody = this.getExportedFunctionsWithUseServerInBody();
                exportedFunctionsWithUseServerInBody.forEach((functionName) => {
                    const serverAction = new ServerAction(this.getFileName(), functionName);
                    serverActions.push(serverAction);
                });
            }
        }
        return serverActions;
    }

    private getFileName() {
        return this.sourceFile.getBaseName();
    }

    private isNotEmptyFile() {
        return this.statements.length > 0;
    }

    private hasUseServerDirectiveOnTopOfFile() {
        const firstStatement = this.statements[0];
        if (firstStatement.isKind(SyntaxKind.ExpressionStatement)) {
            const expression = firstStatement.getExpression();

            if (expression.isKind(SyntaxKind.StringLiteral)) {
                const literalValue = expression.getLiteralText();
                if (this.isUseServerDirective(literalValue)) {
                    return true;
                }
            }
        }
        return false;
    }

    private isUseServerDirective(literalValue: string): boolean {
        return literalValue === this.USE_SERVER_DIRECTIVE;
    }

    private getExportedFunctions(): string[] {
        const functionNames: string[] = [];

        this.sourceFile.getExportSymbols().forEach((symbol) => {
            symbol.getDeclarations().forEach((declaration) => {
                if (declaration.isKind(SyntaxKind.FunctionDeclaration)) {
                    const functionName = declaration.getName();
                    if (functionName) {
                        functionNames.push(functionName);
                    }
                }
            });
        });

        return functionNames;
    }

    private getExportedFunctionsWithUseServerInBody(): string[] {
        const functionNames: string[] = [];

        this.sourceFile.getExportSymbols().forEach((symbol) => {
            const nodes: Node[] = symbol.getDeclarations();

            nodes.forEach((node) => {
                if (!this.isFunctionNode(node)) {
                    return;
                }

                const functionNode = node.asKind(SyntaxKind.FunctionDeclaration)!;

                if (!this.hasUseServerDirectiveInBody(functionNode)) {
                    return;
                }

                const functionName = functionNode.getName();
                if (!functionName) {
                    return;
                }

                functionNames.push(functionName);
            });

        });

        return functionNames;
    }

    private hasUseServerDirectiveInBody(functionNode: FunctionDeclaration): boolean {
        const functionBody = functionNode.getBody?.();
        if (!functionBody) {
            return false;
        }

        const functionBodyBlock = functionBody.asKind(SyntaxKind.Block)!;

        const statements = functionBodyBlock.getStatements();
        if (statements.length === 0) {
            return false;
        }

        const firstStatement = statements[0];
        if (!firstStatement.isKind(SyntaxKind.ExpressionStatement)) {
            return false;
        }

        const expression = firstStatement.getExpression();
        if (!expression.isKind(SyntaxKind.StringLiteral)) {
            return false;
        }

        const literalValue = expression.getLiteralText();
        return this.isUseServerDirective(literalValue);
    }

    private isFunctionNode(node: Node): boolean {
        return node.isKind(SyntaxKind.FunctionDeclaration);
    }
}