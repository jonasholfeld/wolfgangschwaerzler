<?php

return function ($page, $site, $kirby) {
    $languageCode = $kirby->languageCode() ?? 'en';
    $defaultLanguageCode = $kirby->defaultLanguage()?->code() ?? 'en';
    $translations = [];

    $entries = $site
        ->content($defaultLanguageCode)
        ->get('translations')
        ->toStructure();

    foreach ($entries as $entry) {
        $english = trim((string)$entry->english());
        $german = trim((string)$entry->german());

        if ($english === '') {
            continue;
        }

        $key = strtolower($english);

        $translations[$key] = [
            'en' => $english,
            'de' => $german !== '' ? $german : $english,
        ];
    }

    return [
        'lang' => $languageCode,
        'translations' => $translations,
    ];
};
