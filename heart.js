(function(){
  const form = document.getElementById("heartForm");
  const readout = document.getElementById("readout");
  const scoreValue = document.getElementById("scoreValue");
  const scoreStatus = document.getElementById("scoreStatus");
  const scoreNote = document.getElementById("scoreNote");

  function calc(){
    const data = new FormData(form);
    const keys = ["history","ecg","age","risk","troponin"];
    let total = 0;
    keys.forEach(k => total += parseInt(data.get(k) || "0", 10));

    scoreValue.innerHTML = `${total} <small>/ 10</small>`;

    let level, status, mace, advice;
    if (total <= 3){
      level = "low"; status = "خطورة منخفضة"; mace = "≈ 2.5٪";
      advice = "يُفكّر عادة بالخروج مع متابعة عيادية قريبة، حسب التقييم السريري الكامل.";
    } else if (total <= 6){
      level = "mid"; status = "خطورة متوسطة"; mace = "≈ 20.3٪";
      advice = "غالبًا ما تُستطب المراقبة وإجراء فحوصات إضافية (تسلسل تروبونين، تصوير).";
    } else {
      level = "high"; status = "خطورة مرتفعة"; mace = "≈ 72.7٪";
      advice = "يُنصح عادة بتقييم إكليلي عاجل واستشارة متخصص القلب دون تأخير.";
    }

    readout.dataset.level = level;
    scoreStatus.textContent = status;
    scoreNote.innerHTML = `<p>خطر الأحداث القلبية الكبرى (MACE) خلال 6 أسابيع: <span class="mono">${mace}</span></p><p>${advice}</p>`;
  }

  form.addEventListener("change", calc);
  calc();
})();
