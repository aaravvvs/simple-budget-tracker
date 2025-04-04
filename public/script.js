let transactions = [];
let chart1, chart2, chart3;

const form = document.getElementById("transactionForm");
const type = document.getElementById("type");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");
const date = document.getElementById("date");
const transactionList = document.getElementById("transactionList");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const filterDate = document.getElementById("filterDate");
const filterCategory = document.getElementById("filterCategory");
const searchBtn = document.getElementById("searchBtn");

const chartCanvas = document.getElementById("chartCanvas");
const monthlyCanvas = document.getElementById("monthlyChart");
const categoryCanvas = document.getElementById("categoryChart");

const logoutBtn = document.getElementById("logoutBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");
const welcomeUser = document.getElementById("welcomeUser");

const navDashboard = document.getElementById("navDashboard");
const navProfile = document.getElementById("navProfile");
const dashboardSection = document.getElementById("dashboardSection");
const profileSection = document.getElementById("profileSection");

// INIT
window.onload = async () => {
  try {
    const res = await fetch("/api/transactions");
    transactions = await res.json();
    renderTransactions();
    populateCategoryFilter();
    updateCharts();
  } catch (err) {
    console.log("Backend not connected or user not authenticated.");
  }

  try {
    const res = await fetch("/api/user");
    const user = await res.json();
    welcomeUser.textContent = `Welcome, ${user.username || "User"}`;
  } catch {
    if (welcomeUser) welcomeUser.textContent = "Welcome";
  }
};

// Add transaction
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tx = {
      type: type.value,
      amount: parseFloat(amount.value),
      category: category.value,
      note: note.value,
      date: date.value || new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });

      const saved = await res.json();
      if (saved && saved._id) {
        transactions.unshift(saved);
        renderTransactions();
        updateCharts();
        form.reset();
      } else {
        alert("Failed to save transaction");
      }
    } catch (err) {
      alert("Server error saving transaction");
    }
  });
}

// Delete
async function deleteTransaction(id) {
  try {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      transactions = transactions.filter(t => t._id !== id);
      renderTransactions();
      updateCharts();
    }
  } catch (err) {
    alert("Failed to delete transaction");
  }
}

// Render
function renderTransactions() {
  if (!transactionList) return;

  transactionList.innerHTML = "";

  const filtered = transactions.filter(tx => {
    const matchDate = !filterDate.value || tx.date?.startsWith(filterDate.value);
    const matchCat = !filterCategory.value || tx.category === filterCategory.value;
    return matchDate && matchCat;
  });

  let income = 0, expense = 0;

  filtered.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.type}</td>
      <td>£${tx.amount.toFixed(2)}</td>
      <td>${tx.category}</td>
      <td>${tx.note || "-"}</td>
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td><button onclick="deleteTransaction('${tx._id}')">🗑️</button></td>
    `;
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
    transactionList.appendChild(tr);
  });

  if (totalIncome) totalIncome.textContent = income.toFixed(2);
  if (totalExpense) totalExpense.textContent = expense.toFixed(2);
  if (balance) balance.textContent = (income - expense).toFixed(2);
}

// Theme toggle
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleThemeBtn.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

// Export CSV
function exportCSV() {
  const rows = [["Type", "Amount", "Category", "Note", "Date"]];
  transactions.forEach(tx => {
    rows.push([tx.type, tx.amount, tx.category, tx.note || "", tx.date?.split("T")[0]]);
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
}

// Export PDF
function exportPDF() {
  window.print(); // Replace later with jsPDF for more control
}

// Filter category dropdown
function populateCategoryFilter() {
  if (!filterCategory) return;
  const cats = [...new Set(transactions.map(t => t.category))];
  filterCategory.innerHTML = `<option value="">All Categories</option>`;
  cats.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

// Search
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    renderTransactions();
    updateCharts();
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch("/api/logout");
    location.href = "/login.html";
  });
}

// Charts
function updateCharts() {
  if (!chartCanvas || !monthlyCanvas || !categoryCanvas) return;

  const filtered = transactions.filter(tx => {
    const matchDate = !filterDate.value || tx.date?.startsWith(filterDate.value);
    const matchCat = !filterCategory.value || tx.category === filterCategory.value;
    return matchDate && matchCat;
  });

  const income = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  const byMonth = {};
  const byCategory = {};

  filtered.forEach(tx => {
    const month = new Date(tx.date).toLocaleString("default", { month: "short", year: "numeric" });
    const cat = tx.category;
    byMonth[month] = (byMonth[month] || 0) + tx.amount;
    if (tx.type === "expense") byCategory[cat] = (byCategory[cat] || 0) + tx.amount;
  });

  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();
  if (chart3) chart3.destroy();

  chart1 = new Chart(chartCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [income, expense], backgroundColor: ["#00b894", "#d63031"] }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });

  chart2 = new Chart(monthlyCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: Object.keys(byMonth),
      datasets: [{ label: "Total", data: Object.values(byMonth), backgroundColor: "#0984e3" }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  chart3 = new Chart(categoryCanvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: Object.keys(byCategory),
      datasets: [{ data: Object.values(byCategory), backgroundColor: ["#d63031", "#e17055", "#fab1a0", "#ff7675", "#fd79a8"] }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// Sidebar Navigation
if (navDashboard && navProfile) {
  navDashboard.addEventListener("click", () => {
    navDashboard.classList.add("active");
    navProfile.classList.remove("active");
    dashboardSection.classList.remove("hidden");
    profileSection.classList.add("hidden");
  });

  navProfile.addEventListener("click", () => {
    navProfile.classList.add("active");
    navDashboard.classList.remove("active");
    dashboardSection.classList.add("hidden");
    profileSection.classList.remove("hidden");
  });
}

// ===========================
// ✅ Login / Signup Handling
// ===========================

// Update for login
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send the login request to your backend API
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      // If login is successful, redirect to the Dashboard (index.html)
      alert('Login successful!');
      window.location.href = '/index.html';  // Redirect to dashboard
    } else {
      // If there is an error, show it
      alert(data.error || 'Login failed');
    }
  });
}

// Handle Signup
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    // Send the signup request to your backend API
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      // If signup is successful, redirect to the Dashboard (index.html)
      alert('Signup successful!');
      window.location.href = '/index.html';  // Redirect to dashboard
    } else {
      // If there is an error, show it
      alert(data.error || 'Signup failed');
    }
  });
}
