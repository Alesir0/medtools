(function(){
  const gate = document.getElementById("gate");
  const panelArea = document.getElementById("panelArea");
  const gateForm = document.getElementById("gateForm");
  const passInput = document.getElementById("passInput");
  const gateError = document.getElementById("gateError");

  const drugForm = document.getElementById("drugForm");
  const formTitle = document.getElementById("formTitle");
  const drugIdField = document.getElementById("drugId");
  const cancelEdit = document.getElementById("cancelEdit");
  const drugsTbody = document.getElementById("drugsTbody");
  const emptyState = document.getElementById("emptyState");

  const fName = document.getElementById("fName");
  const fCategory = document.getElementById("fCategory");
  const fRoute = document.getElementById("fRoute");
  const fUnit = document.getElementById("fUnit");
  const fDosePerKg = document.getElementById("fDosePerKg");
  const fMaxDose = document.getElementById("fMaxDose");
  const fMinDose = document.getElementById("fMinDose");
  const fConcentration = document.getElementById("fConcentration");
  const fNotes = document.getElementById("fNotes");

  function showApp(){
    gate.style.display = "none";
    panelArea.style.display = "block";
    renderTable();
  }

  function checkGate(){
    if (isAdminUnlocked()) showApp();
  }

  gateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (passInput.value === getAdminPass()){
      unlockAdmin();
      gateError.style.display = "none";
      showApp();
    } else {
      gateError.style.display = "flex";
    }
  });

  document.getElementById("lockBtn").addEventListener("click", () => {
    lockAdmin();
    location.reload();
  });

  function renderTable(){
    const drugs = getDrugs();
    drugsTbody.innerHTML = "";
    emptyState.style.display = drugs.length ? "none" : "block";
    drugs.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.category || "—")}</td>
        <td class="num">${d.dosePerKg} ${escapeHtml(d.unit)}/كغ</td>
        <td class="num">${d.maxDose ? d.maxDose + " " + escapeHtml(d.unit) : "—"}</td>
        <td>${escapeHtml(d.route || "—")}</td>
        <td>
          <div class="row-actions">
            <button class="btn ghost sm" data-edit="${d.id}">تعديل</button>
            <button class="btn danger sm" data-del="${d.id}">حذف</button>
          </div>
        </td>`;
      drugsTbody.appendChild(tr);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }

  drugsTbody.addEventListener("click", (e) => {
    const editId = e.target.getAttribute("data-edit");
    const delId = e.target.getAttribute("data-del");
    if (editId) loadForEdit(editId);
    if (delId){
      if (confirm("تأكيد حذف هذا الدواء من القائمة؟")){
        deleteDrug(delId);
        renderTable();
      }
    }
  });

  function loadForEdit(id){
    const d = getDrugs().find(x => x.id === id);
    if (!d) return;
    drugIdField.value = d.id;
    fName.value = d.name;
    fCategory.value = d.category || "";
    fRoute.value = d.route || "";
    fUnit.value = d.unit || "mg";
    fDosePerKg.value = d.dosePerKg;
    fMaxDose.value = d.maxDose ?? "";
    fMinDose.value = d.minDose ?? "";
    fConcentration.value = d.concentration ?? "";
    fNotes.value = d.notes || "";
    formTitle.textContent = "تعديل دواء: " + d.name;
    cancelEdit.style.display = "inline-flex";
    drugForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm(){
    drugForm.reset();
    drugIdField.value = "";
    formTitle.textContent = "إضافة دواء جديد";
    cancelEdit.style.display = "none";
  }

  cancelEdit.addEventListener("click", resetForm);

  drugForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = drugIdField.value || slugify(fName.value);
    const drug = {
      id,
      name: fName.value.trim(),
      category: fCategory.value.trim() || "عام",
      route: fRoute.value.trim(),
      unit: fUnit.value,
      dosePerKg: parseFloat(fDosePerKg.value),
      maxDose: fMaxDose.value ? parseFloat(fMaxDose.value) : null,
      minDose: fMinDose.value ? parseFloat(fMinDose.value) : null,
      concentration: fConcentration.value ? parseFloat(fConcentration.value) : null,
      notes: fNotes.value.trim(),
    };
    upsertDrug(drug);
    renderTable();
    resetForm();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("سيؤدي هذا إلى استبدال القائمة الحالية بالقائمة الافتراضية. متابعة؟")){
      resetDrugsToDefault();
      renderTable();
    }
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(getDrugs(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "drugs-export.json";
    a.click();
  });

  document.getElementById("passForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const p1 = document.getElementById("newPass1").value;
    const p2 = document.getElementById("newPass2").value;
    if (p1 !== p2){
      alert("كلمتا المرور غير متطابقتين.");
      return;
    }
    setAdminPass(p1);
    document.getElementById("passForm").reset();
    alert("تم تحديث كلمة المرور بنجاح.");
  });

  checkGate();
})();
