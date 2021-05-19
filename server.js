const express = require('express')
const app = express()
const axios = require("axios")
const port = process.env.PORT || 3002
const schedule = require('node-schedule');
const moment = require("moment")
const nodemailer = require("nodemailer");
const cors = require("cors")
app.use(cors())
app.use(express.json());

var currentYear = new Date().getFullYear()
var currentMonth = new Date().getMonth();
currentMonth = currentMonth + 1
let date = new Date().getDate()
let today = currentMonth + "-" + date + "-" + currentYear
console.log("today is date ", today)
// let todayDay = moment(today).format('dddd')
// console.log("today is ", todayDay)


async function test() {

    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true, // use SSL
    //     auth: {
    //         user: process.env.EMAIL,
    //         pass: process.env.PASS
    //     }
    // });

    // let mailOption = {
    //     from: 'm.farhan.champ@gmail.com',
    //     to: "muhammadfarhan012345@gmail.com",
    //     subject: "Testing",
    //     html: `<b>Testing Email for ${today} at </b>

    //     <br/>
    //     <br/>
    //     <br/>
    //     <br/>
    //     REGARDS, <br/>
    //     COMPUTING YARD <br/>
    //     ATTENDANCE MANAGEMENT SYSTEM <br/>
    //     `, // html body
    // }


    // //  working for late 12:05 pm
    // schedule.scheduleJob('05 07 * * *', function () {
    //     console.log('API called for Marking late')

    //     transporter.sendMail(mailOption, function (err, data) {
    //         if (err) {
    //             console.log("error", err)
    //         } else console.log("Email sent")
    //     })
    // })

    //  working for late 12:05 pm
    schedule.scheduleJob('25 47 00 * * *', function () {
        return (console.log('TESTING TESTING TESTING AT 12:0'))


    })


    // //  working for Holiday at 05 17 means 10:05 my heroku
    // schedule.scheduleJob('05 17 * * *', async function () {
    //     console.log('API called for Marking late')

    // })

}

test().catch((e) => console.log("1st error is ", e));

app.get("/", (req, res) => {
    async function isodate() {
        await axios.get('http://worldclockapi.com/api/json/utc/now').then((response) => {
            // const time = moment(response.data["currentDateTime"]).format("dddd, MMMM Do YYYY, h:mm")
            console.log("time is ", response.data["currentDateTime"])
            return res.send(response.data["currentDateTime"])

        }).catch((error) => {
            console.log("error on worldclock api is ", error)
            res.send("error on world clock api", error)
        })
    }
    isodate()
    test().catch((e) => console.log("error is ", e));

})

app.listen(port, () => {
    console.log(`Test email notification sender server is being listen at http://localhost:${port}`)
})