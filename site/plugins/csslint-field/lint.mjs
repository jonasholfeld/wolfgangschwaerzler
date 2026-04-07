import stylelint from "stylelint";

const readStdin = async () => {
    let input = "";

    for await (const chunk of process.stdin) {
        input += chunk;
    }

    return input;
};

const normalizeIssue = (issue) => ({
    line: issue.line ?? null,
    column: issue.column ?? null,
    endLine: issue.endLine ?? null,
    endColumn: issue.endColumn ?? null,
    rule: issue.rule ?? null,
    severity: issue.severity ?? "error",
    text: issue.text ?? "Unknown stylelint issue.",
});

try {
    const rawInput = await readStdin();
    const payload = JSON.parse(rawInput || "{}");
    const code = String(payload.code ?? "");

    if (code.trim() === "") {
        process.stdout.write(JSON.stringify({ issues: [] }));
        process.exit(0);
    }

    const result = await stylelint.lint({
        code,
        config: {
            rules: {
                "at-rule-no-unknown": true,
                "block-no-empty": true,
                "color-no-invalid-hex": true,
                "declaration-block-no-duplicate-properties": true,
                "declaration-property-value-no-unknown": true,
                "function-no-unknown": true,
                "media-feature-name-no-unknown": true,
                "property-no-unknown": true,
                "selector-pseudo-class-no-unknown": true,
                "selector-pseudo-element-no-unknown": true,
                "unit-no-unknown": true,
            },
        },
    });

    const issues = result.results.flatMap((entry) =>
        entry.warnings.map(normalizeIssue)
    );

    process.stdout.write(JSON.stringify({ issues }));
} catch (error) {
    process.stderr.write(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
