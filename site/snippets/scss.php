<?php

/**
 * SCSS Snippet
 * @author    Bart van de Biezen <bart@bartvandebiezen.com>
 * @link      https://github.com/bartvandebiezen/kirby-v2-scssphp
 * @return    CSS and HTML
 * @version   1.0.1
 */

use ScssPhp\ScssPhp\Compiler;

// Using realpath seems to work best in different situations.
$root = realpath(__DIR__ . '/../..');



// Set file paths. Used for checking and updating CSS file for current template.
$template     = $page->template();
$SCSS         = $root . '/assets/scss/' . $template . '.scss';
$CSS          = $root . '/assets/css/'  . $template . '.css';
$CSSKirbyPath = 'assets/css/' . $template . '.css';

// Set default SCSS if there is no SCSS for current template. If template is default, skip check.
if ($template == 'default' or !file_exists($SCSS)) {
	$SCSS         = $root . '/assets/scss/default.scss';
	$CSS          = $root . '/assets/css/default.css';
	$CSSKirbyPath = 'assets/css/default.css';
}
// If the CSS file doesn't exist create it so we can write to it
if (!file_exists($CSS)) {
	if (!file_exists($root . '/assets/css/')) {
	    mkdir($root . '/assets/css/', 0755, true);
	}
	touch($CSS,  mktime(0, 0, 0, date("m"), date("d"),  date("Y")-10));
}
// For when the plugin should check if partials are changed. If any partial is newer than the main SCSS file, the main SCSS file will be 'touched'. This will trigger the compiler later on, on this server and also on another environment when synced.
if ($kirby->option('scssNestedCheck')) {
	$SCSSDirectory = $root . '/assets/scss/';
	$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($SCSSDirectory));
	foreach ($files as $file) {
		if (pathinfo($file, PATHINFO_EXTENSION) == "scss" && filemtime($file) > filemtime($SCSS)) {
			touch ($SCSS);
			clearstatcache();
			break;
		}
	}
}

// Get file modification times. Used for checking if update is required and as version number for caching.
$SCSSFileTime = filemtime($SCSS);
$CSSFileTime = filemtime($CSS);

// Update CSS when needed.
if (!file_exists($CSS) or $SCSSFileTime > $CSSFileTime ) {
    // Activate library.
    require_once $root . '/site/plugins/scssphp/scss.inc.php';
    $compiler = new Compiler();

    // Setting compression provided by library.
    $compiler->setOutputStyle('compressed');

    // Setting relative @import paths.
    $importPath = $root . '/assets/scss';

    // Place SCSS file in buffer.
    $compiler->addImportPath($importPath);

    // Compile content in buffer.
    $buffer = file_get_contents($SCSS);
    $buffer = $compiler->compileString($buffer)->getCss();

    // Minify the CSS even further.
	require_once $root . '/site/plugins/scssphp/minify.php';
	// $buffer = minifyCSS($buffer);
    file_put_contents($CSS, $buffer);
}



?>
<link rel="stylesheet" property="stylesheet" href="<?php echo url($CSSKirbyPath) ?>?version=<?php echo $CSSFileTime ?>">
