export function initCatalog() {
  const form = document.getElementById('catalog-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (data.materials) data.materials = data.materials.split(',').map(m => m.trim());
    
    toggleLoading('catalog', true);
    
    try {
      const res = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);
      
      renderCatalog(result);
    } catch (err) {
      showError('catalog', err.message);
    } finally {
      toggleLoading('catalog', false);
    }
  });
}

function toggleLoading(module, isLoading) {
  const btnText = document.getElementById(`${module}-btn-text`);
  const loader = document.getElementById(`${module}-loader`);
  const empty = document.getElementById(`${module}-result-empty`);
  const content = document.getElementById(`${module}-result-content`);
  const errorDiv = document.getElementById(`${module}-error`);
  
  if (isLoading) {
    btnText.textContent = 'Analyzing...';
    loader.classList.remove('hidden');
    empty.classList.add('hidden');
    content.classList.add('hidden');
    errorDiv?.classList.add('hidden');
  } else {
    btnText.textContent = 'Analyze Product';
    loader.classList.add('hidden');
  }
}

function showError(module, msg) {
  const errorDiv = document.getElementById(`${module}-error`);
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
}

function renderCatalog(data) {
  const content = document.getElementById('catalog-result-content');
  const empty = document.getElementById('catalog-result-empty');
  
  content.classList.remove('hidden');
  empty.classList.add('hidden');
  
  document.getElementById('catalog-primary').textContent = data.primaryCategory;
  document.getElementById('catalog-sub').textContent = data.subCategory;
  
  const filters = document.getElementById('catalog-filters');
  filters.innerHTML = data.sustainabilityFilters.map(f => `
    <span class="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full border border-green-200 font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
      <i class="fas fa-check-circle mr-1"></i> ${f}
    </span>
  `).join('');

  const tags = document.getElementById('catalog-tags');
  tags.innerHTML = data.seoTags.map(t => `
    <span class="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-lg border border-indigo-100 font-bold transition-all hover:bg-indigo-600 hover:text-white cursor-pointer">
      #${t}
    </span>
  `).join('');
}
