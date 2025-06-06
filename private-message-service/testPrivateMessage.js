const axios = require("axios");

// 🔹 Envoi d'un message privé
async function sendMessage() {
    const response = await axios.post("http://localhost:5002/api/private-messages/send", {
        senderId: 1,
        receiverId: 2,
        message: "Hello, voici un message sécurisé !"
    }, {
        headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInVzZXJuYW1lIjoiYWRtaW5Vc2VyMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTIwNTE1OCwiZXhwIjoxNzQ5MjkxNTU4fQ.PavVsBRbqIWiqgA8sfAv208g_cOkl6H6l__BZAsKpM8" }
    });

    console.log("✅ Message envoyé :", response.data);
}

// 🔹 Récupération des messages privés
async function getMessages() {
    const response = await axios.get("http://localhost:5002/api/private-messages/get/2", {
        headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInVzZXJuYW1lIjoiYWRtaW5Vc2VyMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTIwNTE1OCwiZXhwIjoxNzQ5MjkxNTU4fQ.PavVsBRbqIWiqgA8sfAv208g_cOkl6H6l__BZAsKpM8" }
    });

    console.log("📩 Messages reçus :", response.data.messages);
}

// Lancement des tests
sendMessage().then(() => setTimeout(getMessages, 2000));
