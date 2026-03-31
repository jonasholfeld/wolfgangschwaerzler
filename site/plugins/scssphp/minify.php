<?php

/**
 * Minify CSS Function
 * @author    Bart van de Biezen <bart@bartvandebiezen.com>
 * @link      https://github.com/bartvandebiezen/kirby-v2-scssphp
 * @return    CSS
 * @version   0.5
 */

 function minifyCSS($buffer) {

    // Remove all CSS comments.
    $buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);

    // Remove leading zeros.
    $buffer = preg_replace('/(?<=[^1-9])(0+)(?=\.)/', '', $buffer);

    // Remove newlines, tabs, and excess whitespace between tokens.
    $buffer = preg_replace('/\s+/', ' ', $buffer); // Replace multiple whitespace with a single space.

    // Remove unnecessary spaces around characters but keep spaces between important selectors.
    $buffer = preg_replace('/\s*([\{\}:;,])\s*/', '$1', $buffer);  // Removes spaces around `{ } : ; ,`
    $buffer = preg_replace('/\s*>\s*/', '>', $buffer);  // Remove space around child combinator.
    $buffer = preg_replace('/\s*\+\s*/', '+', $buffer);  // Remove space around adjacent sibling combinator.
    $buffer = preg_replace('/\s*~\s*/', '~', $buffer);  // Remove space around general sibling combinator.
    $buffer = preg_replace('/\s*&\s*/', '&', $buffer);  // Remove space around ampersand.
    $buffer = preg_replace('/\s*\(\s*/', '(', $buffer);  // Remove spaces before/after parenthesis.
    $buffer = preg_replace('/\s*\)\s*/', ')', $buffer);  // Remove spaces before/after parenthesis.

    // Fix spacing in media queries.
    $buffer = preg_replace('/and\(/', 'and (', $buffer);  // Ensure space between 'and' and '('.

    // Remove last semi-colon within a CSS rule.
    $buffer = str_replace(';}', '}', $buffer);

    return trim($buffer);
}

?>