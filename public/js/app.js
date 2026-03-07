import { initProposal } from './modules/proposal.js';
import { initCatalog } from './modules/catalog.js';
import { initImpact } from './modules/impact.js';
import { initWhatsapp } from './modules/whatsapp.js';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation handling
  const navLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.dashboard-section');

  function showSection(targetId) {
    sections.forEach(section => {
      if (section.id === targetId) {
        section.classList.remove('hidden');
        section.classList.add('animate-fade-in');
      } else {
        section.classList.add('hidden');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      if (href === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    history.pushState(null, null, `#${targetId}`);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      showSection(targetId);
    });
  });

  // Handle initial route
  const currentHash = window.location.hash.substring(1) || 'home';
  showSection(currentHash);

  // Initialize Modules
  initProposal();
  initCatalog();
  initImpact();
  initWhatsapp();

  // Dashboard Stats Animation (Mock)
  animateStats();
});

function animateStats() {
  const stats = [
    { id: 'stat-proposals', value: 124, label: 'Proposals Generated' },
    { id: 'stat-products', value: 850, label: 'Products Analyzed' },
    { id: 'stat-impact', value: '4.2t', label: 'Carbon Avoided' },
    { id: 'stat-logs', value: 1042, label: 'AI Logs Recorded' }
  ];

  stats.forEach(stat => {
    const el = document.getElementById(stat.id);
    if (el) {
      // Basic count-up or static set
      el.textContent = stat.value;
    }
  });
}
