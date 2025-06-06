exports.configureSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🟢 Client connecté : ${socket.id}`);

        // ✅ Gestion de la connexion aux channels publics
        socket.on("join channel", (data) => {
            const channel_id = data.channel_id;

            console.log(`📌 Reçu channel_id corrigé :`, channel_id);

            if (!channel_id || isNaN(channel_id)) {
                console.error("❌ Erreur : channel_id invalide", channel_id);
                return;
            }

            socket.join(`channel-${channel_id}`);
            console.log(`✅ Client ${socket.id} a bien rejoint : channel-${channel_id}`);
        });

        // ✅ Gestion des connexions aux messages privés
        socket.on("join private chat", (data) => {
            const { senderId, receiverId } = data;
            const privateRoom = `private-${Math.min(senderId, receiverId)}-${Math.max(senderId, receiverId)}`;

            console.log(`📌 Client ${socket.id} a rejoint : ${privateRoom}`);
            socket.join(privateRoom);
        });

        // ✅ Envoi et réception des messages privés en temps réel
        socket.on("private message", async (data) => {
            const { senderId, receiverId, content } = data;
            const privateRoom = `private-${Math.min(senderId, receiverId)}-${Math.max(senderId, receiverId)}`;

            // 🔥 Sauvegarde du message en base
            const [result] = await pool.query(
                "INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
                [senderId, receiverId, content]
            );

            const newMessage = {
                id: result.insertId,
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                created_at: new Date().toISOString(),
            };

            io.to(privateRoom).emit("new private message", newMessage);
            console.log(`📩 Message privé envoyé :`, newMessage);
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client ${socket.id} déconnecté`);
        });
    });
};
