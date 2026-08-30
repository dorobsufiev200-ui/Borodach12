"use strict";


/*
    БОРОДАЧ — ONLINE BOOKING

    ВАЖНО:
    Telegram-токена здесь НЕТ.

    Заявка отправляется на:
        /api/booking

    А уже сервер Render отправляет
    её в Telegram.
*/


const booking = {
    master: "",
    service: "",
    price: "",
    date: "",
    time: "",
    name: "",
    phone: ""
};


const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
];


let currentDate = new Date();

currentDate.setDate(1);


const monthTitle =
    document.getElementById("monthTitle");

const calendarGrid =
    document.getElementById("calendarGrid");

const selectedDate =
    document.getElementById("selectedDate");

const summaryService =
    document.getElementById("summaryService");

const summaryPrice =
    document.getElementById("summaryPrice");

const form =
    document.getElementById("bookingForm");

const submitButton =
    document.getElementById("submitButton");

const toast =
    document.getElementById("toast");

const toastTitle =
    document.getElementById("toastTitle");

const toastText =
    document.getElementById("toastText");


/* -------------------------
   MASTERS / SERVICES
------------------------- */


document
    .querySelectorAll(".choice-card")
    .forEach(card => {

        card.addEventListener("click", () => {

            const type =
                card.dataset.type;

            const value =
                card.dataset.value;

            document
                .querySelectorAll(
                    `.choice-card[data-type="${type}"]`
                )
                .forEach(item => {
                    item.classList.remove("active");
                });


            card.classList.add("active");


            booking[type] = value;


            if (type === "service") {

                booking.price =
                    card.dataset.price || "";

                updateSummary();
            }

        });

    });


/* -------------------------
   CALENDAR
------------------------- */


function getToday() {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
}


function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDateRussian(date) {

    const day =
        String(date.getDate())
            .padStart(2, "0");

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}.${month}.${year}`;
}


function renderCalendar() {

    calendarGrid.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthTitle.textContent =
        `${monthNames[month]} ${year}`;


    const firstDay =
        new Date(year, month, 1);


    let startDay =
        firstDay.getDay();


    /*
        JavaScript:
        Sunday = 0

        Нам нужно:
        Monday = 0
    */

    startDay =
        startDay === 0
            ? 6
            : startDay - 1;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const today =
        getToday();


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        calendarGrid.appendChild(empty);
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement("button");


        cell.type = "button";

        cell.className =
            "calendar-day";


        const date =
            new Date(
                year,
                month,
                day
            );


        date.setHours(0, 0, 0, 0);


        cell.textContent =
            day;


        if (
            date.getTime() ===
            today.getTime()
        ) {

            cell.classList.add("today");
        }


        if (date < today) {

            cell.classList.add("disabled");

            cell.disabled = true;

        } else {

            cell.addEventListener(
                "click",
                () => selectDate(date)
            );
        }


        if (
            booking.date ===
            formatDate(date)
        ) {

            cell.classList.add("selected");
        }


        calendarGrid.appendChild(cell);
    }

}


function selectDate(date) {

    booking.date =
        formatDate(date);


    document
        .querySelectorAll(".calendar-day")
        .forEach(day => {

            day.classList.remove(
                "selected"
            );

        });


    const buttons =
        document.querySelectorAll(
            ".calendar-day:not(.disabled)"
        );


    buttons.forEach(button => {

        const number =
            Number(button.textContent);

        if (
            number === date.getDate()
        ) {

            button.classList.add(
                "selected"
            );
        }

    });


    selectedDate.textContent =
        `Выбрано: ${formatDateRussian(date)}`;


    selectedDate.classList.add("ready");


    updateSummary();
}


/* -------------------------
   MONTH NAVIGATION
------------------------- */


document
    .getElementById("prevMonth")
    .addEventListener(
        "click",
        () => {

            const now =
                new Date();

            now.setDate(1);


            const previous =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                );


            if (previous < new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            )) {

                return;
            }


            currentDate =
                previous;


            renderCalendar();

        }
    );


document
    .getElementById("nextMonth")
    .addEventListener(
        "click",
        () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                );


            renderCalendar();
        }
    );


/* -------------------------
   TIME
------------------------- */


document
    .querySelectorAll(".times button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".times button"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                booking.time =
                    button.dataset.time;


                updateSummary();

            }
        );

    });


/* -------------------------
   PHONE
------------------------- */


const phoneInput =
    document.getElementById(
        "clientPhone"
    );


phoneInput.addEventListener(
    "input",
    event => {

        let value =
            event.target.value
                .replace(/\D/g, "");


        if (
            value.startsWith("8")
        ) {

            value =
                "7" +
                value.slice(1);
        }


        if (
            !value.startsWith("7") &&
            value.length > 0
        ) {

            value =
                "7" + value;
        }


        value =
            value.slice(0, 11);


        let formatted =
            "+7";


        if (value.length > 1) {

            formatted +=
                " (" +
                value.slice(1, 4);
        }


        if (value.length >= 4) {

            formatted += ") ";
        }


        if (value.length >= 4) {

            formatted +=
                value.slice(4, 7);
        }


        if (value.length >= 7) {

            formatted +=
                "-" +
                value.slice(7, 9);
        }


        if (value.length >= 9) {

            formatted +=
                "-" +
                value.slice(9, 11);
        }


        event.target.value =
            value.length > 1
                ? formatted
                : "+7";

    }
);


/* -------------------------
   SUMMARY
------------------------- */


function updateSummary() {

    if (booking.service) {

        summaryService.textContent =
            booking.service;

    } else {

        summaryService.textContent =
            "Услуга не выбрана";
    }


    if (booking.price) {

        summaryPrice.textContent =
            `${Number(booking.price).toLocaleString("ru-RU")} ₽`;

    } else {

        summaryPrice.textContent =
            "—";
    }

}


/* -------------------------
   VALIDATION
------------------------- */


function clearErrors() {

    document
        .querySelectorAll(".error")
        .forEach(element => {

            element.classList.remove(
                "error"
            );

        });

}


function showError(element) {

    if (element) {

        element.classList.add("error");

        element.focus();

        setTimeout(() => {

            element.classList.remove(
                "error"
            );

        }, 1200);

    }

}


function validateBooking() {

    clearErrors();


    if (!booking.master) {

        showToast(
            "Выбери мастера",
            "Сначала выбери мастера для записи."
        );

        return false;
    }


    if (!booking.service) {

        showToast(
            "Выбери услугу",
            "Сначала выбери услугу."
        );

        return false;
    }


    if (!booking.date) {

        showToast(
            "Выбери дату",
            "Укажи удобную дату."
        );

        return false;
    }


    if (!booking.time) {

        showToast(
            "Выбери время",
            "Укажи удобное время."
        );

        return false;
    }


    const nameInput =
        document.getElementById(
            "clientName"
        );


    const name =
        nameInput.value.trim();


    if (
        name.length < 2 ||
        name.length > 50
    ) {

        showToast(
            "Укажи имя",
            "Имя должно содержать от 2 до 50 символов."
        );

        showError(nameInput);

        return false;
    }


    const phone =
        phoneInput.value.trim();


    const digits =
        phone.replace(/\D/g, "");


    if (digits.length !== 11) {

        showToast(
            "Проверь телефон",
            "Введи полный номер телефона."
        );

        showError(phoneInput);

        return false;
    }


    booking.name = name;

    booking.phone = phone;


    return true;
}


/* -------------------------
   SEND BOOKING
------------------------- */


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!validateBooking()) {
            return;
        }


        submitButton.disabled =
            true;

        submitButton.classList.add(
            "loading"
        );


        try {

            const response =
                await fetch(
                    "/api/booking",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                booking
                            )
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Не удалось отправить заявку."
                );
            }


            showToast(
                "Запись отправлена!",
                "Мы получили заявку. Скоро свяжемся с тобой."
            );


            form.reset();


            resetBooking();


        } catch (error) {

            console.error(error);


            showToast(
                "Не получилось",
                error.message ||
                "Проверь соединение и попробуй ещё раз."
            );


        } finally {

            submitButton.disabled =
                false;

            submitButton.classList.remove(
                "loading"
            );

        }

    }
);


/* -------------------------
   RESET
------------------------- */


function resetBooking() {

    booking.master = "";
    booking.service = "";
    booking.price = "";
    booking.date = "";
    booking.time = "";
    booking.name = "";
    booking.phone = "";


    document
        .querySelectorAll(
            ".choice-card"
        )
        .forEach(card => {

            card.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(
            ".times button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    selectedDate.textContent =
        "Сначала выбери дату";


    selectedDate.classList.remove(
        "ready"
    );


    updateSummary();


    renderCalendar();

}


/* -------------------------
   TOAST
------------------------- */


let toastTimer;


function showToast(
    title,
    message
) {

    toastTitle.textContent =
        title;

    toastText.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

}


/* -------------------------
   START
------------------------- */


renderCalendar();

updateSummary();
