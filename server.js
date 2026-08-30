"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();


/*
    Настройки
*/

const PORT =
    process.env.PORT || 3000;

const BOT_TOKEN =
    process.env.BOT_TOKEN;

const CHAT_ID =
    process.env.CHAT_ID;


/*
    Проверяем секреты
*/

if (!BOT_TOKEN) {

    console.error(
        "ERROR: BOT_TOKEN не найден."
    );

    process.exit(1);
}


if (!CHAT_ID) {

    console.error(
        "ERROR: CHAT_ID не найден."
    );

    process.exit(1);
}


/*
    Middleware
*/

app.use(
    express.json({
        limit: "20kb"
    })
);


app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/*
    Защита текста для Telegram HTML
*/

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
    Проверяем данные
*/

function clean(value, maxLength) {

    return String(value || "")
        .trim()
        .slice(0, maxLength);
}


/*
    Получаем заявку
*/

app.post(
    "/api/booking",
    async (req, res) => {

        try {

            const master =
                clean(
                    req.body.master,
                    50
                );


            const service =
                clean(
                    req.body.service,
                    100
                );


            const price =
                clean(
                    req.body.price,
                    20
                );


            const date =
                clean(
                    req.body.date,
                    20
                );


            const time =
                clean(
                    req.body.time,
                    10
                );


            const name =
                clean(
                    req.body.name,
                    50
                );


            const phone =
                clean(
                    req.body.phone,
                    30
                );


            /*
                Проверяем обязательные поля
            */

            if (
                !master ||
                !service ||
                !date ||
                !time ||
                !name ||
                !phone
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Не все поля заполнены."
                });

            }


            /*
                Проверяем телефон
            */

            const phoneDigits =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                phoneDigits.length < 11
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Некорректный номер телефона."
                });

            }


            /*
                Формируем сообщение
            */

            const message = [
                "<b>⚡ НОВАЯ ЗАПИСЬ — БОРОДАЧ</b>",
                "",
                "👤 <b>Клиент:</b>",
                escapeHtml(name),
                "",
                "📞 <b>Телефон:</b>",
                escapeHtml(phone),
                "",
                "💈 <b>Мастер:</b>",
                escapeHtml(master),
                "",
                "✂️ <b>Услуга:</b>",
                escapeHtml(service),
                "",
                `💵 <b>Стоимость:</b> ${escapeHtml(price)} ₽`,
                "",
                "📅 <b>Дата:</b>",
                escapeHtml(date),
                "",
                "⏰ <b>Время:</b>",
                escapeHtml(time),
                "",
                "📍 <b>Адрес:</b>",
                "Тольятти, ул. Мира, 150"
            ].join("\n");


            /*
                Отправляем в Telegram
            */

            const telegramUrl =
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;


            const telegramResponse =
                await fetch(
                    telegramUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            chat_id:
                                CHAT_ID,

                            text:
                                message,

                            parse_mode:
                                "HTML",

                            disable_web_page_preview:
                                true

                        })
                    }
                );


            const telegramData =
                await telegramResponse.json();


            /*
                Telegram вернул ошибку
            */

            if (
                !telegramResponse.ok ||
                !telegramData.ok
            ) {

                console.error(
                    "Telegram error:",
                    telegramData
                );


                return res.status(502).json({
                    success: false,
                    message:
                        "Telegram не принял заявку."
                });

            }


            /*
                Всё хорошо
            */

            console.log(
                "Новая запись:",
                name,
                date,
                time
            );


            return res.json({
                success: true
            });


        } catch (error) {

            console.error(
                "Server error:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "Ошибка сервера."
            });

        }

    }
);


/*
    Главная страница
*/

app.get(
    "*",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/*
    Запуск
*/

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `БОРОДАЧ запущен на порту ${PORT}`
        );

    }
);
