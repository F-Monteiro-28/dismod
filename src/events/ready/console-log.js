const { Client, ActivityType } = require("discord.js");
const i18next = require('i18next');
const fs = require('fs');

// Carregar as traduções em inglês e português
const translationEN = JSON.parse(fs.readFileSync('./locales/en-US.json', 'utf8'));
const translationPT = JSON.parse(fs.readFileSync('./locales/pt-BR.json', 'utf8'));

// Inicialização do i18next
i18next.init({
  lng: 'en-US', // Idioma padrão
  fallbackLng: 'en-US', // Idioma de fallback
  resources: {
    'en-US': { translation: translationEN }, // Traduções em inglês dos Estados Unidos
    'pt-BR': { translation: translationPT }  // Traduções em português do Brasil
  }
});

function listGuildNames(client) {
  client.guilds.cache.forEach(guild => {
    // Define o idioma preferido do servidor como idioma atual do i18next
    const guildLang = guild.preferredLocale || 'en-US'; // Se o idioma preferido não estiver definido, use o inglês dos Estados Unidos como padrão
    const translation = guildLang === 'pt-BR' ? translationPT : translationEN;
    i18next.addResourceBundle(guildLang, 'translation', translation, true, true);
    
    // Log para exibir o idioma definido para cada servidor
    console.log(`Idioma definido para o servidor ${guild.name}: ${guildLang}`);

    // Alteração do idioma para o servidor atual
    i18next.changeLanguage(guildLang);
  });
}



module.exports = (client) => {
  console.log(`[INFO] ${client.user.username} está online!`);
// Chame a função para listar os nomes de todos os servidores
  listGuildNames(client);

  const updateStatus = () => {

    const statusMessages = [
      { name: `✅ | I'm online on ${client.guilds.cache.size} servers!`, type: ActivityType.Custom },
      { name: "👑 | My creator: @monteirexx", type: ActivityType.Custom },
      { name: "🤖 | The Fabulous DISMOD!", type: ActivityType.Custom },
    ];

    const currentStatusIndex = Math.floor(Math.random() * statusMessages.length);
    const currentStatus = statusMessages[currentStatusIndex];

    client.user.setPresence({ activities: [currentStatus], status: "dnd" });
  };

  client.guilds.cache.forEach((guild) => {
    console.log(`[INFO]`.blue + ` Servidor: ${guild.name}` + ` Nº Membros: ${guild.memberCount}`);
  });
  updateStatus();
  setInterval(updateStatus, 5000); 
};