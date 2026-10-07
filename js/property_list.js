/**
 * PG Life - Property List Logic
 * Filters (Unisex, Male, Female) & Rent Sorting (Highest / Lowest First)
 */

(function () {
    var currentGender = "all";
    var currentSort = null; // 'desc', 'asc', or null

    // 1. Unified Event Delegation on Document (works immediately, regardless of load state)
    document.addEventListener("click", function (event) {
        // Sort Descending (Highest rent first)
        var sortDesc = event.target.closest("#sort-desc");
        if (sortDesc) {
            event.preventDefault();
            if (currentSort === "desc") {
                currentSort = null;
            } else {
                currentSort = "desc";
            }
            applyFilterAndSort();
            return;
        }

        // Sort Ascending (Lowest rent first)
        var sortAsc = event.target.closest("#sort-asc");
        if (sortAsc) {
            event.preventDefault();
            if (currentSort === "asc") {
                currentSort = null;
            } else {
                currentSort = "asc";
            }
            applyFilterAndSort();
            return;
        }

        // Gender button in filter modal
        var genderBtn = event.target.closest("#gender-filter-group button");
        if (genderBtn) {
            event.preventDefault();
            var buttons = document.querySelectorAll("#gender-filter-group button");
            buttons.forEach(function (btn) {
                btn.classList.remove("btn-active");
            });
            genderBtn.classList.add("btn-active");
            currentGender = genderBtn.getAttribute("data-gender") || "all";
            applyFilterAndSort();
            return;
        }

        // Okay button in filter modal
        var filterApplyBtn = event.target.closest("#filter-apply-btn");
        if (filterApplyBtn) {
            applyFilterAndSort();
            return;
        }

        // Heart Icon (Toggle Interested)
        var heartIcon = event.target.closest(".is-interested-image");
        if (heartIcon) {
            event.preventDefault();
            handleToggleInterested(heartIcon);
            return;
        }
    });

    // 2. Filter & Sort Execution
    function applyFilterAndSort() {
        var container = document.getElementById("properties-container");
        if (!container) return;

        var noPropertyMessage = document.getElementById("no-property-message");
        var filterBtn = document.getElementById("filter-btn");
        var filterLabel = document.getElementById("filter-label");
        var sortDescBtn = document.getElementById("sort-desc");
        var sortAscBtn = document.getElementById("sort-asc");

        // Update Filter button UI state
        if (currentGender && currentGender !== "all") {
            if (filterBtn) filterBtn.classList.add("filter-active");
            if (filterLabel) {
                var labelText = currentGender.charAt(0).toUpperCase() + currentGender.slice(1);
                filterLabel.innerText = "Filter (" + labelText + ")";
            }
        } else {
            if (filterBtn) filterBtn.classList.remove("filter-active");
            if (filterLabel) filterLabel.innerText = "Filter";
        }

        // Update Sort buttons UI state
        if (sortDescBtn) {
            if (currentSort === "desc") {
                sortDescBtn.classList.add("sort-active");
            } else {
                sortDescBtn.classList.remove("sort-active");
            }
        }
        if (sortAscBtn) {
            if (currentSort === "asc") {
                sortAscBtn.classList.add("sort-active");
            } else {
                sortAscBtn.classList.remove("sort-active");
            }
        }

        // Get all cards
        var cards = Array.from(container.getElementsByClassName("property-card"));

        // Sort array
        if (currentSort === "desc") {
            cards.sort(function (a, b) {
                var rentA = parseInt(a.getAttribute("data-rent")) || 0;
                var rentB = parseInt(b.getAttribute("data-rent")) || 0;
                return rentB - rentA; // Highest rent first
            });
        } else if (currentSort === "asc") {
            cards.sort(function (a, b) {
                var rentA = parseInt(a.getAttribute("data-rent")) || 0;
                var rentB = parseInt(b.getAttribute("data-rent")) || 0;
                return rentA - rentB; // Lowest rent first
            });
        } else {
            cards.sort(function (a, b) {
                var idA = parseInt(a.getAttribute("data-id")) || 0;
                var idB = parseInt(b.getAttribute("data-id")) || 0;
                return idA - idB; // Default by ID
            });
        }

        // Filter and re-append in sorted order
        var visibleCount = 0;
        cards.forEach(function (card) {
            var cardGender = (card.getAttribute("data-gender") || "").toLowerCase();
            var matches = (currentGender === "all" || cardGender === currentGender);

            if (matches) {
                card.style.removeProperty("display");
                visibleCount++;
            } else {
                card.style.display = "none";
            }

            container.appendChild(card);
        });

        // Move no-property-message to the bottom
        if (noPropertyMessage) {
            container.appendChild(noPropertyMessage);
            if (visibleCount === 0) {
                noPropertyMessage.style.display = "block";
            } else {
                noPropertyMessage.style.display = "none";
            }
        }

        // Sync URL query parameters without reloading
        try {
            var url = new URL(window.location.href);
            if (currentGender && currentGender !== "all") {
                url.searchParams.set("gender", currentGender);
            } else {
                url.searchParams.delete("gender");
            }
            if (currentSort) {
                url.searchParams.set("sort", currentSort);
            } else {
                url.searchParams.delete("sort");
            }
            window.history.replaceState({}, "", url.toString());
        } catch (e) {}
    }

    // 3. Heart Icon AJAX Handler
    function handleToggleInterested(heartIcon) {
        var property_id = heartIcon.getAttribute("property_id");
        if (!property_id) return;

        var loadingEl = document.getElementById("loading");
        if (loadingEl) loadingEl.style.display = "block";

        var XHR = new XMLHttpRequest();
        XHR.addEventListener("load", function (e) {
            if (loadingEl) loadingEl.style.display = "none";
            try {
                var response = JSON.parse(e.target.responseText);
                if (response.success) {
                    var pId = response.property_id;
                    var hearts = document.querySelectorAll(".property-id-" + pId + " .is-interested-image");
                    var counts = document.querySelectorAll(".property-id-" + pId + " .interested-user-count");

                    hearts.forEach(function (h) {
                        if (response.is_interested) {
                            h.classList.add("fas");
                            h.classList.remove("far");
                        } else {
                            h.classList.add("far");
                            h.classList.remove("fas");
                        }
                    });

                    counts.forEach(function (c) {
                        var current = parseFloat(c.innerHTML) || 0;
                        c.innerHTML = response.is_interested ? (current + 1) : Math.max(0, current - 1);
                    });
                } else if (!response.success && !response.is_logged_in) {
                    if (window.$) {
                        window.$("#login-modal").modal("show");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        });

        XHR.addEventListener("error", function () {
            if (loadingEl) loadingEl.style.display = "none";
            alert("Oops! Something went wrong.");
        });

        XHR.open("GET", "api/toggle_interested.php?property_id=" + property_id);
        XHR.send();
    }

    // 4. Initialization (runs on ready & load)
    var initialized = false;
    function init() {
        if (initialized) return;
        var container = document.getElementById("properties-container");
        if (!container) return; // Wait until DOM is available

        initialized = true;

        try {
            var urlParams = new URLSearchParams(window.location.search);
            var initialGender = urlParams.get("gender");
            var initialSort = urlParams.get("sort");

            if (initialGender && ["all", "unisex", "male", "female"].includes(initialGender.toLowerCase())) {
                currentGender = initialGender.toLowerCase();
                var buttons = document.querySelectorAll("#gender-filter-group button");
                buttons.forEach(function (btn) {
                    if (btn.getAttribute("data-gender") === currentGender) {
                        btn.classList.add("btn-active");
                    } else {
                        btn.classList.remove("btn-active");
                    }
                });
            }

            if (initialSort === "desc") {
                currentSort = "desc";
            } else if (initialSort === "asc") {
                currentSort = "asc";
            }
        } catch (e) {}

        applyFilterAndSort();

        // Also hook bootstrap modal hidden event
        if (window.$) {
            window.$("#filter-modal").on("hidden.bs.modal", function () {
                applyFilterAndSort();
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
    window.addEventListener("load", init);
})();
