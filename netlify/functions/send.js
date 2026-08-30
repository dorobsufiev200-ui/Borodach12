const https = require('https');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        
        const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        const text = `⚡️ НОВАЯ ЗАПИСЬ BORODACH ⚡️\n` +
                     `👤 Клиент: ${data.name}\n` +
                     `📞 Телефон: ${data.phone}\n` +
                     `💈 Мастер: ${data.master}\n` +
                     `📅 Дата: ${data.date}\n` +
                     `⏰ Время: ${data.time}\n` +
                     `💵 Услуги: ${data.service} (${data.price})\n` +
                     `📍 Тольятти, ул. Мира, 150`;

        const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`;

        await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode === 200) resolve();
                else reject(new Error('Telegram error'));
            }).on('error', reject);
        });

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
