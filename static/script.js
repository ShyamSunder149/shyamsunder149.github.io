document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const observeElements = () => {
        document.querySelectorAll('.fade-on-scroll').forEach(el => observer.observe(el));
    };
    observeElements();

    // 2. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. GitHub Projects
    fetchProjects("ShyamSunder149");

    function fetchProjects(username) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
                return response.json();
            })
            .then(repos => {
                const projects = repos.filter(repo => repo.topics && repo.topics.includes('side-project'));

                container.innerHTML = '';
                if (projects.length === 0) {
                    container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">No projects found with topic "side-project".</p>';
                    return;
                }

                projects.forEach(repo => {
                    const card = createProjectCard(repo);
                    container.appendChild(card);
                });
                observeElements();
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
                container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">Failed to load projects from GitHub.</p>';
            });
    }

    function createProjectCard(repo) {
        const article = document.createElement('article');
        article.className = 'project-card card fade-on-scroll';

        const name = formatRepoName(repo.name);
        const description = repo.description || 'No description available.';

        article.innerHTML = `
            <div class="card-content">
                <h3>${name}</h3>
                <p>${description}</p>
                <a href="${repo.html_url}" target="_blank" class="project-link">
                    View Project 
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
            </div>
        `;
        return article;
    }

    function formatRepoName(name) {
        return name.split('-').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // 4. Blog System
    fetchBlogs();

    window.allBlogs = [];
    window.activeTag = null;
    window.allTags = new Set();

    function fetchBlogs() {
        fetch('data/blogs.json')
            .then(res => res.json())
            .then(blogs => {
                window.allBlogs = blogs;

                // Collect all unique tags
                window.allTags = new Set();
                blogs.forEach(blog => {
                    if (blog.tags && Array.isArray(blog.tags)) {
                        blog.tags.forEach(tag => window.allTags.add(tag));
                    }
                });

                renderTagFilter();
                renderBlogs(blogs);
            })
            .catch(err => {
                console.error('Error loading blogs:', err);
                const container = document.getElementById('blogs-container');
                if (container) {
                    container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">Failed to load articles.</p>';
                }
            });
    }

    window.renderTagFilter = function () {
        const filterContainer = document.getElementById('all-tags-filter');
        if (!filterContainer) return;

        filterContainer.innerHTML = '';

        // 'All' tag
        const allBtn = document.createElement('span');
        allBtn.className = `blog-tag ${window.activeTag === null ? 'active' : ''}`;
        allBtn.textContent = 'All';
        allBtn.onclick = () => clearBlogFilter();
        filterContainer.appendChild(allBtn);

        // Individual tags
        Array.from(window.allTags).sort().forEach(tag => {
            const tagBtn = document.createElement('span');
            tagBtn.className = `blog-tag ${window.activeTag === tag ? 'active' : ''}`;
            // Capitalize and no hash
            tagBtn.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagBtn.onclick = () => filterBlogs(tag);
            filterContainer.appendChild(tagBtn);
        });
    };

    window.renderBlogs = function (blogs) {
        const container = document.getElementById('blogs-container');
        if (!container) return;

        container.innerHTML = '';

        if (blogs.length === 0) {
            container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">No articles found.</p>';
            return;
        }

        blogs.forEach(blog => {
            const card = document.createElement('article');
            card.className = 'card fade-on-scroll';
            card.style.cursor = 'pointer';

            // Build tags HTML - Capitalize and no hash
            const tagsHtml = blog.tags.map(tag =>
                `<span class="blog-tag" style="border: none; background: rgba(255,255,255,0.05); font-size: 0.75rem; padding: 0.2rem 0.6rem; pointer-events: auto;" onclick="event.stopPropagation(); filterBlogs('${tag}')">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
            ).join('');

            card.innerHTML = `
                <div class="card-content" onclick="openBlog('${blog.file}')">
                    <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary); margin-bottom: 0.5rem; display: block;">${blog.date}</span>
                    <h3>${blog.title}</h3>
                    <p>${blog.excerpt}</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: auto;">
                        ${tagsHtml}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        observeElements();
    };

    window.filterBlogs = function (tag) {
        window.activeTag = tag;
        const filtered = window.allBlogs.filter(b => b.tags.includes(tag));

        renderTagFilter(); // Re-render to update active state
        renderBlogs(filtered);
    };

    window.clearBlogFilter = function () {
        window.activeTag = null;
        renderTagFilter(); // Re-render to update active state
        renderBlogs(window.allBlogs);
    };

    window.openBlog = function (filename) {
        const modal = document.getElementById('blog-modal');
        const contentBody = document.getElementById('blog-content-body');

        if (!modal || !contentBody) return;

        // Show loading or spinner?
        contentBody.innerHTML = '<p style="text-align:center;">Loading...</p>';
        modal.style.display = 'block';

        fetch(`blogs/${filename}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.text();
            })
            .then(markdown => {
                contentBody.innerHTML = marked.parse(markdown);
            })
            .catch(err => {
                contentBody.innerHTML = '<p>Error loading article.</p>';
            });
    };

    window.closeModal = function () {
        const modal = document.getElementById('blog-modal');
        if (modal) modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        const modal = document.getElementById('blog-modal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
