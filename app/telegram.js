import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot("7162090569:AAEiuDuBTDenxVAR-4iCMctCMj_jEtC4xkM");

export async function postMessage(message){
    // const path = message[2]
    const messageInWork = `⚡️${message}\n\n🇮🇱 *Подписывайтесь на наш канал!*\n✅ https://t.me/news\\_israel\\_tg`.split("\n\n")
    messageInWork[0] = `*${messageInWork[0]}*`
    const newMessage = [messageInWork[0], messageInWork[1], messageInWork[3]].join('\n\n')
    if(!messageInWork[2]){
        bot.sendMessage(-1002053128307, newMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        })
    } else{
        bot.sendPhoto(-1002053128307, messageInWork[2], {
            caption: newMessage,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        })
    }
}
// -1002059724245
// Рабочий - -1002053128307