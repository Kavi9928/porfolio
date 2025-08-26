document.addEventListener('DOMContentLoaded', () => {
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	const navToggle = document.querySelector('.nav-toggle');
	const navList = document.querySelector('.nav-list');
	if (navToggle && navList) {
		navToggle.addEventListener('click', () => navList.classList.toggle('open'));
		navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
	}

	// Load and render projects
	loadProjects();

	// Scroll reveal animations
	setupScrollReveal();

	// Back to top button
	setupBackToTop();

	// Keep page at top on reload
	try {
		const nav = performance.getEntriesByType('navigation')[0];
		const isReload = nav ? nav.type === 'reload' : performance.navigation && performance.navigation.type === 1;
		if (isReload) {
			if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
			setTimeout(() => window.scrollTo(0, 0), 0);
		}
	} catch (e) { /* no-op */ }

	// Hide loader after first frame and ensure reduced-motion respected
	const loader = document.getElementById('loader');
	if (loader) {
		requestAnimationFrame(() => loader.classList.add('hidden'));
	}
});

async function loadProjects() {
	const grid = document.getElementById('projects-grid');
	if (!grid) return;

	try {
		// skeleton placeholders
		grid.innerHTML = createSkeletonHtml();
		const response = await fetch('data/projects.json', { cache: 'no-store' });
		if (!response.ok) throw new Error('Failed to load projects');
		const projects = await response.json();
		grid.innerHTML = projects.map(createProjectCardHtml).join('');
		// stagger in
		const cards = grid.querySelectorAll('.card');
		cards.forEach((card, i) => {
			setTimeout(() => card.classList.add('card-in'), i * 90);
		});
	} catch (error) {
		grid.innerHTML = '<p style="color:#93a1b3">Unable to load projects right now.</p>';
		console.error(error);
	}
}

function createProjectCardHtml(project) {
	const image = project.image || 'assets/img/placeholder.png';
	const tags = (project.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
	const links = [
		project.demo && `<a class="btn" href="${escapeAttr(project.demo)}" target="_blank" rel="noopener">Live</a>`,
		project.source && `<a class="btn" href="${escapeAttr(project.source)}" target="_blank" rel="noopener">Code</a>`,
		project.figma && `<a class="btn" href="${escapeAttr(project.figma)}" target="_blank" rel="noopener">Figma</a>`,
		project.behance && `<a class="btn" href="${escapeAttr(project.behance)}" target="_blank" rel="noopener">Behance</a>`,
		project.dribbble && `<a class="btn" href="${escapeAttr(project.dribbble)}" target="_blank" rel="noopener">Dribbble</a>`,
		project.caseStudy && `<a class="btn" href="${escapeAttr(project.caseStudy)}" target="_blank" rel="noopener">Case Study</a>`
	].filter(Boolean).join('');

	return `
		<article class="card">
			<img class="card-media" src="${escapeAttr(image)}" alt="${escapeAttr(project.title)}" loading="lazy" />
			<div class="card-body">
				<h3 class="card-title">${escapeHtml(project.title)}</h3>
				<p class="card-text">${escapeHtml(project.description)}</p>
				<div class="card-tags">${tags}</div>
				<div class="card-actions">${links}</div>
			</div>
		</article>
	`;
}

function createSkeletonHtml() {
	const item = `
		<div class="skeleton-card">
			<div class="skeleton-media s-shimmer"></div>
			<div class="skeleton-body">
				<div class="s-line"></div>
				<div class="s-line mid s-shimmer"></div>
				<div class="s-line mid"></div>
				<div class="s-line short s-shimmer"></div>
			</div>
		</div>
	`;
	return `<div class="skeleton-grid">${item.repeat(6)}</div>`;
}

function escapeHtml(str) {
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function escapeAttr(str) {
	return escapeHtml(str).replaceAll('"', '&quot;');
}

function setupScrollReveal() {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('in-view');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });

	document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupBackToTop() {
	const btn = document.createElement('button');
	btn.className = 'back-to-top';
	btn.setAttribute('aria-label', 'Back to top');
	btn.textContent = '↑';
	document.body.appendChild(btn);

	const toggle = () => {
		const show = window.scrollY > 300;
		btn.style.opacity = show ? '1' : '0';
		btn.style.pointerEvents = show ? 'auto' : 'none';
	};
	window.addEventListener('scroll', toggle, { passive: true });
	window.addEventListener('resize', toggle);
	toggle();

	btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

