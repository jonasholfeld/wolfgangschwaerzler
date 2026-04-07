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
