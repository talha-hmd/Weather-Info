export function showNotFoundAlert() {
    const btn = document.querySelector('.search-submit-btn');
    btn.textContent = "Not Found";
    btn.classList.add("error-state");

    setTimeout(() => {
        btn.textContent = "Search";
        btn.classList.remove("error-state");
    }, 3000);
}
