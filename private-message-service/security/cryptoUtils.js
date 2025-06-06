const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const keysDir = path.join(__dirname, "keys");

// Charger les clés RSA au démarrage
function loadRSAKeys() {
    if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir);

    const privateKeyPath = path.join(keysDir, "private.pem");
    const publicKeyPath = path.join(keysDir, "public.pem");

    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
        console.log("🔐 Génération des clés RSA...");
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "pkcs1", format: "pem" },
            privateKeyEncoding: { type: "pkcs1", format: "pem" },
        });

        fs.writeFileSync(privateKeyPath, privateKey);
        fs.writeFileSync(publicKeyPath, publicKey);
    }

    console.log("✅ Clés RSA chargées !");
}

// Chiffrer un message avec la clé publique
function encryptMessage(message) {
    const publicKey = fs.readFileSync(path.join(keysDir, "public.pem"), "utf8");
    return crypto.publicEncrypt(publicKey, Buffer.from(message)).toString("base64");
}

// Déchiffrer un message avec la clé privée
function decryptMessage(encryptedMessage) {
    const privateKey = fs.readFileSync(path.join(keysDir, "private.pem"), "utf8");
    return crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage, "base64")).toString();
}

module.exports = { loadRSAKeys, encryptMessage, decryptMessage };
