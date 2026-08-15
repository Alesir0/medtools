(function(){
  const drugSelect = document.getElementById("drugSelect");
  const weightInput = document.getElementById("weightInput");
  const drugMeta = document.getElementById("drugMeta");
  const readout = document.getElementById("readout");
  const doseValue = document.getElementById("doseValue");
  const doseStatus = document.getElementById("doseStatus");
  const doseNote = document.getElementById("doseNote");
  const noDrugsAlert = document.getElementById("noDrugsAlert");

  let drugs = getDrugs();

  function populateSelect(){
    drugSelect.innerHTML = "";
    if (!drugs.length){
      noDrugsAlert.style.display = "flex";
      drugSelect.disabled = true;
      return;
    }
    noDrugsAlert.style.display = "none";
    drugSelect.disabled = false;
    const byCategory = {};
    drugs.forEach(d => { (byCategory[d.category||"عام"] ||= []).push(d); });
    Object.keys(byCategory).forEach(cat => {
      const og = document.createElement("optgroup");
      og.label = cat;
      byCategory[cat].forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name;
        og.appendChild(opt);
      });
      drugSelect.appendChild(og);
    });
  }

  function currentDrug(){
    return drugs.find(d => d.id === drugSelect.value);
  }

  function renderMeta(d){
    if (!d){ drugMeta.style.display = "none"; return; }
    drugMeta.style.display = "flex";
    const maxTxt = d.maxDose ? `الحد الأقصى: <strong class="mono">${d.maxDose} ${d.unit}</strong>` : "بدون حد أقصى مسجّل";
    const minTxt = d.minDose ? ` · الحد الأدنى: <strong class="mono">${d.minDose} ${d.unit}</strong>` : "";
    drugMeta.innerHTML = `<div>
      <div><strong>${d.route || ""}</strong> — ${maxTxt}${minTxt}</div>
      ${d.notes ? `<div style="margin-top:4px;">${d.notes}</div>` : ""}
    </div>`;
  }

  function calc(){
    const d = currentDrug();
    renderMeta(d);
    const w = parseFloat(weightInput.value);

    if (!d){
      resetReadout("اختر دواءً من القائمة");
      return;
    }
    if (!w || w <= 0){
      resetReadout("أدخل وزن الطفل بالكيلوغرام");
      return;
    }
    if (w > 150){
      resetReadout("تحقق من الوزن المُدخل (قيمة غير معتادة)", "high");
      return;
    }

    let dose = +(w * d.dosePerKg).toFixed(3);
    let capped = false, floored = false;

    if (d.maxDose && dose > d.maxDose){ dose = d.maxDose; capped = true; }
    if (d.minDose && dose < d.minDose){ dose = d.minDose; floored = true; }

    doseValue.innerHTML = `${dose} <small>${d.unit}</small>`;

    let level = "low", statusTxt = "ضمن النطاق المحسوب";
    if (capped){ level = "mid"; statusTxt = "تم تطبيق الحد الأقصى للجرعة"; }
    if (floored){ level = "mid"; statusTxt = "تم تطبيق الحد الأدنى للجرعة"; }

    readout.dataset.level = level;
    doseStatus.textContent = statusTxt;

    let volTxt = "";
    if (d.concentration){
      const vol = +(dose / d.concentration).toFixed(2);
      volTxt = `<p>الحجم المكافئ: <span class="mono">${vol} مل</span> (تركيز ${d.concentration} ملغ/مل)</p>`;
    }
    doseNote.innerHTML = `<p>${d.name} — ${d.route || ""} · جرعة القاعدة: <span class="mono">${d.dosePerKg} ${d.unit}/كغ</span></p>${volTxt}`;
  }

  function resetReadout(msg, level){
    doseValue.textContent = "—";
    doseStatus.textContent = msg;
    doseNote.innerHTML = "";
    readout.dataset.level = level || "low";
  }

  drugSelect.addEventListener("change", calc);
  weightInput.addEventListener("input", calc);

  populateSelect();
  calc();
})();
