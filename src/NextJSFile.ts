import {SourceFile, Statement, SyntaxKind} from "ts-morph";

export class NextJSFile {

    private readonly USE_SERVER_DIRECTIVE = 'use server';
    private readonly sourceFile: SourceFile;
    private readonly statements: Statement[];

    constructor(sourceFile: SourceFile) {
        this.sourceFile = sourceFile;
        this.statements = this.sourceFile.getStatements();
    }

    isServerAction(): boolean {
        return this.hasUseServerDirectiveOnTopOfFile();
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
}