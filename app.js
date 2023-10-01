const express = require('express')
const app = express()
const multer = require('multer')
const fs = require('fs')
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const {Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
    apiKey: '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',
})




app.listen(3000, ()=>{
    console.log('server is online')
})

let PdfId
let summaryVar

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req, file, cb){
        PdfId = new Date().getTime()
        cb(null, file.fieldname + PdfId)
    }
})

const upload = multer({storage: storage})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
// app.use(bodyparser.json())

app.get('/', (req, res)=>{
    // res.send('Home')
    res.render('index.ejs')
})

app.post('/sendpdf', upload.single('pdf'), (req, res, next)=>{
    // console.log(req.file)
    // console.log(PdfId)
    const filePath = `./uploads/pdf${PdfId}`
    fs.readFile(filePath, (err, data)=>{
        if(data){
            // console.log(data)
            async function createPDFFromBase64(base64String) {
            // Decode the Base64 string to a Uint8Array
            const bytes = Buffer.from(base64String, 'base64');

            // Create a new PDF document from the decoded bytes
            const pdfDoc = await PDFDocument.load(bytes);

            // Serialize the PDF document to a Uint8Array
            const pdfBytes = await pdfDoc.save();

            // Write the PDF to a file
            fs.writeFileSync(`./uploads/${PdfId}.pdf`, pdfBytes);
            }

            // Example usage// Replace with your Base64 string
            createPDFFromBase64(data).catch((error) => {
            console.error('An error occurred:', error);
            });
            deleteUnwanted(res)
        }else{
            console.log(err)
        }
    })
})

function deleteUnwanted(res){
    fs.unlink(`./uploads/pdf${PdfId}`, (err)=>{
        if(!err){
            console.log('deleted')
        }else{
            console.log(err)
        }
    })
   setTimeout(function(){
    const dataBuffer = fs.readFileSync(`./uploads/${PdfId}.pdf`)
    pdf(dataBuffer).then(data => {
        // console.log(data.text)
        const prompt = `Summarize this, ${data.text}`
        const pdfTitle = data.info.Title
        // console.log(pdfTitle)
        async function goChat(){
            const openai = new OpenAIApi(configuration)
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{"role": 'user', "content": prompt}]
            })
            // console.log(completion.data.choices[0].message);
            const summary = completion.data.choices[0].message.content
            fs.unlink(`./uploads/${PdfId}.pdf`, (err)=>{
                if(!err){
                    console.log('deleted2')
                }else{
                    console.log(err)
                }
            })
            return summary;
        }
        goChat().then((summary)=>{
            // console.log(summary)
            summaryVar = summary
            // console.log(summaryVar)
            res.redirect('/summary')
            summaryRoute(pdfTitle)
        }).catch(err => {
            fs.unlink(`./uploads/${PdfId}.pdf`, (err)=>{
                if(!err){
                    console.log('deleted2')
                }else{
                    console.log(err)
                }
            })
            // console.log(err)
            res.redirect('/errormess')
            summaryRoute()
        })
    })
   }, 1000)
}

function summaryRoute(pdfTitle){
    // console.log(pdfTitle)
    app.get('/summary', (req, res)=>{
        res.render('summary.ejs', {summary: summaryVar, title: pdfTitle})
    })

    app.get('/errormess', (req, res)=>{
        res.render('error.ejs')
    })
}