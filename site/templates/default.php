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
        <section class="panel panel--about" data-view="about" aria-labelledby="about-heading">
            <div class="panel__inner">
                <div class="panel__block">
                    <h1 id="about-heading" class="panel__heading"><?= $aboutPage?->title()->escape() ?></h1>
                    <div class="panel__text"><?= $aboutPage?->abouttext()->kt() ?></div>
                </div>
                <div class="panel__block panel__block--imprint">
                    <div class="panel__text"><?= $aboutPage?->imprint()->kt() ?></div>
                </div>
            </div>
        </section>

        <section class="panel panel--home" data-view="home" aria-labelledby="home-heading">
            <div class="panel__inner panel__inner--projects">
                <h1 id="home-heading" class="sr-only"><?= $page->title()->escape() ?></h1>
                <?php foreach ($projectsPage?->children()->listed() ?? [] as $project): ?>
                <article class="project-card" id="<?= esc($project->slug()) ?>">
                    <div class="project-card__slideshow">
                        <?php foreach ($project->slideshowimages()->toFiles() as $image): ?>
                        <?php $orientationClass = $image->width() >= $image->height() ? 'project-card__image--landscape' : 'project-card__image--portrait'; ?>
                        <figure class="project-card__image-wrap">
                            <img
                                class="project-card__image <?= $orientationClass ?>"
                                src="<?= $image->url() ?>"
                                alt="<?= esc($image->alt()->or($project->title())->value()) ?>"
                                width="<?= $image->width() ?>"
                                height="<?= $image->height() ?>"
                                loading="lazy"
                            >
                        </figure>
                        <?php endforeach ?>
                    </div>
                    <div class="project-card__meta">
                        <div class="project-card__meta-box">
                            <h2 class="project-card__title"><?= $project->title()->escape() ?></h2>
                        </div>
                        <div class="project-card__meta-box">
                            <div class="project-card__text"><?= $project->infotext()->kt() ?></div>
                        </div>
                        <div class="project-card__meta-box">
                            <div class="project-card__text"><?= $project->media()->kt() ?></div>
                        </div>
                    </div>
                </article>
                <?php endforeach ?>
            </div>
        </section>

        <section class="panel panel--index" data-view="index" aria-labelledby="index-heading">
            <div class="panel__inner panel__inner--index">
                <h1 id="index-heading" class="sr-only">Index</h1>
                <?php foreach ($projectsPage?->children()->listed() ?? [] as $project): ?>
                <?php foreach ($project->indexobjects()->toStructure() as $indexObject): ?>
                <?php $indexImage = $indexObject->coverimage()->toFiles()->first(); ?>
                <article class="index-card">
                    <figure class="index-card__image-wrap">
                        <?php if ($indexImage): ?>
                        <img
                            class="index-card__image"
                            src="<?= $indexImage->url() ?>"
                            alt="<?= esc($indexImage->alt()->or($project->title())->value()) ?>"
                            loading="lazy"
                        >
                        <?php endif ?>
                    </figure>
                    <div class="index-card__meta">
                        <div class="index-card__meta-box">
                            <h2 class="index-card__title"><?= $project->title()->escape() ?></h2>
                        </div>
                        <div class="index-card__meta-box">
                            <div class="index-card__text"><?= $project->infotext()->kt() ?></div>
                        </div>
                        <div class="index-card__meta-box">
                            <div class="index-card__text"><?= $indexObject->indexmedia()->kt() ?></div>
                        </div>
                    </div>
                </article>
                <?php endforeach ?>
                <?php endforeach ?>
            </div>
        </section>
    </div>
</main>
<?= snippet('footer') ?>
