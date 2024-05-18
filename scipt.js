

document.getElementById("billDate").addEventListener("change", generatePreviousDates);

function generatePreviousDates() {
    const selectedDate = new Date(document.getElementById("billDate").value);
    const morningTableBody = document.getElementById("morningTableBody");
    const eveningTableBody = document.getElementById("eveningTableBody");

    morningTableBody.innerHTML = "";
    eveningTableBody.innerHTML = "";

    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 6);

    const formattedOptions = { month: '2-digit', day: '2-digit' };

    for (let i = 0; i < 7; i++) {
        const formattedDate = currentDate.toLocaleDateString('en-GB', formattedOptions);
        const rowMorning = `
            <tr>
                <td>${formattedDate}</td>
                <td><input type="number" class="input litres-morning" onchange="calculateAmount('morning', this)"></td>
                <td><input type="number" class="input fat-morning" onchange="calculateAmount('morning', this)"></td>
                <td><input type="number" class="input snf-morning" onchange="calculateAmount('morning', this)"></td>
                <td class="total-amount-morning"></td>
            </tr>
        `;
        morningTableBody.innerHTML += rowMorning;

        const rowEvening = `
            <tr>
                <td>${formattedDate}</td>
                <td><input type="number" class="input litres-evening" onchange="calculateAmount('evening', this)"></td>
                <td><input type="number" class="input fat-evening" onchange="calculateAmount('evening', this)"></td>
                <td><input type="number" class="input snf-evening" onchange="calculateAmount('evening', this)"></td>
                <td class="total-amount-evening"></td>
            </tr>
        `;
        eveningTableBody.innerHTML += rowEvening;

        currentDate.setDate(currentDate.getDate() + 1);
    }
}


function calculateAmount(tableType, element) {
    const row = element.parentElement.parentElement;
    const litres = parseFloat(row.querySelector(`.litres-${tableType}`)?.value || 0);
    const fat = parseFloat(row.querySelector(`.fat-${tableType}`)?.value || 0);
    const snf = parseFloat(row.querySelector(`.snf-${tableType}`)?.value || 0);

    const totalAmount = (litres * calcAmount(fat, snf)).toFixed(2);
    row.querySelector(`.total-amount-${tableType}`).textContent = totalAmount;

    calculateTotals();
}

// Function to calculate totals
function calculateTotals() {
    let totalLitresMorning = 0;
    let totalAmountMorning = 0;

    const morningRows = document.querySelectorAll("#morningTableBody tr");
    morningRows.forEach(row => {
        const litres = parseFloat(row.querySelector(".litres-morning")?.value || 0);
        const totalAmount = parseFloat(row.querySelector(".total-amount-morning")?.textContent || 0);
        totalLitresMorning += litres;
        totalAmountMorning += totalAmount;
    });

    document.getElementById("morningTotalLitres").textContent = totalLitresMorning.toFixed(2);
    document.getElementById("morningTotalAmount").textContent = totalAmountMorning.toFixed(2);

    // Evening
    let totalLitresEvening = 0;
    let totalAmountEvening = 0;

    const eveningRows = document.querySelectorAll("#eveningTableBody tr");
    eveningRows.forEach(row => {
        const litres = parseFloat(row.querySelector(".litres-evening")?.value || 0);
        const totalAmount = parseFloat(row.querySelector(".total-amount-evening")?.textContent || 0);
        totalLitresEvening += litres;
        totalAmountEvening += totalAmount;
    });

    document.getElementById("eveningTotalLitres").textContent = totalLitresEvening.toFixed(2);
    document.getElementById("eveningTotalAmount").textContent = totalAmountEvening.toFixed(2);

    // Total
    const totalLitres = (totalLitresMorning + totalLitresEvening).toFixed(2);
    const totalAmount = (totalAmountMorning + totalAmountEvening).toFixed(2);

    document.getElementById("totalLitres").textContent = totalLitres;
    document.getElementById("totalAmount").textContent = totalAmount;
}

function calcAmount(fat, snf) {
    const s = 9.0;
    const sp = (snf - s) * 10;
    const sa = snf <= 9.0 ? sp * 0.50 : sp * 0.05;

    const f = 6.5;
    const fp = (fat - f) * 10;
    const fa = fat <= 6.5 ? fp * 0.50 : fp * 0.60;

    const amount = sa + fa + 52.50;
    return amount;
}

function saveData() {
// Show loader
document.getElementById("loader").style.display = "block";

const billDate = document.getElementById("billDate").value;
const farmerName = document.getElementById("farmerName").value;
const balance = document.getElementById("balance").value;

// Initialize arrays to store morning and evening data
const morningData = [];
const eveningData = [];

// Retrieve morning table rows data
const morningRows = document.querySelectorAll("#morningTableBody tr");
morningRows.forEach(row => {
const date = row.querySelector("td:first-child").textContent;
const litres = parseFloat(row.querySelector(".litres-morning").value || 0);
const fat = parseFloat(row.querySelector(".fat-morning").value || 0);
const snf = parseFloat(row.querySelector(".snf-morning").value || 0);
const totalAmount = parseFloat(row.querySelector(".total-amount-morning").textContent || 0);

// Push row data to morning array
morningData.push({ date, litres, fat, snf, totalAmount });
});

// Retrieve evening table rows data
const eveningRows = document.querySelectorAll("#eveningTableBody tr");
eveningRows.forEach(row => {
const date = row.querySelector("td:first-child").textContent;
const litres = parseFloat(row.querySelector(".litres-evening").value || 0);
const fat = parseFloat(row.querySelector(".fat-evening").value || 0);
const snf = parseFloat(row.querySelector(".snf-evening").value || 0);
const totalAmount = parseFloat(row.querySelector(".total-amount-evening").textContent || 0);

// Push row data to evening array
eveningData.push({ date, litres, fat, snf, totalAmount });
});

// Calculate total litres and total amount for morning and evening separately
let totalMorningLitres = 0;
let totalMorningAmount = 0;
morningData.forEach(data => {
totalMorningLitres += data.litres;
totalMorningAmount += data.totalAmount;
});

let totalEveningLitres = 0;
let totalEveningAmount = 0;
eveningData.forEach(data => {
totalEveningLitres += data.litres;
totalEveningAmount += data.totalAmount;
});

// Calculate total litres and total amount from both morning and evening data
let totalLitres = totalMorningLitres + totalEveningLitres;
let totalAmount = totalMorningAmount + totalEveningAmount;

// Create a reference to the farmer's data within "milk-data" collection
const farmerRef = db.collection("milk-data").doc(farmerName);

// Create a subcollection named "date" within the farmer's data
const dateRef = farmerRef.collection("date").doc(billDate);

// Create an object to store milk data
const data = {
farmerName,
billDate,
balance,
morning: morningData,
evening: eveningData,
totalMorningLitres,
totalMorningAmount,
totalEveningLitres,
totalEveningAmount,
totalLitres,
totalAmount
};

// Set the data within the "date" subcollection document
dateRef.set(data)
.then(() => {
    // Hide loader
    document.getElementById("loader").style.display = "none";
    alert("Data saved successfully");
})
.catch((error) => {
    console.error("Error saving data: ", error);
    // Hide loader
    document.getElementById("loader").style.display = "none";
    alert("Error saving data. Please try again later.");
});
}

function fetchSavedData() {
// Show loader
document.getElementById("loader").style.display = "block";

const billDate = document.getElementById("billDate").value;
const farmerName = document.getElementById("farmerName").value;

// Create a reference to the farmer's data within "milk-data" collection
const farmerRef = db.collection("milk-data").doc(farmerName);

// Create a reference to the specific bill date document within "date" subcollection
const dateRef = farmerRef.collection("date").doc(billDate);

dateRef.get()
.then((doc) => {
    if (doc.exists) {
        const data = doc.data();

        if (data.hasOwnProperty("morning") && data.hasOwnProperty("evening")) {
            // Populate morning table
            const morningRows = document.querySelectorAll("#morningTableBody tr");
            morningRows.forEach((row, index) => {
                const rowData = data.morning[index];
                if (rowData) {
                    row.querySelector(".litres-morning").value = rowData.litres;
                    row.querySelector(".fat-morning").value = rowData.fat;
                    row.querySelector(".snf-morning").value = rowData.snf;
                    row.querySelector(".total-amount-morning").textContent = rowData.totalAmount.toFixed(2);
                }
            });

            // Populate evening table
            const eveningRows = document.querySelectorAll("#eveningTableBody tr");
            eveningRows.forEach((row, index) => {
                const rowData = data.evening[index];
                if (rowData) {
                    row.querySelector(".litres-evening").value = rowData.litres;
                    row.querySelector(".fat-evening").value = rowData.fat;
                    row.querySelector(".snf-evening").value = rowData.snf;
                    row.querySelector(".total-amount-evening").textContent = rowData.totalAmount.toFixed(2);
                }
            });

            // Populate totals
            document.getElementById("morningTotalLitres").textContent = data.totalMorningLitres.toFixed(2);
            document.getElementById("morningTotalAmount").textContent = data.totalMorningAmount.toFixed(2);
            document.getElementById("eveningTotalLitres").textContent = data.totalEveningLitres.toFixed(2);
            document.getElementById("eveningTotalAmount").textContent = data.totalEveningAmount.toFixed(2);

            // Populate form fields with fetched data
            document.getElementById("balance").value = data.balance;
            document.getElementById("totalLitres").textContent = data.totalLitres.toFixed(2);
            document.getElementById("totalAmount").textContent = data.totalAmount.toFixed(2);
        } else {
            alert("Data structure in Firestore is incorrect.");
        }
    } else {
        alert("No data found for the selected date and farmer name");
        // Clear any existing data from forms/tables (optional)
    }

    // Hide loader
    document.getElementById("loader").style.display = "none";
})
.catch((error) => {
    console.error("Error fetching data: ", error);
    // Hide loader
    document.getElementById("loader").style.display = "none";
    // Show alert for error
    alert("Error fetching data. Please try again later.");
});
}



function clearTableData(tableId) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ""; // Clear all rows
}

function createTableRow(rowData) {
    const row = document.createElement("tr");

    // Create and append cells for date, litres, fat, snf, and totalAmount
    const dateCell = document.createElement("td");
    dateCell.textContent = rowData.date;
    row.appendChild(dateCell);

    const litresCell = document.createElement("td");
    const litresInput = document.createElement("input");
    litresInput.type = "number";
    litresInput.value = rowData.litres;
    litresInput.addEventListener("input", calculateTotals); // Add event listener to recalculate totals on input change
    litresCell.appendChild(litresInput);
    row.appendChild(litresCell);

    const fatCell = document.createElement("td");
    const fatInput = document.createElement("input");
    fatInput.type = "number";
    fatInput.value = rowData.fat;
    fatInput.addEventListener("input", calculateTotals); // Add event listener to recalculate totals on input change
    fatCell.appendChild(fatInput);
    row.appendChild(fatCell);

    const snfCell = document.createElement("td");
    const snfInput = document.createElement("input");
    snfInput.type = "number";
    snfInput.value = rowData.snf;
    snfInput.addEventListener("input", calculateTotals); // Add event listener to recalculate totals on input change
    snfCell.appendChild(snfInput);
    row.appendChild(snfCell);

    const totalAmountCell = document.createElement("td");
    totalAmountCell.textContent = rowData.totalAmount;
    row.appendChild(totalAmountCell);

    return row;
}

function clearData() {
    document.getElementById("billDate").value = "";
    document.getElementById("farmerName").value = "";
    document.getElementById("balance").value = "";

    clearTableData("morningTableBody");
    clearTableData("eveningTableBody");

    document.getElementById("morningTotalLitres").textContent = "-";
    document.getElementById("morningTotalAmount").textContent = "-";
    document.getElementById("eveningTotalLitres").textContent = "-";
    document.getElementById("eveningTotalAmount").textContent = "-";
    document.getElementById("totalLitres").textContent = "-";
    document.getElementById("totalAmount").textContent = "-";
    document.getElementById("signature").textContent = "";

    alert("Data cleared successfully");
}
