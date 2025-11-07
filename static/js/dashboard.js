document.addEventListener("DOMContentLoaded", () => {
  const skillContainer = document.getElementById("skills");

  // Default skills if none exist
  const defaultSkills = {
    "Python": 60,
    "Communication": 40,
    "Problem Solving": 70
  };

  const skills = JSON.parse(localStorage.getItem("skills")) || defaultSkills;
  renderSkills();

  function renderSkills() {
    skillContainer.innerHTML = "";
    for (const [skill, value] of Object.entries(skills)) {
      const div = document.createElement("div");
      div.className = "skill";
      div.innerHTML = `
        <strong>${skill}</strong>
        <input type="range" min="0" max="100" value="${value}" 
               onchange="updateSkill('${skill}', this.value)">
        <progress value="${value}" max="100"></progress>
        <span>${value}%</span>
      `;
      skillContainer.appendChild(div);
    }
  }

  window.updateSkill = (skill, val) => {
    skills[skill] = parseInt(val);
    localStorage.setItem("skills", JSON.stringify(skills));
    renderSkills();
  };
});
