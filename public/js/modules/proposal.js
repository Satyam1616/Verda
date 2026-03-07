export function initProposal() {
  const form = document.getElementById('proposal-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    toggleLoading('proposal', true);
    
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);
      
      renderProposal(result);
    } catch (err) {
      showError('proposal', err.message);
    } finally {
      toggleLoading('proposal', false);
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
    btnText.textContent = 'Processing...';
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    empty.classList.add('hidden');
    errorDiv?.classList.add('hidden');
  } else {
    btnText.textContent = module === 'proposal' ? 'Generate Proposal' : 'Analyze Product';
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

function renderProposal(data) {
  const content = document.getElementById('proposal-result-content');
  const empty = document.getElementById('proposal-result-empty');
  
  content.classList.remove('hidden');
  empty.classList.add('hidden');
  
  document.getElementById('proposal-summary').textContent = data.impactPositioningSummary;
  document.getElementById('proposal-fit').textContent = data.clientFitExplanation;
  
  // Render Products
  const productsBody = document.getElementById('proposal-products');
  productsBody.innerHTML = data.productMix.map(p => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-semibold text-gray-900">${p.name}</div>
        <div class="text-xs text-gray-500 max-w-xs truncate">${p.description}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">${p.quantity}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">$${p.unitCost}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
            <div class="bg-green-500 h-1.5 rounded-full" style="width: ${p.sustainabilityScore * 10}%"></div>
          </div>
          <span class="text-xs font-bold text-green-700">${p.sustainabilityScore}/10</span>
        </div>
      </td>
    </tr>
  `).join('');

  // Render Budget
  const budget = data.budgetAllocation;
  const budgetContainer = document.getElementById('proposal-budget');
  budgetContainer.innerHTML = `
    <div class="flex justify-between items-center py-2"><span class="text-gray-500">Products Total</span><span class="font-bold text-gray-900">$${budget.totalProductCost}</span></div>
    <div class="flex justify-between items-center py-2"><span class="text-gray-500">Logistics & Handling</span><span class="font-bold text-gray-900">$${budget.logisticsCost}</span></div>
    <div class="flex justify-between items-center py-2"><span class="text-gray-500">Contingency</span><span class="font-bold text-gray-900">$${budget.contingency}</span></div>
    <div class="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center mt-2"><span class="font-extrabold text-gray-900 text-lg uppercase tracking-wider">Estimated Total</span><span class="font-black text-2xl text-green-600">$${budget.totalEstimatedBudget}</span></div>
  `;
}
