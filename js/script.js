const API =
"https://script.google.com/macros/s/AKfycbwYgAdPpp-HDhm1tbppoLSfhetouCkMW67gaiSJAe0Tknc1G9HZGBPnGiY2KFOIgn3t/exec";

document.addEventListener("DOMContentLoaded", () => {
    loadEnterpriseCases();
});

async function loadEnterpriseCases() {

    const caseList = document.getElementById("caseList");
    const count = document.getElementById("enterpriseCount");

    caseList.innerHTML = "<p>讀取中...</p>";

    try {

        const response = await fetch(API);
        const result = await response.json();

        if (!result.success) {
            throw new Error("API Error");
        }

        const cases = result.data;

        count.textContent = cases.length;

        caseList.innerHTML = "";

        cases.reverse().forEach(item => {

            const div = document.createElement("div");

            div.className = "case-item";

            div.innerHTML = `
                <div>
                    <div class="case-title">
                        ${item["公司名稱"]}
                    </div>

                    <div class="case-sub">
                        ${item["聯絡人"]}
                    </div>
                </div>

                <div>
                    ${item["方案類型"]}
                </div>

                <div>
                    ${item["建立時間"].substring(0,10)}
                </div>

                <div>
                    <span class="badge">
                        ${item["狀態"]}
                    </span>
                </div>
            `;

            caseList.appendChild(div);

        });

    } catch(err){

        console.log(err);

        caseList.innerHTML = `
        <p style="color:red">
        無法連線 Apps Script
        </p>
        `;

    }

}
