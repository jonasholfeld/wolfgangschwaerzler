document.addEventListener('DOMContentLoaded', () => {
    // On input change of index-search, filter all .index-card elements by their data-title attribute
    const indexSearch = document.querySelector('#index-search');

    if (indexSearch) {
        indexSearch.addEventListener('input', (event) => {
            const searchTerm = event.currentTarget.value.toLowerCase();
            const indexCards = document.querySelectorAll('.index-card');

            indexCards.forEach((card) => {
                const title = card.dataset.title || '';
                const matches = title.toLowerCase().includes(searchTerm);

                card.hidden = matches === false;
            });
        });
    }

    const imprintBlock = document.querySelector('.panel__block--imprint');
    const imprintHeading = imprintBlock?.querySelector('.panel__subheading');
    const imprintText = imprintBlock?.querySelector('.panel__text');

    if (imprintHeading && imprintText) {
        let isImprintOpen = false;

        imprintHeading.addEventListener('click', () => {
            if (isImprintOpen) {
                imprintText.style.height = `${imprintText.scrollHeight}px`;
                window.requestAnimationFrame(() => {
                    imprintText.style.height = '0px';
                });
            } else {
                imprintText.style.height = `${imprintText.scrollHeight}px`;
            }

            isImprintOpen = !isImprintOpen;
        });

        imprintText.addEventListener('transitionend', (event) => {
            if (event.propertyName !== 'height') {
                return;
            }

            imprintText.style.height = isImprintOpen ? 'auto' : '0px';
        });
    }

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

    const slideshowFrames = document.querySelectorAll('.project-card__slideshow-frame');
    const homePanel = document.querySelector('.panel--home');
    let navScrollState = null;

    const applyNavVisibility = () => {
        if (!navScrollState || !homePanel) {
            return;
        }

        const nearTop = homePanel.scrollTop <= 8;
        const shouldHide = navScrollState.isScrollingDown && !nearTop && !navScrollState.isPointerNearTop;
        shell.classList.toggle('nav-is-hidden', shouldHide);
    };

    const forceHideNavigation = () => {
        if (!navScrollState || !homePanel) {
            return;
        }

        navScrollState.isScrollingDown = true;
        navScrollState.lastScrollY = homePanel.scrollTop;
        applyNavVisibility();
    };

    const slideshowItems = (slideshow) => Array.from(slideshow.querySelectorAll('[data-slideshow-item]'));

    const slideshowAlignmentLeft = (slideshow) => {
        const styles = window.getComputedStyle(slideshow);
        const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;

        return slideshow.getBoundingClientRect().left + paddingLeft;
    };

    const activeSlideshowIndex = (slideshow) => {
        const items = slideshowItems(slideshow);

        if (items.length === 0) {
            return -1;
        }

        const alignmentLeft = slideshowAlignmentLeft(slideshow);
        let activeIndex = 0;
        let smallestDistance = Number.POSITIVE_INFINITY;

        items.forEach((item, index) => {
            const distance = Math.abs(item.getBoundingClientRect().left - alignmentLeft);

            if (distance < smallestDistance) {
                smallestDistance = distance;
                activeIndex = index;
            }
        });

        return activeIndex;
    };

    const scrollSlideshowToIndex = (slideshow, index, behavior = 'smooth') => {
        const items = slideshowItems(slideshow);
        const targetItem = items[index];

        if (!targetItem) {
            return;
        }

        const alignmentLeft = slideshowAlignmentLeft(slideshow);
        const targetLeft = slideshow.scrollLeft + (targetItem.getBoundingClientRect().left - alignmentLeft);

        slideshow.scrollTo({
            left: targetLeft,
            behavior,
        });
    };

    const projectCards = Array.from(document.querySelectorAll('.project-card'));

    const visibleProjectCard = () => {
        if (projectCards.length === 0) {
            return null;
        }

        const viewportCenter = window.innerHeight / 2;
        let bestCard = projectCards[0];
        let bestDistance = Number.POSITIVE_INFINITY;

        projectCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(cardCenter - viewportCenter);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestCard = card;
            }
        });

        return bestCard;
    };

    const goToAdjacentProject = (frame, direction) => {
        const currentCard = frame.closest('.project-card');

        if (!currentCard) {
            return false;
        }

        const currentCardIndex = projectCards.indexOf(currentCard);
        const targetCard = projectCards[currentCardIndex + direction];

        if (!targetCard) {
            return false;
        }

        targetCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        return true;
    };

    slideshowFrames.forEach((frame) => {
        const slideshow = frame.querySelector('[data-slideshow]');
        const controls = frame.querySelectorAll('[data-slideshow-direction]');
        const counter = frame.closest('.project-card')?.querySelector('[data-slideshow-counter]');

        const updateCounter = () => {
            if (!counter) {
                return;
            }

            const items = slideshowItems(slideshow);
            const total = items.length;

            if (total === 0) {
                counter.textContent = '0/0';
                return;
            }

            const currentIndex = activeSlideshowIndex(slideshow);
            const currentSlide = currentIndex >= 0 ? currentIndex + 1 : 1;

            counter.textContent = `${currentSlide}/${total}`;
        };

        if (!slideshow || controls.length === 0) {
            return;
        }

        updateCounter();

        slideshow.addEventListener('scroll', updateCounter, { passive: true });
        window.addEventListener('resize', updateCounter);

        controls.forEach((control) => {
            control.addEventListener('click', () => {
                const direction = Number.parseInt(control.dataset.slideshowDirection || '0', 10);
                const currentIndex = activeSlideshowIndex(slideshow);
                const items = slideshowItems(slideshow);

                if (currentIndex === -1 || direction === 0 || items.length === 0) {
                    return;
                }

                const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

                if (nextIndex === currentIndex) {
                    if (direction > 0) {
                        forceHideNavigation();
                    }
                    goToAdjacentProject(frame, direction);
                    return;
                }

                if (direction > 0) {
                    forceHideNavigation();
                }
                scrollSlideshowToIndex(slideshow, nextIndex);
                window.setTimeout(updateCounter, 300);
            });
        });
    });

    document.addEventListener('keydown', (event) => {
        if (shell.dataset.view !== 'home') {
            return;
        }

        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            return;
        }

        const focusedTagName = document.activeElement?.tagName;
        if (focusedTagName === 'INPUT' || focusedTagName === 'TEXTAREA' || document.activeElement?.isContentEditable) {
            return;
        }

        const currentCard = visibleProjectCard();
        const currentFrame = currentCard?.querySelector('.project-card__slideshow-frame');
        const currentSlideshow = currentFrame?.querySelector('[data-slideshow]');

        if (!currentCard || !currentFrame || !currentSlideshow) {
            return;
        }

        event.preventDefault();

        if (event.key === 'ArrowUp') {
            goToAdjacentProject(currentFrame, -1);
            return;
        }

        if (event.key === 'ArrowDown') {
            forceHideNavigation();
            goToAdjacentProject(currentFrame, 1);
            return;
        }

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const currentIndex = activeSlideshowIndex(currentSlideshow);
        const items = slideshowItems(currentSlideshow);

        if (currentIndex === -1 || items.length === 0) {
            return;
        }

        const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

        if (nextIndex === currentIndex) {
            if (direction > 0) {
                forceHideNavigation();
            }
            goToAdjacentProject(currentFrame, direction);
            return;
        }

        if (direction > 0) {
            forceHideNavigation();
        }
        scrollSlideshowToIndex(currentSlideshow, nextIndex);
    });

    if (homePanel) {
        const minScrollDelta = 8;
        const pointerRevealThreshold = window.innerWidth * 0.03;
        let ticking = false;

        navScrollState = {
            lastScrollY: homePanel.scrollTop,
            isScrollingDown: false,
            isPointerNearTop: false,
        };

        const updateNavVisibilityFromScroll = () => {
            if (!navScrollState) {
                return;
            }

            const currentScrollY = homePanel.scrollTop;
            const delta = currentScrollY - navScrollState.lastScrollY;

            if (Math.abs(delta) >= minScrollDelta) {
                navScrollState.isScrollingDown = delta > 0;
                navScrollState.lastScrollY = currentScrollY;
            }

            applyNavVisibility();
            ticking = false;
        };

        homePanel.addEventListener('scroll', () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateNavVisibilityFromScroll);
        }, { passive: true });

        window.addEventListener('mousemove', (event) => {
            if (!navScrollState) {
                return;
            }

            navScrollState.isPointerNearTop = event.clientY <= pointerRevealThreshold;
            applyNavVisibility();
        }, { passive: true });

        applyNavVisibility();
    }

    const indexFilter = document.querySelector('[data-index-filter]');

    if (indexFilter) {
        const filterButtons = Array.from(indexFilter.querySelectorAll('[data-index-filter-button]'));
        const indexItems = Array.from(document.querySelectorAll('[data-index-item]'));
        const scrollContainer = indexFilter.closest('.panel--index');
        let lastScrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
        let ticking = false;
        const minScrollDelta = 8;
        let isScrollingDown = false;
        let isPointerNearTop = false;
        const pointerRevealThreshold = window.innerWidth * 0.03;

        const applyFilterVisibility = (currentScrollY) => {
            const nearTop = currentScrollY <= 8;
            const shouldHide = isScrollingDown && !nearTop && !isPointerNearTop;

            indexFilter.classList.toggle('is-hidden', shouldHide);
        };

        const applyIndexFilter = (category) => {
            filterButtons.forEach((button) => {
                button.classList.toggle('is-active', button.dataset.categoryFilter === category);
            });

            indexItems.forEach((item) => {
                const itemCategories = (item.dataset.categories || '')
                    .split('|')
                    .map((value) => value.trim())
                    .filter((value) => value.length > 0);
                const matches = category === 'all' || itemCategories.includes(category);

                item.hidden = matches === false;
            });
        };

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                applyIndexFilter(button.dataset.categoryFilter || 'all');
            });
        });

        applyIndexFilter('all');

        const updateFilterVisibility = () => {
            const currentScrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            const delta = currentScrollY - lastScrollY;

            if (Math.abs(delta) >= minScrollDelta) {
                isScrollingDown = delta > 0;
                lastScrollY = currentScrollY;
            }

            applyFilterVisibility(currentScrollY);
            ticking = false;
        };

        const handleScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateFilterVisibility);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        window.addEventListener('mousemove', (event) => {
            isPointerNearTop = event.clientY <= pointerRevealThreshold;
            const currentScrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
            applyFilterVisibility(currentScrollY);
        }, { passive: true });
    }

    window.addEventListener('popstate', (event) => {
        const nextView = event.state?.view || viewFromPath(window.location.pathname);
        setView(nextView);
    });
});
