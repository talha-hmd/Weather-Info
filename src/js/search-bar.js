export function setupSearchBar(onSearchCallback) {
    const searchForm = document.querySelector('.search-form');
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    const searchSubmitBtn = document.querySelector('.search-submit-btn');

    searchButton.addEventListener('click', () => {
        searchForm.classList.toggle('active-search');
        if (searchForm.classList.contains('active-search')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && searchInput.value.trim() !== "") {
            e.preventDefault();
            onSearchCallback(searchInput.value.trim());
        }
    });

    searchSubmitBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city !== "") onSearchCallback(city);
    });

    // Show/hide button on transition
    searchForm.addEventListener('transitionend', () => {
        if (searchForm.classList.contains('active-search')) {
            searchSubmitBtn.style.opacity = 1;
            searchSubmitBtn.style.pointerEvents = "auto";
        } else {
            searchSubmitBtn.style.opacity = 0;
            searchSubmitBtn.style.pointerEvents = "none";
        }
    });
}
