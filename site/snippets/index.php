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
