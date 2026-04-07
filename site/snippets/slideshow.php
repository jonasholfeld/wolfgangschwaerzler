<section class="panel panel--home" data-view="home" aria-labelledby="home-heading">
    <div class="panel__inner panel__inner--projects">
        <h1 id="home-heading" class="sr-only"><?= $page->title()->escape() ?></h1>
        <?php foreach ($projectsPage->children()->template('project')->listed()->filter(fn ($child) => $child->slideshowimages()->toFiles()->count() > 0) ?? [] as $project): ?>
        <article class="project-card" id="<?= esc($project->slug()) ?>">
            <div class="project-card__slideshow-frame">
                <div class="project-card__slideshow" data-slideshow>
                    <?php foreach ($project->slideshowimages()->toFiles() as $image): ?>
                    <?php $orientationClass = $image->width() >= $image->height() ? 'project-card__image--landscape' : 'project-card__image--portrait'; ?>
                    <?php $imageHeightFactor = $image->content()->get('height')->or('100')->value(); ?>
                    <figure class="project-card__image-wrap" data-slideshow-item>
                        <img
                            class="project-card__image <?= $orientationClass ?>"
                            src="<?= $image->url() ?>"
                            alt="<?= esc($image->alt()->or($project->title())->value()) ?>"
                            width="<?= $image->width() ?>"
                            height="<?= $image->height() ?>"
                            style="--slideshow-image-height: <?= esc($imageHeightFactor) ?>;"
                            loading="lazy"
                        >
                    </figure>
                    <?php endforeach ?>
                </div>
                <div class="project-card__slideshow-overlay" aria-hidden="true">
                    <button type="button" class="project-card__slideshow-hitarea project-card__slideshow-hitarea--prev" data-slideshow-direction="-1" tabindex="-1" aria-label="Previous image"></button>
                    <button type="button" class="project-card__slideshow-hitarea project-card__slideshow-hitarea--next" data-slideshow-direction="1" tabindex="-1" aria-label="Next image"></button>
                </div>
            </div>
            <div class="project-card__meta">
                <div class="project-card__meta-box black-text-box">
                    <h2 class="project-card__title"><?= $project->title()->escape() ?></h2>
                </div>
                <div class="project-card__meta-box black-text-box">
                    <div class="project-card__text"><?= $project->infotext()->kt() ?></div>
                </div>
                <div class="project-card__meta-box black-text-box">
                    <div class="project-card__text"><?= $project->media()->kt() ?></div>
                </div>
            </div>
        </article>
        <?php endforeach ?>
    </div>
</section>
