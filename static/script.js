document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observerInstance.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const observeElements = () => {
        document.querySelectorAll('.fade-on-scroll').forEach(el => observer.observe(el));
    };
    observeElements();

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

    fetchProjects('ShyamSunder149');
    fetchSkills();
    fetchExperience();

    function fetchProjects(username) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
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
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function fetchSkills() {
        const container = document.getElementById('skills-container');
        if (!container) return;

        fetch('data/skills.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch skills config');
                return res.json();
            })
            .then(skills => {
                container.innerHTML = '';
                if (!Array.isArray(skills) || skills.length === 0) {
                    container.innerHTML = '<p class="text-secondary">No skills found.</p>';
                    return;
                }

                skills.forEach(skill => {
                    const tag = document.createElement('div');
                    tag.className = 'skill-tag';
                    const iconClass = getIconClass(skill);
                    tag.innerHTML = `<i class="${iconClass}"></i> ${skill}`;
                    container.appendChild(tag);
                });
                observeElements();
            })
            .catch(err => {
                console.error('Error loading skills:', err);
                container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center;">Failed to load skills.</p>';
            });
    }

    function getIconClass(skill) {
        const map = {
            'Go': 'devicon-go-original-wordmark colored',
            'Docker': 'devicon-docker-plain colored',
            'Kubernetes': 'devicon-kubernetes-plain colored',
            'Python': 'devicon-python-plain colored',
            'MySQL': 'devicon-mysql-plain colored',
            'Linux': 'devicon-linux-plain colored',
            'Redis': 'devicon-redis-plain colored',
            'GCP': 'devicon-googlecloud-plain colored',
            'AWS': 'devicon-amazonwebservices-plain-wordmark colored',
            'React': 'devicon-react-original colored',
            'TypeScript': 'devicon-typescript-plain colored',
            'PostgreSQL': 'devicon-postgresql-plain colored',
            'gRPC': 'devicon-grpc-plain colored',
            'Terraform': 'devicon-terraform-plain colored'
        };
        return map[skill] || `devicon-${skill.toLowerCase()}-plain colored`;
    }

    function fetchExperience() {
        const container = document.getElementById('experience-container');
        if (!container) return;

        fetch('data/experience.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch experience');
                return res.json();
            })
            .then(experiences => {
                container.innerHTML = '';
                if (!Array.isArray(experiences) || experiences.length === 0) {
                    container.innerHTML = '<p class="text-secondary" style="text-align: center;">No experience found.</p>';
                    return;
                }

                experiences.forEach(exp => {
                    const item = document.createElement('div');
                    item.className = 'timeline-item fade-on-scroll';

                    const points = exp.description.split('#').map(p => p.trim()).filter(Boolean);
                    let descriptionHtml = '';
                    if (points.length > 0) {
                        descriptionHtml = `<ul>${points.map(point => `<li>${point}</li>`).join('')}</ul>`;
                    }

                    item.innerHTML = `
                        <div class="timeline-marker"></div>
                        <div class="timeline-content card">
                            <div class="timeline-header">
                                <h3>${exp.role}</h3>
                                <span class="timeline-date">${exp.duration}</span>
                            </div>
                            <h4 class="company-name">${exp.company}</h4>
                            ${descriptionHtml}
                        </div>
                    `;
                    container.appendChild(item);
                });

                observeElements();
            })
            .catch(err => {
                console.error('Error loading experience:', err);
                container.innerHTML = '<p class="text-secondary" style="text-align: center;">Failed to load experience.</p>';
            });
    }
});
