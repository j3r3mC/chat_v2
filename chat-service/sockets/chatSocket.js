exports.configureSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🟢 Client connecté : ${socket.id}`);

        socket.on("join channel", (data) => {
    const channel_id = data.channel_id; // ✅ Extraction correcte de la valeur

    console.log(`📌 Reçu channel_id corrigé :`, channel_id); // Vérifie la valeur correcte

    if (!channel_id || isNaN(channel_id)) {
        console.error("❌ Erreur : channel_id invalide", channel_id);
        return;
    }

    socket.join(`channel-${channel_id}`);
    console.log(`✅ Client ${socket.id} a bien rejoint : channel-${channel_id}`);
});


    });
};
