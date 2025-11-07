document.addEventListener('DOMContentLoaded', () => {
  const skillsContainer = document.getElementById('skillsContainer');
  const addForm = document.getElementById('addSkillForm');
  const skillName = document.getElementById('skillName');
  const skillState = document.getElementById('skillState');

  let userData = window.initialUserData || { skills: {} };
  const saved = localStorage.getItem('career_user_data');
  if (saved) userData = JSON.parse(saved);

  function render() {
    skillsContainer.innerHTML = '';
    for (let [name, state] of Object.entries(userData.skills || {})) {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<strong>${name}</strong> — ${state} <button data-skill=\"${name}\">Toggle</button>`;
      skillsContainer.appendChild(div);
    }
    localStorage.setItem('career_user_data', JSON.stringify(userData));
  }

  addForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = skillName.value.trim();
    const state = skillState.value;
    if (!name) return;
    userData.skills[name] = state;
    skillName.value = '';
    render();
  });

  skillsContainer.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      const s = e.target.dataset.skill;
      userData.skills[s] = userData.skills[s] === 'learned' ? 'in_progress' : 'learned';
      render();
    }
  });

  render();
});
