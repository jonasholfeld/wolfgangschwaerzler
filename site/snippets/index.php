<section class="panel panel--index" data-view="index" aria-labelledby="index-heading">
    <div class="index-toolbar" data-index-filter>
        <button type="button" class="index-toolbar__button black-text-box is-active" data-index-filter-button data-category-filter="all">All</button>
        <?php foreach ($projectsPage?->children()->template('category')->listed() ?? [] as $category): ?>
        <button
            type="button"
            class="index-toolbar__button black-text-box"
            data-index-filter-button
            data-category-filter="<?= esc($category->uuid()?->toString() ?? '') ?>"
        ><?= $category->title()->escape() ?></button>
        <?php endforeach ?>
        <div class="index-toolbar__search">
            <input type="text" id="index-search" class="index-toolbar__search-input black-text-box" placeholder="Search..." data-index-search>
        </div>
    </div>
    <div class="panel__inner panel__inner--index">
        <h1 id="index-heading" class="sr-only">Index</h1>
        <?php foreach ($projectsPage?->children()->template('project')->listed() ?? [] as $project): ?>
        <?php foreach ($project->indexobjects()->toStructure() as $indexObject): ?>
        <?php $indexImage = $indexObject->coverimage()->toFiles()->first(); ?>
        <article class="index-card" data-index-item data-category="<?= esc($indexObject->category()->value()) ?>" data-title="<?= esc($project->title()->value()) ?>" >
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
                <div class="index-card__meta-box black-text-box">
                    <h2 class="index-card__title"><?= $project->title()->escape() ?></h2>
                </div>
                <div class="index-card__meta-box black-text-box">
                    <div class="index-card__text"><?= $project->infotext()->kt() ?></div>
                </div>
                <div class="index-card__meta-box black-text-box">
                    <div class="index-card__text"><?= $indexObject->indexmedia()->kt() ?></div>
                </div>
            </div>
        </article>
        <?php endforeach ?>
        <?php endforeach ?>
    </div>
</section>
