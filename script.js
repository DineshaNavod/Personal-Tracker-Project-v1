// Budget App Final Script with Local Storage

let totalAmountInput = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const totalBudgetOutput = document.getElementById("amount");
const list = document.getElementById("list");

let tempAmount = 0;
let foodTotal = 0,
  transportTotal = 0,
  entertainmentTotal = 0,
  shoppingTotal = 0,
  otherTotal = 0;

let expenseChart = null;

function updateResult() {
  document.getElementById(
    "result"
  ).innerText = `Rs ${balanceValue.innerText}.000`;
}

function saveToLocalStorage() {
  const data = {
    tempAmount,
    foodTotal,
    transportTotal,
    entertainmentTotal,
    shoppingTotal,
    otherTotal,
    expenditure: parseInt(expenditureValue.innerText),
    balance: parseInt(balanceValue.innerText),
    listHTML: list.innerHTML,
  };
  localStorage.setItem("budgetAppData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("budgetAppData"));
  if (data) {
    tempAmount = data.tempAmount;
    foodTotal = data.foodTotal;
    transportTotal = data.transportTotal;
    entertainmentTotal = data.entertainmentTotal;
    shoppingTotal = data.shoppingTotal;
    otherTotal = data.otherTotal;
    expenditureValue.innerText = data.expenditure;
    balanceValue.innerText = data.balance;
    totalBudgetOutput.innerText = tempAmount;
    document.getElementById(
      "result"
    ).innerText = `Rs ${balanceValue.innerText}.000`;
    list.innerHTML = data.listHTML;

    Array.from(document.querySelectorAll(".edit")).forEach((btn) => {
      btn.addEventListener("click", () => modifyElement(btn, true));
    });
    Array.from(document.querySelectorAll(".delete")).forEach((btn) => {
      btn.addEventListener("click", () => modifyElement(btn));
    });

    updateChart();
  }
}

window.onload = loadFromLocalStorage;

// Set Budget
totalAmountButton.addEventListener("click", () => {
  tempAmount = parseInt(totalAmountInput.value) || 0;
  if (tempAmount <= 0) {
    errorMessage.classList.remove("hide");
  } else {
    errorMessage.classList.add("hide");
    totalBudgetOutput.innerText = tempAmount;
    balanceValue.innerText =
      tempAmount - (parseInt(expenditureValue.innerText) || 0);
    totalAmountInput.value = "";
    updateResult();
    saveToLocalStorage();
  }
});

const modifyElement = (element, edit = false) => {
  let parentDiv = element.parentElement;
  let parentAmount = parseInt(parentDiv.querySelector(".amount").innerText);
  let category = parentDiv.querySelector(".product").innerText.toLowerCase();

  if (edit) {
    productTitle.value = category.charAt(0).toUpperCase() + category.slice(1);
    userAmount.value = parentAmount;
  }

  balanceValue.innerText = parseInt(balanceValue.innerText) + parentAmount;
  expenditureValue.innerText =
    parseInt(expenditureValue.innerText) - parentAmount;

  switch (category) {
    case "food":
      foodTotal -= parentAmount;
      break;
    case "transport":
      transportTotal -= parentAmount;
      break;
    case "entertainment":
      entertainmentTotal -= parentAmount;
      break;
    case "shopping":
      shoppingTotal -= parentAmount;
      break;
    default:
      otherTotal -= parentAmount;
  }

  updateChart();
  updateResult();
  saveToLocalStorage();
  parentDiv.remove();
};

const listCreator = (expenseName, expenseValue) => {
  let sublistContent = document.createElement("div");
  sublistContent.classList.add("sublist-content", "flex-space");
  sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p>`;

  let editButton = document.createElement("button");
  editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
  editButton.addEventListener("click", () => modifyElement(editButton, true));

  let deleteButton = document.createElement("button");
  deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
  deleteButton.addEventListener("click", () => modifyElement(deleteButton));

  sublistContent.appendChild(editButton);
  sublistContent.appendChild(deleteButton);
  list.appendChild(sublistContent);
};

checkAmountButton.addEventListener("click", () => {
  if (!userAmount.value || !productTitle.value) {
    alert("Please enter category and amount");
    return;
  }

  let expenditure = parseInt(userAmount.value);
  let category = productTitle.value.toLowerCase();

  let existingItem = Array.from(
    document.querySelectorAll(".sublist-content")
  ).find(
    (item) =>
      item.querySelector(".product").innerText.toLowerCase() === category
  );

  if (existingItem) {
    let existingAmount = parseInt(
      existingItem.querySelector(".amount").innerText
    );
    existingItem.querySelector(".amount").innerText =
      existingAmount + expenditure;
  } else {
    listCreator(category, expenditure);
  }

  switch (category) {
    case "food":
      foodTotal += expenditure;
      break;
    case "transport":
      transportTotal += expenditure;
      break;
    case "entertainment":
      entertainmentTotal += expenditure;
      break;
    case "shopping":
      shoppingTotal += expenditure;
      break;
    default:
      otherTotal += expenditure;
  }

  let totalExpense =
    foodTotal +
    transportTotal +
    entertainmentTotal +
    shoppingTotal +
    otherTotal;
  expenditureValue.innerText = totalExpense;
  balanceValue.innerText = (parseInt(tempAmount) || 0) - totalExpense;

  updateChart();
  updateResult();
  saveToLocalStorage();

  productTitle.value = "Food";
  userAmount.value = "";
});

function updateChart() {
  let ctx = document.getElementById("expenseChart").getContext("2d");

  let data = [
    foodTotal,
    transportTotal,
    entertainmentTotal,
    shoppingTotal,
    otherTotal,
  ];

  if (expenseChart) {
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Food", "Transport", "Entertainment", "Shopping", "Other"],
        datasets: [
          {
            data,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}

document.getElementById("reset-app").addEventListener("click", () => {
  localStorage.clear(); // or use removeItem(...) for specific keys
  location.reload(); // refresh the page to reset everything visually
});
