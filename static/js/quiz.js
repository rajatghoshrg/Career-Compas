document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const selects = document.querySelectorAll("select");
  
  // Create progress bar
  const progressBar = document.createElement("div");
  progressBar.style.height = "10px";
  progressBar.style.background = "#00ccff";
  progressBar.style.borderRadius = "5px";
  progressBar.style.width = "0%";
  progressBar.style.transition = "width 0.3s ease";
  form.prepend(progressBar);

  selects.forEach(select => {
    select.addEventListener("change", updateProgress);
  });

  function updateProgress() {
    const answered = Array.from(selects).filter(s => s.value !== "");
    const percent = (answered.length / selects.length) * 100;
    progressBar.style.width = percent + "%";
  }
});
