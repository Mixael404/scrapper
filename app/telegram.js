import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot("7162090569:AAEiuDuBTDenxVAR-4iCMctCMj_jEtC4xkM");

export async function postMessage(message){
    const messageInWork = `⚡️${message}\n\n🇮🇱 *Подписывайтесь на наш канал!*\n✅ https://t.me/news\\_israel\\_tg`.split("\n\n")
    messageInWork[0] = `*${messageInWork[0]}*`
    const newMessage = messageInWork.join('\n\n')
    bot.sendMessage(-1002053128307, newMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
    })
}
