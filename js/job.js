/* Obsidian Capital — job detail: render from ?id=, validate the apply form. */

(() => {
  const params = new URLSearchParams(location.search);
  const job = JOBS.find((j) => j.id === params.get("id"));

  const hero = document.getElementById("jobHero");
  const body = document.getElementById("jobBody");
  const aside = document.getElementById("jobAside");

  /* ---- Fallback for a missing or invalid id ---- */
  if (!job) {
    hero.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a><span>/</span><a href="careers.html">Open Roles</a>
      </nav>
      <h1 class="display-lg">This role has <em class="serif-italic">moved on.</em></h1>
      <p class="lede">The position you're looking for doesn't exist or has been filled.
      Every current opening is on the roles board.</p>
      <div><a href="careers.html" class="btn btn-solid btn-arrow">Browse Open Roles</a></div>`;
    document.getElementById("jobDetailSection").hidden = true;
    document.getElementById("apply").hidden = true;
    document.getElementById("similarSection").hidden = true;
    return;
  }

  document.title = `${job.title} — Careers at Obsidian Capital`;

  const fmtDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  /* ---- Hero ---- */
  hero.innerHTML = `
    <nav class="breadcrumb reveal visible" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span>
      <a href="careers.html">Open Roles</a><span>/</span>
      <a href="careers.html?dept=${encodeURIComponent(job.department)}">${job.department}</a>
    </nav>
    <h1 class="display-lg reveal visible reveal-delay-1">${job.title}</h1>
    <div class="job-meta reveal visible reveal-delay-2" style="font-size:0.95rem;">
      <span>${job.location}</span><span>${job.type}</span><span>${job.seniority}</span>
    </div>
    <div class="hero-actions reveal visible reveal-delay-3" style="margin-top:0.4rem;">
      <a href="#apply" class="btn btn-solid btn-arrow">Apply Now</a>
    </div>`;

  /* ---- Body ---- */
  const listItems = (arr) =>
    arr.map((item) => `<li>${item}</li>`).join("");
  body.innerHTML = `
    <section class="reveal">
      <h2>The role</h2>
      <p>${job.summary}</p>
    </section>
    <section class="reveal">
      <h2>What you'll do</h2>
      <ul class="styled-list">${listItems(job.responsibilities)}</ul>
    </section>
    <section class="reveal">
      <h2>What you'll bring</h2>
      <ul class="styled-list">${listItems(job.requirements)}</ul>
    </section>
    <section class="reveal">
      <h2>What we offer</h2>
      <ul class="styled-list">
        <li>Compensation of ${job.salary}, reviewed annually against the top of the market</li>
        <li>Comprehensive private healthcare, wellbeing allowance, and mental-health support</li>
        <li>Market-leading retirement contributions and equity participation where eligible</li>
        <li>Learning budget, sabbatical eligibility, and genuine internal mobility</li>
      </ul>
    </section>`;

  /* ---- Aside ---- */
  aside.innerHTML = `
    <div class="aside-cell"><dt>Department</dt><dd>${job.department}</dd></div>
    <div class="aside-cell"><dt>Location</dt><dd>${job.location}</dd></div>
    <div class="aside-cell"><dt>Type</dt><dd>${job.type}</dd></div>
    <div class="aside-cell"><dt>Level</dt><dd>${job.seniority}</dd></div>
    <div class="aside-cell"><dt>Compensation</dt><dd>${job.salary}</dd></div>
    <div class="aside-cell"><dt>Posted</dt><dd>${fmtDate(job.posted)}</dd></div>
    <div class="aside-cell apply-cell"><a href="#apply" class="btn btn-solid">Apply Now</a></div>`;

  /* ---- Similar roles: same department first, then same location ---- */
  const similar = JOBS.filter((j) => j.id !== job.id)
    .sort((a, b) => {
      const score = (j) =>
        (j.department === job.department ? 2 : 0) +
        (j.location === job.location ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
  document.getElementById("similarJobs").innerHTML = similar
    .map(
      (j) => `<a class="job-row reveal" href="job.html?id=${j.id}">
        <div class="job-row-main">
          <span class="job-tag">${j.department}</span>
          <h3>${j.title}</h3>
          <div class="job-meta"><span>${j.location}</span><span>${j.type}</span><span>${j.seniority}</span></div>
        </div>
        <span class="job-row-arrow" aria-hidden="true">→</span>
      </a>`
    )
    .join("");

  window.observeReveals();

  /* ---- Apply form validation ---- */
  const form = document.getElementById("applyForm");
  const success = document.getElementById("formSuccess");

  const validators = {
    fullName: (v) =>
      v.trim().length >= 2 ? "" : "Please enter your full name.",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ""
        : "Please enter a valid email address.",
    phone: (v) =>
      /^[+\d][\d\s().-]{6,19}$/.test(v.trim())
        ? ""
        : "Please enter a valid phone number.",
    linkedin: (v) =>
      !v.trim() || /^https?:\/\/\S+\.\S+/.test(v.trim())
        ? ""
        : "Please enter a valid URL (or leave this blank).",
    cv: (v, input) =>
      input.files && input.files.length ? "" : "Please attach your CV.",
    cover: (v) =>
      v.trim().length >= 30
        ? ""
        : "Tell us a little more — at least a couple of sentences.",
  };

  const validateField = (input) => {
    const check = validators[input.name];
    if (!check) return true;
    const message = check(input.value, input);
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(message));
    field.querySelector(".field-error").textContent = message;
    return !message;
  };

  form.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid"))
        validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll("input, textarea")];
    const results = inputs.map((input) => validateField(input));
    const firstInvalid = inputs.find((_, i) => !results[i]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const name = form.fullName.value.trim().split(/\s+/)[0];
    document.getElementById("successMsg").textContent =
      `Thank you, ${name}. Your application for ${job.title} is in. ` +
      "Our talent team will respond within ten business days — watch your inbox.";
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
