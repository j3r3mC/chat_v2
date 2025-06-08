io.on("connection", (socket) => {
  console.log("🔌 Utilisateur connecté au WebSocket :", socket.id);

  // 🚀 Écoute la mise à jour d'un message privé
  socket.on("update private message", async (msg) => {
    try {
      await pool.execute(
        "UPDATE private_messages SET content = ?, updated_at = NOW() WHERE id = ?",
        [msg.content, msg.messageId]
      );
      console.log("📝 Message mis à jour :", msg);

      // 🔥 Diffuser la mise à jour à tous les utilisateurs du chat
      io.emit("update private message", msg);
    } catch (error) {
      console.error("❌ Erreur mise à jour message :", error);
    }
  });

  // 🗑 Écoute la suppression d'un message privé
  socket.on("delete private message", async (msg) => {
    try {
      await pool.execute("DELETE FROM private_messages WHERE id = ?", [msg.messageId]);
      console.log("🗑 Message supprimé :", msg);

      // 🔥 Diffuser la suppression à tous les utilisateurs du chat
      io.emit("delete private message", msg);
    } catch (error) {
      console.error("❌ Erreur suppression message :", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Utilisateur déconnecté : ${socket.id}`);
  });
});
