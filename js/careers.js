/* Obsidian Capital — job board: search, filters, rendering. */

(() => {
  const searchInput = document.getElementById("searchInput");
  const deptFilter = document.getElementById("deptFilter");
  const locFilter = document.getElementById("locFilter");
  const typeFilter = document.getElementById("typeFilter");
  const seniorityFilter = document.getElementById("seniorityFilter");
  const clearBtn = document.getElementById("clearFilters");
  const list = document.getElementById("jobList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");

  /* Populate selects from the dataset */
  const fill = (select, values) => {
    values
      .slice()
      .sort()
      .forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
  };
  fill(deptFilter, DEPARTMENTS);
  fill(locFilter, LOCATIONS);
  fill(typeFilter, TYPES);
  fill(seniorityFilter, SENIORITIES);

  /* Deep links: careers.html?dept=Engineering */
  const params = new URLSearchParams(location.search);
  const deptParam = params.get("dept");
  if (deptParam && DEPARTMENTS.includes(deptParam)) deptFilter.value = deptParam;

  const daysAgo = (iso) => {
    const days = Math.max(
      0,
      Math.round((Date.now() - new Date(iso + "T00:00:00")) / 86400000)
    );
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted yesterday";
    return `Posted ${days} days ago`;
  };

  const render = (jobs) => {
    list.innerHTML = jobs
      .map(
        (j, i) => `<a class="job-row reveal reveal-delay-${Math.min(i % 6, 4)}" href="job.html?id=${j.id}">
          <div class="job-row-main">
            <span class="job-tag">${j.department}</span>
            <h3>${j.title}</h3>
            <div class="job-meta">
              <span>${j.location}</span>
              <span>${j.type}</span>
              <span>${j.seniority}</span>
              <span>${daysAgo(j.posted)}</span>
            </div>
          </div>
          <span class="job-row-arrow" aria-hidden="true">→</span>
        </a>`
      )
      .join("");

    const n = jobs.length;
    count.innerHTML = n
      ? `Showing <strong>${n}</strong> open role${n === 1 ? "" : "s"}`
      : "No roles match your filters";
    empty.hidden = n > 0;
    list.style.display = n ? "" : "none";

    window.observeReveals(list);
  };

  const apply = () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = JOBS.filter((j) => {
      if (deptFilter.value && j.department !== deptFilter.value) return false;
      if (locFilter.value && j.location !== locFilter.value) return false;
      if (typeFilter.value && j.type !== typeFilter.value) return false;
      if (seniorityFilter.value && j.seniority !== seniorityFilter.value)
        return false;
      if (!q) return true;
      const haystack = [
        j.title,
        j.department,
        j.location,
        j.type,
        j.seniority,
        j.summary,
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    });
    render(filtered);
  };

  searchInput.addEventListener("input", apply);
  [deptFilter, locFilter, typeFilter, seniorityFilter].forEach((s) =>
    s.addEventListener("change", apply)
  );
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    [deptFilter, locFilter, typeFilter, seniorityFilter].forEach(
      (s) => (s.value = "")
    );
    apply();
  });

  apply();
})();
