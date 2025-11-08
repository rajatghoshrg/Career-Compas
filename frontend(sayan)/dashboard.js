// Animate progress circle (optional)
window.addEventListener('DOMContentLoaded', () => {
  const progressPath = document.querySelector('.progress');
  const percentText = document.querySelector('.percent');
  let progress = 0;
  const target = 70; // change this to update progress %
  
  const animate = setInterval(() => {
    if (progress >= target) clearInterval(animate);
    progress++;
    progressPath.setAttribute('stroke-dasharray', `${progress}, 100`);
    percentText.textContent = `${progress}%`;
  }, 20);
});
