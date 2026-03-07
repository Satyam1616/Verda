export function initImpact() {
  const form = document.getElementById('impact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    toggleLoading('impact', true);
    
    try {
      const res = await fetch('/api/generate-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);
      
      renderImpact(result);
    } catch (err) {
      showError('impact', err.message);
    } finally {
      toggleLoading('impact', false);
    }
  });
}

function toggleLoading(module, isLoading) {
  const btnText = document.getElementById(`${module}-btn-text`);
  const loader = document.getElementById(`${module}-loader`);
  const content = document.getElementById(`${module}-result-content`);
  const empty = document.getElementById(`${module}-result-empty`);
  const errorDiv = document.getElementById(`${module}-error`);
  
  if (isLoading) {
    btnText.textContent = 'Generating Report...';
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    empty.classList.add('hidden');
    errorDiv?.classList.add('hidden');
  } else {
    btnText.textContent = 'Generate Impact Report';
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

function renderImpact(data) {
  const content = document.getElementById('impact-result-content');
  const empty = document.getElementById('impact-result-empty');
  
  content.classList.remove('hidden');
  empty.classList.add('hidden');
  
  document.getElementById('impact-plastic').textContent = data.plasticSaved;
  document.getElementById('impact-carbon').textContent = data.carbonAvoided;
  document.getElementById('impact-local').textContent = data.localSourcing;
  document.getElementById('impact-statement').textContent = data.impactStatement;
}
