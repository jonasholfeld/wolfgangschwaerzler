document.addEventListener('DOMContentLoaded', () => {
    const shell = document.querySelector('.site-shell');

    if (!shell) {
        return;
    }

    const validViews = ['about', 'home', 'index'];
    const currentLanguage = document.documentElement.lang || 'en';
    const navLinks = document.querySelectorAll('[data-view-link]');
    const languageLinks = document.querySelectorAll('[data-lang-code]');
    const primaryLink = document.querySelector('[data-primary-link]');
    const secondaryLink = document.querySelector('[data-secondary-link]');
    const prefixForLanguage = (languageCode) => (languageCode === 'en' ? '' : `/${languageCode}`);
    const languagePrefix = prefixForLanguage(currentLanguage);

    const viewFromPath = (pathname) => {
        const normalized = pathname.replace(/\/+$/, '') || '/';
        const withoutLanguage = normalized.startsWith(`${languagePrefix}/`)
            ? normalized.slice(languagePrefix.length)
            : normalized;

        if (withoutLanguage === '/about') {
            return 'about';
        }

        if (withoutLanguage === '/index') {
            return 'index';
        }

        return 'home';
    };

    const pathFromView = (view) => {
        if (view === 'about') {
            return `${languagePrefix}/about` || '/about';
        }

        if (view === 'index') {
            return `${languagePrefix}/index` || '/index';
        }

        return languagePrefix || '/';
    };

    const pathFromViewForLanguage = (view, languageCode) => {
        const prefix = prefixForLanguage(languageCode);

        if (view === 'about') {
            return `${prefix}/about` || '/about';
        }

        if (view === 'index') {
            return `${prefix}/index` || '/index';
        }

        return prefix || '/';
    };

    const syncNavigation = (view) => {
        navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.dataset.viewLink === view);
        });

        if (primaryLink) {
            const isAboutView = view === 'about';
            const targetView = isAboutView ? primaryLink.dataset.closeView : primaryLink.dataset.aboutView;
            const label = isAboutView ? primaryLink.dataset.closeLabel : primaryLink.dataset.aboutLabel;

            primaryLink.textContent = label;
            primaryLink.href = pathFromView(targetView);
            primaryLink.dataset.viewLink = targetView;
            primaryLink.classList.toggle('is-active', isAboutView);
        }

        if (secondaryLink) {
            const isIndexView = view === 'index';
            const targetView = isIndexView ? secondaryLink.dataset.closeView : secondaryLink.dataset.indexView;
            const label = isIndexView ? secondaryLink.dataset.closeLabel : secondaryLink.dataset.indexLabel;

            secondaryLink.textContent = label;
            secondaryLink.href = pathFromView(targetView);
            secondaryLink.dataset.viewLink = targetView;
            secondaryLink.classList.toggle('is-active', isIndexView);
        }

        languageLinks.forEach((link) => {
            link.href = pathFromViewForLanguage(view, link.dataset.langCode);
        });
    };

    const setView = (view, options = {}) => {
        const nextView = validViews.includes(view) ? view : 'home';
        shell.dataset.view = nextView;
        syncNavigation(nextView);

        if (options.updateHistory === true) {
            window.history.pushState({ view: nextView }, '', pathFromView(nextView));
        }
    };

    setView(shell.dataset.initialView || viewFromPath(window.location.pathname));

    const handleViewLinkClick = (event) => {
        event.preventDefault();
        setView(event.currentTarget.dataset.viewLink, { updateHistory: true });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', handleViewLinkClick);
    });

    if (primaryLink) {
        primaryLink.addEventListener('click', handleViewLinkClick);
    }

    window.addEventListener('popstate', (event) => {
        const nextView = event.state?.view || viewFromPath(window.location.pathname);
        setView(nextView);
    });
});
