<?php
$aboutPage = page('about');
$projectsPage = page('projects');
$language = $kirby->language();
$languages = $kirby->languages();

$requestPath = trim($kirby->request()->path()->toString(), '/');
$pathWithoutLanguage = $requestPath;

if ($language && $language->isDefault() === false) {
    $prefix = $language->code() . '/';
    if (str_starts_with($pathWithoutLanguage, $prefix) === true) {
        $pathWithoutLanguage = substr($pathWithoutLanguage, strlen($prefix));
    }
}

$initialView = $forcedView ?? match ($pathWithoutLanguage) {
    'about' => 'about',
    'index' => 'index',
    default => 'home',
};

$viewPath = function (string $view, $language): string {
    $prefix = $language && $language->isDefault() === false ? '/' . $language->code() : '';

    return match ($view) {
        'about' => $prefix . '/about',
        'index' => $prefix . '/index',
        default => $prefix . '/',
    };
};
?>
<?= snippet('header') ?>
<main
    class="site-shell"
    data-initial-view="<?= esc($initialView) ?>"
    data-home-url="<?= esc($viewPath('home', $language)) ?>"
    data-about-url="<?= esc($viewPath('about', $language)) ?>"
    data-index-url="<?= esc($viewPath('index', $language)) ?>"
>
    <nav class="site-nav" aria-label="Main navigation">
        <div class="site-nav__side">
            <a
                class="site-nav__link internal-link"
                href="<?= $viewPath($initialView === 'about' ? 'home' : 'about', $language) ?>"
                data-primary-link
                data-about-label="About"
                data-close-label="Close"
                data-about-view="about"
                data-close-view="home"
            ><?= $initialView === 'about' ? 'Close' : 'About' ?></a>
        </div>
        <div class="site-nav__side site-nav__side--right">
            <a
                class="site-nav__link internal-link"
                href="<?= $viewPath($initialView === 'index' ? 'home' : 'index', $language) ?>"
                data-secondary-link
                data-index-label="Index"
                data-close-label="Close"
                data-index-view="index"
                data-close-view="home"
                data-view-link="<?= $initialView === 'index' ? 'home' : 'index' ?>"
            ><?= $initialView === 'index' ? 'Close' : 'Index' ?></a>
            <div class="site-nav__languages" aria-label="Language switch">
                <?php if ($language->code() === 'en'): ?>
                <a
                    class="site-nav__language internal-link abc"
                    href="/de"
                    data-lang-code="de"
                    hreflang="de"
                    lang="de"
                >DE</a>
                <?php else: ?>
                <a
                    class="site-nav__language internal-link"
                    href="/"
                    data-lang-code="en"
                    hreflang="en"
                    lang="en"
                >EN</a>
                <?php endif ?>
            </div>
        </div>
    </nav>

    <div class="site-panels" data-panels>
        <?= snippet('about', ['aboutPage' => $aboutPage]) ?>
        <?= snippet('slideshow', ['page' => $page, 'projectsPage' => $projectsPage]) ?>
        <?= snippet('index', ['projectsPage' => $projectsPage]) ?>
    </div>
</main>
<?= snippet('footer') ?>
