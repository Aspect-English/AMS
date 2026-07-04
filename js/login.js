const USERS = [
  {
    username: "admin",
    password: "a20113025h",
    name: "管理員",
    role: "Owner"
  },
  {
    username: "jenny",
    password: "a20113025h",
    name: "Jenny",
    role: "主管"
  },
  {
    username: "julia",
    password: "a20113025h",
    name: "Julia",
    role: "行政"
  },
  {
    username: "jennie",
    password: "a20113025h",
    name: "Julia",
    role: "行政"
  }
];

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = USERS.find(u =>
    u.username === username && u.password === password
  );

  if (!user) {
    alert("帳號或密碼錯誤，請重新輸入。");
    return;
  }

  localStorage.setItem("ams_logged_in", "true");
  localStorage.setItem("ams_user_name", user.name);
  localStorage.setItem("ams_user_role", user.role);

  window.location.href = "index.html";
}
