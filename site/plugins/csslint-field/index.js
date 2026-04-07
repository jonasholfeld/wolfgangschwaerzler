(() => {
    window.panel.plugin("wolfgang/csslint-field", {
        fields: {
            csslint: {
                inheritAttrs: false,
                data() {
                    return {
                        lintIssues: [],
                        lintStatus: "idle",
                        lintTimer: null,
                        lintRequest: 0,
                        lineNumbers: [1],
                        lineNumberMetrics: null,
                        lineNumberScrollTop: 0,
                        resizeObserver: null,
                        textareaElement: null,
                    };
                },
                mounted() {
                    this.scheduleLint(this.$attrs.value);
                    this.updateLineNumbers(this.$attrs.value);
                    this.$nextTick(() => {
                        this.setupLineNumbers();
                    });
                },
                beforeDestroy() {
                    window.clearTimeout(this.lintTimer);
                    this.teardownLineNumbers();
                },
                watch: {
                    "$attrs.value"(value) {
                        this.scheduleLint(value);
                        this.updateLineNumbers(value);
                        this.$nextTick(() => {
                            this.measureLineNumbers();
                        });
                    },
                },
                computed: {
                    lineNumberStyle() {
                        if (!this.lineNumberMetrics) {
                            return {};
                        }

                        return {
                            top: `32px`,
                            left: `${this.lineNumberMetrics.left}px`,
                            height: `${this.lineNumberMetrics.height}px`,
                            width: `${this.lineNumberMetrics.gutterWidth}px`,
                            paddingTop: `${this.lineNumberMetrics.paddingTop}px`,
                            paddingBottom: `${this.lineNumberMetrics.paddingBottom}px`,
                        };
                    },
                    lineNumberContentStyle() {
                        return {
                            transform: `translateY(-${this.lineNumberScrollTop}px)`,
                        };
                    },
                    lineNumberTextStyle() {
                        if (!this.lineNumberMetrics) {
                            return {};
                        }

                        return {
                            lineHeight: `${this.lineNumberMetrics.lineHeight}px`,
                            minHeight: `${this.lineNumberMetrics.lineHeight}px`,
                            fontSize: `${this.lineNumberMetrics.fontSize}px`,
                        };
                    },
                },
                methods: {
                    onInput(value) {
                        this.$emit("input", value);
                        this.scheduleLint(value);
                        this.updateLineNumbers(value);
                    },
                    updateLineNumbers(value) {
                        const source = String(value || "");
                        const count = source === "" ? 1 : source.split("\n").length;

                        this.lineNumbers = Array.from({ length: count }, (_, index) => index + 1);
                    },
                    setupLineNumbers() {
                        this.teardownLineNumbers();

                        const textarea = this.$el.querySelector("textarea");

                        if (!textarea) {
                            return;
                        }

                        this.textareaElement = textarea;
                        textarea.addEventListener("scroll", this.syncLineNumberScroll);
                        window.addEventListener("resize", this.measureLineNumbers);
                        this.measureLineNumbers();

                        if (typeof ResizeObserver !== "undefined") {
                            this.resizeObserver = new ResizeObserver(() => {
                                this.measureLineNumbers();
                            });
                            this.resizeObserver.observe(textarea);
                        }
                    },
                    teardownLineNumbers() {
                        if (this.textareaElement) {
                            this.textareaElement.removeEventListener("scroll", this.syncLineNumberScroll);
                        }

                        window.removeEventListener("resize", this.measureLineNumbers);

                        if (this.resizeObserver) {
                            this.resizeObserver.disconnect();
                        }

                        this.resizeObserver = null;
                        this.textareaElement = null;
                    },
                    syncLineNumberScroll() {
                        if (!this.textareaElement) {
                            return;
                        }

                        this.lineNumberScrollTop = this.textareaElement.scrollTop;
                    },
                    measureLineNumbers() {
                        if (!this.textareaElement) {
                            return;
                        }

                        const styles = window.getComputedStyle(this.textareaElement);
                        const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
                        const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
                        const lineHeight = Number.parseFloat(styles.lineHeight) || 24;
                        const fontSize = Number.parseFloat(styles.fontSize) || 14;

                        this.lineNumberMetrics = {
                            top: this.textareaElement.offsetTop,
                            left: this.textareaElement.offsetLeft,
                            height: this.textareaElement.offsetHeight,
                            gutterWidth: 48,
                            paddingTop,
                            paddingBottom,
                            lineHeight,
                            fontSize,
                        };
                        this.lineNumberScrollTop = this.textareaElement.scrollTop;
                    },
                    scheduleLint(value) {
                        const css = String(value || "");

                        window.clearTimeout(this.lintTimer);

                        if (css.trim() === "") {
                            this.lintStatus = "idle";
                            this.lintIssues = [];
                            return;
                        }

                        this.lintStatus = "loading";
                        const requestId = ++this.lintRequest;

                        this.lintTimer = window.setTimeout(() => {
                            this.runLint(css, requestId);
                        }, 300);
                    },
                    async runLint(value, requestId) {
                        const api = this.$api ?? window.panel.api;

                        try {
                            const response = await api.post("csslint-field/lint", {
                                code: value,
                            });

                            if (requestId !== this.lintRequest) {
                                return;
                            }

                            this.lintIssues = response.issues || [];
                            this.lintStatus = "ready";
                        } catch (error) {
                            if (requestId !== this.lintRequest) {
                                return;
                            }

                            this.lintIssues = [
                                {
                                    text: error?.message || "Stylelint could not validate the CSS.",
                                    severity: "error",
                                },
                            ];
                            this.lintStatus = "error";
                        }
                    },
                    issueLabel(issue) {
                        const position = issue.line && issue.column
                            ? `Line ${issue.line}, column ${issue.column}: `
                            : "";

                        return `${position}${issue.text}`;
                    },
                },
                template: `
                    <div class="k-csslint-field">
                        <k-textarea-field
                            v-bind="$attrs"
                            @input="onInput"
                        />
                        <div
                            v-if="lineNumberMetrics"
                            class="k-csslint-field__line-numbers"
                            :style="lineNumberStyle"
                            aria-hidden="true"
                        >
                            <div
                                class="k-csslint-field__line-numbers-content"
                                :style="lineNumberContentStyle"
                            >
                                <span
                                    v-for="lineNumber in lineNumbers"
                                    :key="lineNumber"
                                    class="k-csslint-field__line-number"
                                    :style="lineNumberTextStyle"
                                >
                                    {{ lineNumber }}
                                </span>
                            </div>
                        </div>
                        <p
                            v-if="lintStatus === 'loading'"
                            class="k-csslint-field__status"
                        >
                            Checking CSS with stylelint…
                        </p>
                        <div
                            v-else-if="lintIssues.length > 0"
                            class="k-csslint-field__errors"
                            role="alert"
                        >
                            <p class="k-csslint-field__title">Stylelint found an issue</p>
                            <p
                                v-for="(issue, index) in lintIssues"
                                :key="index"
                                class="k-csslint-field__message"
                            >
                                {{ issueLabel(issue) }}
                            </p>
                        </div>
                    </div>
                `,
            },
        },
    });
})();
