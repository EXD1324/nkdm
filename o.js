const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActivityType // เพิ่มเข้ามาเพื่อตั้งสถานะบอท
} = require("discord.js");

const TOKEN = "MTUwMjYwNzMzMDk4OTMxMDEyMg.GeG4gv.EVeGr2lMJMSAsi_V10DbToZR6PCLjpaKMqiQ78";
const CLIENT_ID = "1502607330989310122";
const ROLE_ID = "1502608807119945778";
const LOG_CHANNEL_ID = "1502683713907986503";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  retryLimit: 10,
  restRequestTimeout: 60000,
  // === ส่วนที่ทำให้ขึ้นรูปมือถือ ===
  ws: {
    properties: {
      browser: "Discord iOS", // หลอกว่าเป็น iOS จะทำให้ขึ้นรูปมือถือ
    },
  },
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [
      new SlashCommandBuilder()
        .setName("ตั้งค่าระบบ")
        .setDescription("สร้างระบบยืนยันตัวตน EXD")
        .toJSON()
    ]});
    console.log("✅ ลงทะเบียนคำสั่งสำเร็จ");
  } catch (err) { console.error(err); }
})();

client.once("ready", () => {
  console.log(`🚀 ${client.user.tag} ออนไลน์บนมือถือแล้ว!`);

  // ตั้งค่าสถานะบอท (เช่น กำลังเล่น, กำลังดู)
  client.user.setPresence({
    activities: [{ name: 'ยืนยันตัวตน EXD', type: ActivityType.Watching }],
    status: 'online',
  });
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === "ตั้งค่าระบบ") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
      await interaction.deferReply({ flags: [64] });

      const verifyEmbed = new EmbedBuilder()
        .setDescription(
          `## <a:green_flames:1502614169260916917>ยืนยันตัวตนสมาชิกEXD\n\n` +
          `<a:a5:1502629269942042784>ยืนยันตัวตนเพื่อความปลอดภัยของเซิฟเวอร์\n` +
          `<a:f_purple_flame:1502629262711197781>กดปุ่มด้านล่าง และกรอกข้อมูลเพื่อยืนยันตัวตน`
        )
        .setColor(0x00FF00)
        .setImage("https://cdn.discordapp.com/attachments/1460298757961814126/1502704462446198855/lv_0_20260509231028.gif");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("verify_btn").setLabel("{ยืนยันตัวตน}").setEmoji("1502614239938871408").setStyle(ButtonStyle.Success)
      );
      await interaction.channel.send({ embeds: [verifyEmbed], components: [row] });
      await interaction.editReply("✅ ติดตั้งระบบเรียบร้อย");
    }

    if (interaction.isButton() && interaction.customId === "verify_btn") {
      const modal = new ModalBuilder().setCustomId('exd_modal').setTitle('ยืนยันตัวตนสมาชิก EXD');
      modal.addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('n').setLabel('ชื่อเล่น').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('a').setLabel('อายุ').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('r').setLabel('ชื่อในโรบอก').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('s').setLabel('เข้ามาจะแจกไอดีเพลงไหม').setStyle(TextInputStyle.Paragraph).setRequired(true))
      );
      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'exd_modal') {
      await interaction.deferReply({ flags: [64] }).catch(() => {});

      const n = interaction.fields.getTextInputValue('n');
      const a = interaction.fields.getTextInputValue('a');
      const r = interaction.fields.getTextInputValue('r');
      const s = interaction.fields.getTextInputValue('s');

      const count = interaction.guild.memberCount;
      const timeString = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const userAvatar = interaction.user.displayAvatarURL({ dynamic: true, size: 256 });

      const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setAuthor({ name: `ข้อมูลยืนยันตัวตนใหม่`, iconURL: userAvatar })
          .setThumbnail(userAvatar)
          .setDescription(`**สมาชิก:** <@${interaction.user.id}>\n**ชื่อเล่น:** ${n} | **อายุ:** ${a} | **Roblox:** ${r}\n**แจกเพลง:** ${s}`)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }

      await interaction.member.roles.add(ROLE_ID).catch(() => {});

      const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setAuthor({ name: `ยืนยันตัวตนสำเร็จ @${interaction.user.username}`, iconURL: userAvatar })
        .setThumbnail(userAvatar)
        .setDescription(
          `### <a:CHECK_CHECKPulse:1502614218325622785> ยินดีตอนรับครับ\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `คุณ <@${interaction.user.id}>\n` +
          `คุณเป็นคนที่ **${count}** ของเซิฟเวอร์เรา ขณะเวลา (**เวลา ${timeString}**)`
        );

      await interaction.editReply({
        content: "",
        embeds: [successEmbed]
      }).catch(() => {});
    }
  } catch (err) {
    console.log("⚠️ Interaction Error:", err.message);
  }
});

client.on("error", (e) => console.log("❌ Discord Client Error:", e.message));
process.on("unhandledRejection", (error) => {
  console.log("🛑 ตรวจพบ Error เน็ต/Timeout:", error.message);
});

client.login(TOKEN).catch(() => {
  setTimeout(() => client.login(TOKEN), 15000);
});
