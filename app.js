// import
const express = require('express');
const app = express();
// help handle the file system
const fs = require('fs');
// handle upload file
const multer = require('multer');
// read the file
const {
    TesseractWorker
} = require('tesseract.js');
// ===============================================
const worker = new TesseractWorker();

// storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // this call whenever we upload the file and set the destination 
        cb(null, "./uploads");
    },
    // file name setUp
    // use file cuz wanna keep track of the file info
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
// ===============================================

// whenever upload this will check the storage
const upload = multer({
    storage: storage
}).single('filename');

// rendering Route
app.get('/', (req, res) => {
    res.render('index');
})
app.set("view engine", "ejs");

app.get("/uploads_pdf", (req, res) => {
    console.log('working');
})
app.post("/uploads_pdf", (req, res) => {
    upload(req, res, err => {
        // read uploads file
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) {
                return alert(err);
            }
            // read data in english then convert to pdf

            worker
                .recognize(data, "eng+jpn", {
                    tessjs_create_pdf: '1'
                })
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.redirect('/download')
                })
                .finally(() => worker.terminate())
        })
    })
});

// get in text
app.post("/uploads_text", (req, res) => {
    upload(req, res, err => {
        // read uploads file
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) {
                return alert(err);
            }
            // read data in english then convert to pdf

            worker
                .recognize(data, "eng+jpn", {
                    tessjs_create_pdf: '1'
                })
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.send(result.text)
                })
                .finally(() => worker.terminate())
        })
    })
});

app.get("/download", (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})
// start server 
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Server up and running ${PORT}`));