async function checkEmail() {
    let emailInput = document.getElementById("emailInput").value.trim();
    let messageBox = document.getElementById("message");

    if (!emailInput) {
        messageBox.innerHTML = "Please enter your email.";
        return;
    }

    try {
        let response = await fetch("emails.csv");
        let csvText = await response.text();

        Papa.parse(csvText, {
            header: true,
            complete: function(results) {
                let emailList = results.data.map(row
