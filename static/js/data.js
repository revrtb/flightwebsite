(function () {
    const grid = document.getElementById('dataCardsGrid');
    const sentinel = document.getElementById('dataLoadSentinel');
    const statusEl = document.getElementById('dataLoadStatus');
    const body = document.body;

    let nextPage = 1;
    let loading = false;
    let done = false;
    let totalPages = parseInt(body.dataset.totalPages || '10', 10);

    function syncBrowserUrlToPage(pageNum) {
        const u = new URL(window.location.href);
        u.searchParams.set('page', String(pageNum));
        history.replaceState({}, '', `${u.pathname}${u.search}${u.hash}`);
    }

    function renderCard(item) {
        const card = document.createElement('div');
        card.className = 'data-card';
        card.setAttribute('role', 'listitem');
        card.dataset.id = String(item.id);

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = '';
        img.loading = 'lazy';
        img.width = 200;
        img.height = 200;

        const span = document.createElement('span');
        span.className = 'data-card__text';
        span.textContent = item.text;

        card.appendChild(img);
        card.appendChild(span);
        grid.appendChild(card);
    }

    async function loadNextPage() {
        if (loading || done || nextPage > totalPages) return;
        loading = true;
        statusEl.textContent = 'Loading…';
        try {
            const res = await fetch(`/api/data-page?page=${nextPage}`);
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            const data = await res.json();
            if (typeof data.totalPages === 'number') {
                totalPages = data.totalPages;
            }
            (data.items || []).forEach(renderCard);
            if (typeof data.page === 'number') {
                syncBrowserUrlToPage(data.page);
            }
            if (!data.hasMore) {
                done = true;
                observer.disconnect();
                statusEl.textContent = 'All pages loaded.';
            } else {
                statusEl.textContent = '';
            }
            nextPage += 1;
        } catch (e) {
            console.error(e);
            statusEl.textContent = 'Could not load the next page. Scroll again to retry.';
            return false;
        } finally {
            loading = false;
        }
    }

    function sentinelNearViewport() {
        const rect = sentinel.getBoundingClientRect();
        return rect.top < window.innerHeight + 160;
    }

    async function pumpLoadsFromScroll() {
        while (!done && !loading && nextPage <= totalPages && sentinelNearViewport()) {
            const failed = await loadNextPage();
            if (failed === false) break;
        }
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    pumpLoadsFromScroll();
                }
            }
        },
        { root: null, rootMargin: '160px 0px', threshold: 0 }
    );

    async function loadThroughPageFromUrl() {
        const params = new URLSearchParams(window.location.search);
        let target = parseInt(params.get('page'), 10);
        if (Number.isNaN(target)) {
            target = 1;
        }
        target = Math.min(Math.max(target, 1), totalPages);
        while (nextPage <= target && !done) {
            const failed = await loadNextPage();
            if (failed === false) break;
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await loadThroughPageFromUrl();
        if (!done) {
            observer.observe(sentinel);
        }
        pumpLoadsFromScroll();
    });
}());
