(function(){
  const form = document.getElementById("gcsForm");
  const readout = document.getElementById("readout");
  const scoreValue = document.getElementById("scoreValue");
  const scoreStatus = document.getElementById("scoreStatus");
  const scoreNote = document.getElementById("scoreNote");

  function calc(){
    const data = new FormData(form);
    const e = parseInt(data.get("eye"), 10);
    const v = parseInt(data.get("verbal"), 10);
    const m = parseInt(data.get("motor"), 10);
    const total = e + v + m;

    scoreValue.innerHTML = `${total} <small>/ 15</small>`;

    let level, status, advice;
    if (total >= 13){
      level = "low"; status = "إصابة خفيفة"; 
      advice = "مستوى وعي شبه طبيعي؛ يُتابع حسب السياق السريري.";
    } else if (total >= 9){
      level = "mid"; status = "إصابة متوسطة";
      advice = "تُستطب مراقبة عصبية دقيقة ومتكررة.";
    } else {
      level = "high"; status = "إصابة شديدة";
      advice = "يُفكّر عادة بحماية مجرى الهواء والتنبيب عند GCS ≤ 8، حسب التقييم السريري الكامل.";
    }

    readout.dataset.level = level;
    scoreStatus.textContent = status;
    scoreNote.innerHTML = `<p>التسجيل التفصيلي: <span class="mono">E${e} V${v} M${m}</span></p><p>${advice}</p>`;
  }

  form.addEventListener("change", calc);
  calc();
})();
