<?php

return [
    'scssNestedCheck' => true,
    'debug' => true,
    'scssNestedCheck' => true,
    'panel' => [
        'install' => true
    ],
    'languages' => true,
    'routes' => [
        [
            'pattern' => 'about',
            'language' => '*',
            'action' => function ($language) {
                $page = site()->visit('home', $language);
                return $page->render([
                    'forcedView' => 'about'
                ]);
            }
        ],
        [
            'pattern' => 'index',
            'language' => '*',
            'action' => function ($language) {
                $page = site()->visit('home', $language);
                return $page->render([
                    'forcedView' => 'index'
                ]);
            }
        ]
    ]
];
