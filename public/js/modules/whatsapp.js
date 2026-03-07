export function initWhatsapp() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const chatWindow = document.getElementById('chat-window');
  const chatLogs = document.getElementById('chat-logs');
  const escalationAlert = document.getElementById('escalation-alert');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Add user message to UI
    appendMessage('user', message);
    input.value = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // Simulate AI typing delay
      setTimeout(() => {
        appendMessage('bot', data.response);
        updateLogs(data.reasoning);
        if (data.escalate) {
          escalationAlert.classList.remove('hidden');
        } else {
          escalationAlert.classList.add('hidden');
        }
      }, 800);
      
    } catch (err) {
      appendMessage('bot', "Error: " + err.message);
    }
  });

  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;
    
    div.innerHTML = `
      <div class="${role === 'user' ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'} rounded-2xl p-4 shadow-sm max-w-[80%]">
        <p class="text-sm">${text}</p>
        <p class="text-[10px] mt-1 opacity-50 text-right">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    `;
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function updateLogs(reasoning) {
    const logDiv = document.createElement('div');
    logDiv.className = "bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-500 animate-fade-in";
    logDiv.textContent = reasoning;
    chatLogs.prepend(logDiv);
  }
}
