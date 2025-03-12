async function checkEmail() {
    let emailInput = document.getElementById("emailInput").value.trim();
    let messageBox = document.getElementById("message");

    if (!emailInput) {
        messageBox.innerHTML = "Please enter your email.";
        return;
    }

    // Hash the email using SHA-256
    let emailHash = await sha256(emailInput.toLowerCase());

    try {
        // Fetch the list of allowed emails
        let response = await fetch("emails.csv");
        let csvText = await response.text();

        Papa.parse(csvText, {
            header: true,
            complete: async function(results) {
                let emailList = results.data.map(row => row.email.trim().toLowerCase());

                if (emailList.includes(emailInput.toLowerCase())) {
                    // Check if this email hash is already in used_emails.csv
                    let usedEmailsResponse = await fetch("used_emails.csv");
                    let usedEmailsText = await usedEmailsResponse.text();
                    
                    let usedHashes = usedEmailsText.split("\n").map(line => line.split(",")[0].trim()); // Extract hashes only

                    if (usedHashes.includes(emailHash)) {
                        messageBox.innerHTML = "⚠️ This email has already been used!";
                    } else {
                        messageBox.innerHTML = "✅ Access Granted! Redirecting...";

                        // Save hashed email with timestamp
                        saveEmailHash(emailHash);

                        // Redirect to KoboToolbox form
                        let kobotoolboxURL = "https://ee.kobotoolbox.org/x/XXXXXXXX";
                        setTimeout(() => {
                            window.location.href = kobotoolboxURL;
                        }, 1500);
                    }
                } else {
                    messageBox.innerHTML = "❌ Email not authorized.";
                }
            }
        });
    } catch (error) {
        messageBox.innerHTML = "Error loading email list.";
    }
}

// Function to hash email using SHA-256
async function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Function to append hashed email with timestamp to used_emails.csv
async function saveEmailHash(hash) {
    let timestamp = new Date().toISOString(); // Get current timestamp in UTC
    let logEntry = `${hash},${timestamp}\n`;

    try {
        let response = await fetch("used_emails.csv", {
            method: "POST",
            body: logEntry,
            headers: {
                "Content-Type": "text/plain"
            }
        });
    } catch (error) {
        console.error("Failed to save email hash:", error);
    }
}
