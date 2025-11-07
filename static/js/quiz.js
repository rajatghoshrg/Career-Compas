document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quizForm');
  if (!form) return;
  const total = document.querySelectorAll('.qcard').length;
  const progress = document.getElementById('quizProgress');

  form.addEventListener('change', () => {
    const answered = form.querySelectorAll('input:checked').length;
    const pct = Math.round((answered / total) * 100);
    progress.style.width = pct + '%';
  });
});
