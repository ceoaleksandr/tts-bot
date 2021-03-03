import "dotenv/config"
import {Telegraf} from "telegraf"
import consola from "consola"
import LanguageDetect from "languagedetect"
import googleTTS from "google-tts-api"
import fetch from "node-fetch"

/* === Inits === */

const bot = new Telegraf(process.env.BOT_TOKEN)

const detectLanguage = new LanguageDetect()
detectLanguage.setLanguageType('iso2')

/* === Start middleware === */

bot.start((ctx) => {
  ctx.replyWithMarkdown(`
    Привет, ${ctx.from.first_name}! 😉

    Я умею озвучивать любой текст. Пришли мне любое текстовое сообщение, а я тебе в ответ голосовое)
  `.replace(/^[ ]*/gm, ""))
})

/* === On text middleware === */

bot.on("text", (ctx) => (async () => {
  let text = ctx.update.message.text

  /* === If the text is too long === */

  if (text.length > 200)
    return ctx.reply("Слишком длинное сообщение. Нужно не более 200 символов")

  /* === Detect text language === */

  let language = (detectLanguage.detect(text, 1)[0] || ['ru'])[0] || 'en'

  /* === Fetch voice === */

  let url = await googleTTS(text, language)
  let voiceBuffer = await fetch(url).then(res => res.buffer())

  /* === Send voice === */

  ctx.replyWithVoice({
    source: Buffer.from(voiceBuffer)
  })

})().catch((error) => {

  consola.error(error)

  ctx.replyWithMarkdown(`
    ❌ Возникла ошибка. Попробуйте снова через несколько минут.

    \`${error.message || error}\`
  `.replace(/^[ ]*/gm, ""))
}))

/* === Launch the bot === */

bot.launch().then(() => {
  consola.success("Bot launched")
}).catch(consola.error)
