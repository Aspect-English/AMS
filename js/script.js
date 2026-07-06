/* ===========================
   AOS / AMS Script v1.1
=========================== */


/* ---------- Login Check ---------- */

if (localStorage.getItem("ams_logged_in") !== "true") {
  window.location.href = "login.html";
}


/* ---------- API Setting ---------- */

const BASE_API =
  "https://script.google.com/macros/s/AKfycbwYgAdPpp-HDhm1tbppoLSfhetouCkMW67gaiSJAe0Tknc1G9HZGBPnGiY2KFOIgn3t/exec";

const API = BASE_API + "?action=getCases";


/* ---------- Global Variables ---------- */

let allCases = [];
let currentCase = null;


/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
   initTheme();
   initGlobalSearch();
  const userName = localStorage.getItem("ams_user_name") || "使用者";
  const userRole = localStorage.getItem("ams_user_role") || "";

  const loginUser = document.getElementById("loginUser");
  if (loginUser) {
    loginUser.textContent = `${userName}｜${userRole}`;
  }

  loadEnterpriseCases();

  const searchInput = document.getElementById("searchInput");
  const dateFilter = document.getElementById("dateFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (searchInput) searchInput.addEventListener("input", renderCases);
  if (dateFilter) dateFilter.addEventListener("change", renderCases);
  if (statusFilter) statusFilter.addEventListener("change", renderCases);
});


/* ---------- Logout ---------- */

function logout() {
  localStorage.removeItem("ams_logged_in");
  localStorage.removeItem("ams_user_name");
  localStorage.removeItem("ams_user_role");
  window.location.href = "login.html";
}


/* ---------- Page Switch ---------- */

function showPage(page, el) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active-page");
  });

  const targetPage = document.getElementById(page + "Page");

  if (targetPage) {
    targetPage.classList.add("active-page");
  }

  document.querySelectorAll(".sidebar nav a").forEach(a => {
    a.classList.remove("active");
  });

  if (el) {
    el.classList.add("active");
  }

  const titles = {
    dashboard: ["雅斯貝管理中心", "整合企業方案、K書中心與營運數據"],
    enterprise: ["企業方案", "企業合作案件管理"],
    kstudy: ["K書中心", "預約與座位管理"],
    ai: ["AI 助理", "營運提醒與分析"],
    settings: ["系統設定", "平台基本設定"]
  };

  if (titles[page]) {
    document.getElementById("pageTitle").innerText = titles[page][0];
    document.getElementById("pageSubtitle").innerText = titles[page][1];
  }

  if (page === "enterprise") {
    loadEnterpriseCases();
  }
}


/* ---------- Enterprise CRM ---------- */

async function loadEnterpriseCases() {
  const caseList = document.getElementById("caseList");
  const count = document.getElementById("enterpriseCount");
  const total = document.getElementById("enterpriseTotal");

  if (caseList) {
    caseList.innerHTML = "<p class='empty'>讀取中...</p>";
  }

  try {
    const response = await fetch(API);
    const result = await response.json();

    if (!result.success) throw new Error("API Error");

    allCases = result.data.reverse();

    const pending = allCases.filter(item => item["狀態"] === "待聯繫").length;

    if (count) count.textContent = pending;
    if (total) total.textContent = allCases.length;

   updateNotifications();
   renderCases();

  } catch (err) {
    console.log(err);

    if (caseList) {
      caseList.innerHTML = `<p style="color:red">無法連線 Apps Script</p>`;
    }
  }
}


function renderCases() {
  const caseList = document.getElementById("caseList");

  if (!caseList) return;

  const keyword = document.getElementById("searchInput")?.value.trim() || "";
  const date = document.getElementById("dateFilter")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";

  const filtered = allCases.filter(item => {
    const company = item["公司名稱"] || "";
    const contact = item["聯絡人"] || "";
    const created = String(item["建立時間"] || "").substring(0, 10);
    const itemStatus = item["狀態"] || "";

    return (
      (!keyword || company.includes(keyword) || contact.includes(keyword)) &&
      (!date || created === date) &&
      (!status || itemStatus === status)
    );
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
        <span class="badge status-${statusText}">${statusText}</span>
      </div>
    `;

    div.addEventListener("click", () => openModal(item));
    caseList.appendChild(div);
  });
}


/* ---------- Modal ---------- */

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


/* ---------- Notification ---------- */

function toggleNotifications() {
  const panel = document.getElementById("notificationPanel");

  if (panel) {
    panel.classList.toggle("hidden");
  }
}


/* ---------- Global Search ---------- */

function initGlobalSearch() {
  const globalSearch = document.getElementById("globalSearch");

  if (!globalSearch) return;

  globalSearch.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;

    const keyword = globalSearch.value.trim();

    if (!keyword) return;

    showPage("enterprise", document.querySelector("nav a:nth-child(2)"));

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
      searchInput.value = keyword;
      renderCases();
    }
  });
}


/* ---------- User Menu ---------- */

function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");

  if (menu) {
    menu.classList.toggle("hidden");
  }
}


function showSystemInfo() {
  alert(
    "AOS｜Aspect Operating System\n" +
    "版本：v1.2 Header Upgrade\n" +
    "狀態：開發中\n" +
    "模組：Dashboard、CRM、K書中心、AI Assistant、Settings"
  );
}


/* ---------- Theme Memory ---------- */

function initTheme() {
  const theme = localStorage.getItem("aos_theme");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }
}


function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");

  localStorage.setItem("aos_theme", isDark ? "dark" : "light");
}


/* ---------- Notification Dynamic ---------- */

function updateNotifications() {
  const panel = document.getElementById("notificationPanel");

  if (!panel) return;

  const pending = allCases.filter(item => item["狀態"] === "待聯繫").length;

  panel.innerHTML = `
    <h3>通知中心</h3>
    <p>🏢 企業方案：${pending} 筆待聯繫案件</p>
    <p>📚 K書中心：尚未串接</p>
    <p>🤖 AI 助理：功能預留中</p>
    <p>⚙ 系統：AOS v1.2 Header Upgrade</p>
  `;
}
