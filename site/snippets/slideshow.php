<section class="panel panel--home" data-view="home" aria-labelledby="home-heading">
    <div class="panel__inner panel__inner--projects">
        <h1 id="home-heading" class="sr-only"><?= $page->title()->escape() ?></h1>
        <?php foreach ($projectsPage->children()->template('project')->listed()->filter(fn ($child) => $child->slideshowimages()->toFiles()->count() > 0) ?? [] as $project): ?>
        <article class="project-card" id="<?= esc($project->slug()) ?>">
            <div class="navi-spacer"></div>
            <div class="project-card__slideshow-frame">
                <div class="project-card__slideshow" data-slideshow>
                    <?php foreach ($project->slideshowimages()->toFiles() as $mediaFile): ?>
                    <?php
                    $isVideo = $mediaFile->type() === 'video';
                    $width = $mediaFile->width();
                    $height = $mediaFile->height();
                    $orientationClass = ($width && $height && $width >= $height) ? 'project-card__image--landscape' : 'project-card__image--portrait';
                    $imageHeightFactor = $mediaFile->content()->get('height')->or('100')->value();
                    $posterImage = $mediaFile->poster()->toFile();
                    $posterUrl = $posterImage ? $posterImage->url() : null;
                    ?>
                    <figure class="project-card__image-wrap" data-slideshow-item>
                        <?php if ($isVideo): ?>
                        <video
                            class="project-card__image <?= $orientationClass ?>"
                            src="<?= $mediaFile->url() ?>"
                            <?php if ($width): ?>width="<?= $width ?>"<?php endif ?>
                            <?php if ($height): ?>height="<?= $height ?>"<?php endif ?>
                            style="--slideshow-image-height: <?= esc($imageHeightFactor) ?>;"
                            <?php if ($posterUrl): ?>poster="<?= $posterUrl ?>"<?php endif ?>
                            autoplay
                            loop
                            muted
                            playsinline
                            preload="metadata"
                        ></video>
                        <?php else: ?>
                        <img
                            class="project-card__image <?= $orientationClass ?>"
                            src="<?= $mediaFile->url() ?>"
                            alt="<?= esc($mediaFile->alt()->or($project->title())->value()) ?>"
                            width="<?= $width ?>"
                            height="<?= $height ?>"
                            style="--slideshow-image-height: <?= esc($imageHeightFactor) ?>;"
                            loading="lazy"
                        >
                        <?php endif ?>
                    </figure>
                    <?php endforeach ?>
                </div>
                <div class="project-card__slideshow-overlay" aria-hidden="true">
                    <button type="button" class="project-card__slideshow-hitarea project-card__slideshow-hitarea--prev" data-slideshow-direction="-1" tabindex="-1" aria-label="Previous image"></button>
                    <button type="button" class="project-card__slideshow-hitarea project-card__slideshow-hitarea--next" data-slideshow-direction="1" tabindex="-1" aria-label="Next image"></button>
                </div>
            </div>
            <div class="project-card__meta">
                <?php $slideshowCount = $project->slideshowimages()->toFiles()->count(); ?>
                <div class="project-card__meta-box black-text-box">
                    <h2 class="project-card__title"><?= $project->title()->escape() ?></h2>
                </div>
                <div class="project-card__meta-box black-text-box">
                    <div class="project-card__text"><?= $project->infotext()->kt() ?></div>
                </div>
                <div class="project-card__meta-box black-text-box">
                    <div class="project-card__text"><?= $project->media()->kt() ?></div>
                </div>
                <div class="project-card__meta-box black-text-box">
                    <div class="project-card__text" data-slideshow-counter><?= $slideshowCount > 0 ? '1/' . $slideshowCount : '0/0' ?></div>
                </div>
            </div>
        </article>
        <?php endforeach ?>
    </div>
</section>
