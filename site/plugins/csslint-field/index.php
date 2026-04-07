<?php

Kirby::plugin('wolfgang/csslint-field', [
    'api' => [
        'routes' => [
            [
                'pattern' => 'csslint-field/lint',
                'method' => 'POST',
                'auth' => true,
                'action' => function () {
                    $code = (string)($this->requestBody('code') ?? '');

                    if (trim($code) === '') {
                        return [
                            'status' => 'ok',
                            'issues' => [],
                        ];
                    }

                    $command = ['node', __DIR__ . '/lint.mjs'];
                    $descriptors = [
                        0 => ['pipe', 'r'],
                        1 => ['pipe', 'w'],
                        2 => ['pipe', 'w'],
                    ];

                    $process = proc_open($command, $descriptors, $pipes, __DIR__);

                    if (is_resource($process) !== true) {
                        return [
                            'status' => 'error',
                            'message' => 'Unable to start stylelint.',
                        ];
                    }

                    fwrite($pipes[0], json_encode(['code' => $code], JSON_UNESCAPED_UNICODE));
                    fclose($pipes[0]);

                    $output = stream_get_contents($pipes[1]);
                    $errorOutput = stream_get_contents($pipes[2]);

                    fclose($pipes[1]);
                    fclose($pipes[2]);

                    $exitCode = proc_close($process);
                    $result = json_decode($output ?: 'null', true);

                    if ($exitCode !== 0 || is_array($result) !== true) {
                        return [
                            'status' => 'error',
                            'message' => 'Stylelint failed.',
                            'details' => trim($errorOutput) ?: null,
                        ];
                    }

                    return [
                        'status' => 'ok',
                        'issues' => $result['issues'] ?? [],
                    ];
                },
            ],
        ],
    ],
    'fields' => [
        'csslint' => [
            'extends' => 'textarea',
            'props' => [
                'font' => function (string|null $font = null) {
                    return $font === 'sans-serif' ? 'sans-serif' : 'monospace';
                },
                'spellcheck' => function (bool $spellcheck = false) {
                    return $spellcheck;
                },
            ],
        ],
    ],
]);
