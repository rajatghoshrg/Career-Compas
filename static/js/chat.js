document.addEventListener('DOMContentLoaded', () => {
  const floatBtn = document.getElementById('chat-floating');
  if (floatBtn) {
    floatBtn.addEventListener('click', () => window.location.href = '/chat');
  }

  const chatForm = document.getElementById('chatForm');
  if (!chatForm) return;
  const chatWindow = document.getElementById('chatWindow');

  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const inp = document.getElementById('chatInput');
    const msg = inp.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    inp.value = '';
    appendMessage('bot', 'Typing...', true);

    const res = await fetch('/get_response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    removeTyping();
    appendMessage('bot', data.reply);
  });

  function appendMessage(who, text, isTyping = false) {
    const div = document.createElement('div');
    div.className = `bubble ${who}`;
    div.textContent = text;
    if (isTyping) div.dataset.typing = '1';
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeTyping() {
    const t = chatWindow.querySelector('[data-typing]');
    if (t) t.remove();
  }
});
