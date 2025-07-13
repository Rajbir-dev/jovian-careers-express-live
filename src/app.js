require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const JOBS = require('./jobs');

const app = express();

app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.get('/', (req, res)=>  {
    // res.send('Hello, Rajbir!');
    // res.sendFile(path.join(__dirname, 'pages/index.html'));
    res.render('index', { jobs: JOBS, companyName: "Jovian"});

});

app.get('/jobs/:id', (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    res.render('job', { job: matchedJob});

})

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 587,
    secure: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/jobs/:id/apply', (req, res) => {
   const {name, email, phone, dob, coverletter } = req.body;
   
   const id = req.params.id;
   const matchedJob = JOBS.find( job => job.id.toString() == id);

   console.log('req.body', req.body);
   console.log('matchedJob', matchedJob)

    const mailOption = {
        from: process.env.EMAIL_ID,
        to: process.env.EMAIL_ID,
        subject:`New Application for ${matchedJob.title}` ,
        html:` 
        <P><strong>Name:</strong> ${name}</P>
        <P><strong>Email:</strong> ${email}</P>
        <P><strong>Phone:</strong> ${phone}</P>
        <P><strong>Date of Birth:</strong> ${dob}</P>
        <P><strong>Cover Letter:</strong> ${coverletter}</P>`
       
    };

    transporter.sendMail(mailOption, (error, info) =>{
        if (error) {
            console.error(error);
            res.status(500).render('notapplied');
        } else {
            console.log(`Email sent: ` + info.reponse);
            res.status(200).render('applied');
        }
    });

});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server running on https://localhost:${port}');
});
