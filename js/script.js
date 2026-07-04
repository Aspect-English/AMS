const BASE_API =
"https://script.google.com/macros/s/AKfycbwYgAdPpp-HDhm1tbppoLSfhetouCkMW67gaiSJAe0Tknc1G9HZGBPnGiY2KFOIgn3t/exec";

const API = BASE_API + "?action=getCases";

let allCases = [];
let currentCase = null;

document.addEventListener("DOMContentLoaded", () => {
  loadEnterpriseCases();

  document.getElementById("searchInput").addEventListener("input", renderCases);
  document.getElementById("dateFilter").addEventListener("change", renderCases);
  document.getElementById("statusFilter").addEventListener("change", renderCases);
});

async function loadEnterpriseCases() {
  const caseList = document.getElementById("caseList");
  const count = document.getElementById("enterpriseCount");

  caseList.innerHTML = "<p class='empty'>讀取中...</p>";

  try {
    const response = await fetch(API);
    const result = await response.json();

    if (!result.success) throw new Error("API Error");

    allCases = result.data.reverse();

    const pending = allCases.filter(item => item["狀態"] === "待聯繫").length;
    count.textContent = pending;

    renderCases();

  } catch (err) {
    console.log(err);
    caseList.innerHTML = `<p style="color:red">無法連線 Apps Script</p>`;
  }
}

function renderCases() {
  const caseList = document.getElementById("caseList");
  const keyword = document.getElementById("searchInput").value.trim();
  const date = document.getElementById("dateFilter").value;
  const status = document.getElementById("statusFilter").value;

  let filtered = allCases.filter(item => {
    const company = item["公司名稱"] || "";
    const contact = item["聯絡人"] || "";
    const created = String(item["建立時間"] || "").substring(0, 10);
    const itemStatus = item["狀態"] || "";

    const matchKeyword =
      !keyword || company.includes(keyword) || contact.includes(keyword);

    const matchDate =
      !date || created === date;

    const matchStatus =
      !status || itemStatus === status;

    return matchKeyword && matchDate && matchStatus;
  });

  if (filtered.length === 0) {
    caseList.innerHTML = `<p class="empty">目前沒有符合條件的案件</p>`;
    return;
  }

  caseList.innerHTML = "";

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "case-item";

    const statusText = item["狀態"] || "待聯繫";

    div.innerHTML = `
      <div>
        <div class="case-title">${item["公司名稱"] || "未填公司"}</div>
        <div class="case-sub">${item["聯絡人"] || ""}｜${item["案件編號"] || ""}</div>
      </div>

      <div>${item["方案類型"] || ""}</div>

      <div>${String(item["建立時間"] || "").substring(0, 10)}</div>

      <div>
        <span class="badge status-${statusText}">
          ${statusText}
        </span>
      </div>
    `;

    div.addEventListener("click", () => openModal(item));
    caseList.appendChild(div);
  });
}

function openModal(item) {
  currentCase = item;

  document.getElementById("modalCompany").textContent =
    item["公司名稱"] || "未填公司名稱";

  document.getElementById("modalStatus").value =
    item["狀態"] || "待聯繫";

  const fields = [
    "案件編號",
    "建立時間",
    "方案類型",
    "課程種類",
    "公司名稱",
    "聯絡人",
    "連絡電話",
    "E-mail",
    "預計人數",
    "預計總時數",
    "預算範圍",
    "每週次數/天數",
    "其他時段需求",
    "希望開課日期",
    "上課地點",
    "狀態"
  ];

  document.getElementById("modalContent").innerHTML = fields.map(key => `
    <div class="detail-row">
      <strong>${key}</strong>
      <span>${item[key] || "無"}</span>
    </div>
  `).join("");

  document.getElementById("caseModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("caseModal").classList.add("hidden");
}

async function saveStatus() {
  if (!currentCase) return;

  const newStatus = document.getElementById("modalStatus").value;
  const rowNumber = currentCase.rowNumber;

  const url =
    BASE_API +
    "?action=updateStatus" +
    "&rowNumber=" + encodeURIComponent(rowNumber) +
    "&status=" + encodeURIComponent(newStatus);

  await fetch(url);

  alert("狀態已更新");

  closeModal();
  loadEnterpriseCases();
}

function setActiveNav(el) {
  document.querySelectorAll("nav a").forEach(a => {
    a.classList.remove("active");
  });

  el.classList.add("active");
}

function scrollToEnterprise(el) {
  setActiveNav(el);

  document.querySelector(".panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
