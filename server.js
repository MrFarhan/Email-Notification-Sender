const firebase = require("firebase")
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
require('dotenv').config()

var currentYear = new Date().getFullYear()
var currentMonth = new Date().getMonth();
currentMonth = currentMonth + 1
let date = new Date().getDate()
let today = currentMonth + "-" + date + "-" + currentYear
console.log("today is date ", today)
// let todayDay = moment(today).format('dddd')
// console.log("today is ", todayDay)

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

firebase.initializeApp(firebaseConfig)

var temp = -1

async function test() {
    schedule.scheduleJob('50 14 23 * * *', function () {

    firebase.database().ref("/Attendance").on("value", (res) => {
        const attendanceObj = res.val() // complete attendance data
        firebase.database().ref("/Users").on("value", (res) => {
            const users = res.val() //all users data
            var userUids = [];
            Object.values(users).map((item, index) => {
                if (item.isVerified && item.role === "Authorized") {
                    userUids.push(item.uid) // filtered verified and excluded admin /users data
                }
            })
            userUids && userUids.map((uid, index) => {
                temp = ++temp;
                if (attendanceObj[uid] && attendanceObj[uid][currentYear] && attendanceObj[uid][currentYear][currentMonth] && (attendanceObj[uid][currentYear][currentMonth][today]) && temp > userUids.length) {
                     console.log("present people are ",uid, "while temp is ", temp, "and total users are ", userUids.length)
                } else {
                    console.log("Absent users are", uid, "while temp is ", temp, "and total users are ", userUids.length)
                }
            })
        })
    })

})
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
    //     Your company name <br/>
    //     App / user name etc <br/>
    //     `, // html body
    // }


}

test().catch((e) => console.log("1st error is ", e));

app.get("/", (req, res) => {
    async function isodate() {
        await axios.get('http://worldclockapi.com/api/json/utc/now').then((response) => {
            const time = moment(response.data["currentDateTime"]).format("dddd, MMMM Do YYYY, h:mm")
            console.log("time is ", time)
            return res.send(time)

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