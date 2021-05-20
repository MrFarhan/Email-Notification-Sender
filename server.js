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

var temp = -1
var currentYear = new Date().getFullYear()
var currentMonth = new Date().getMonth();
currentMonth = currentMonth + 1
let date = new Date().getDate()
let today = currentMonth + "-" + date + "-" + currentYear
console.log("today is date ", today)
let todayDay = moment(today).format('dddd')
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


async function test() {

    //working for absent / holiday
    schedule.scheduleJob('20 04 01 * * *', function () {
        console.log("API called for marking absent") //absent API
        firebase.database().ref("/Attendance").on("value", (res) => {
            let userUids = [];
            const attendanceObj = res.val() // complete attendance data
            firebase.database().ref("/Users").on("value", (res) => {
                const users = res.val() //all users data
                Object.values(users).map((item, index) => {
                    if (item.isVerified && item.role === "Authorized") {
                        userUids.push(item.uid) // filtered verified and excluded admin and unverified users data
                    }
                })
                userUids && userUids.map((uid, index) => {
                    temp = ++temp;
                    if (attendanceObj[uid] && attendanceObj[uid][currentYear] && attendanceObj[uid][currentYear][currentMonth] && (attendanceObj[uid][currentYear][currentMonth][today]) && !(temp === userUids.length || temp > userUids.length)) {
                        console.log(`Mr ${users[uid].firstName} ${' '} ${users[uid].lastName} , vide UID # ${uid} is present`)
                    } else if (!attendanceObj[uid] || (attendanceObj[uid] && !(attendanceObj[uid][currentYear] && attendanceObj[uid][currentYear][currentMonth] && attendanceObj[uid][currentYear][currentMonth][today] && attendanceObj[uid][currentYear][currentMonth][today]["checkedin"]) && users[uid]["weekEnd"] === todayDay && !(temp === userUids.length || temp > userUids.length))) {
                        // firebase.database().ref(`/Attendance/${uid}/${currentYear}/${currentMonth}/${today}`).set("Holiday")
                        console.log(`Mr ${users[uid].firstName} , vide UID # ${uid} is on nweekend today : ${today} ${todayDay}`)
                    } else if (!attendanceObj[uid] || (attendanceObj[uid] && !(attendanceObj[uid][currentYear] && attendanceObj[uid][currentYear][currentMonth] && attendanceObj[uid][currentYear][currentMonth][today] && attendanceObj[uid][currentYear][currentMonth][today]["checkedin"])) && !(temp === userUids.length || temp > userUids.length)) {
                        // firebase.database().ref(`/Attendance/${uid}/${currentYear}/${currentMonth}/${today}`).set("Absent")
                        console.log(`Mr ${users[uid].firstName} , vide UID # ${uid} is absent today : ${today} ${todayDay}`)
                    }
                })
            })
        })

    })

    // working for late at 05 07 means 12:05 pm
    schedule.scheduleJob('01 02 01 * * *', function () {
        console.log('API called for Marking late')

        firebase.database().ref("/Attendance").on("value", (res) => {
            let userUids = [];
            const attendanceObj = res.val()
            firebase.database().ref("/Users").on("value", (res) => {
                const users = res.val()
                Object.values(users).map((item, index) => {
                    if (item.isVerified && item.role === "Authorized") {
                        userUids.push(item.uid) // filtered verified and excluded admin and unverified users data
                    }
                })
                userUids && userUids.map((uid, index) => {
                    temp = ++temp;
                    let uuid = uid

                    if (attendanceObj[uid] && !(attendanceObj[uid][currentYear] && attendanceObj[uid][currentYear][currentMonth] && attendanceObj[uid][currentYear][currentMonth][today]) && temp < userUids.length) {
                        console.log(`${users[uid].email} is late at number ${temp} while total staff strength is ${userUids.length}`)
                    } else {
                        // console.log(users[uid].email, "is on time")
                        // firebase.database().ref(`/Attendance/${uid}/${currentYear}/${currentMonth}/${today}`).update({
                        //     isLate: true
                        // })
                        //transporter.sendMail({
                        //from: process.env.EMAIL, // sender address
                        //// to: users[uid].email, // list of receivers
                        //to: 'muhammadfarhan012345@gmail.com',  
                        //subject: `Late Alert - ${users[uid].firstName} + " " + ${users[uid].lastName} Attendance Management System - Computing Yard `, // Subject line
                        // // text: `Late Alert of ${users[uid].firstName} + " " + ${users[uid].lastName}`, // plain text body
                        //html: `<b>Dear ${users[uid].firstName} + " " + ${users[uid].lastName} , You are late for ${today}</b>

                        //   <br/>
                        //   REGARDS,
                        //   COMPUTING YARD
                        //   ATTENDANCE MANAGEMENT SYSTEM
                        //   `, // html body
                        //             });

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