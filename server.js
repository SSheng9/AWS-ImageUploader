require('dotenv').config()

const express = require('express')
const database = require("./database")
const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const app = express()

// Before the other routes
app.use(express.static("dist"))

app.get("/api/images", async (req, res) => {
    const images = await database.getImages()
    res.send(images)
  })


// app.use('/images', express.static('images'))
app.get('/api/images/:imageName', (req, res) => {
  // do a bunch of if statements to make sure the user is 
  // authorized to view this image, then

  const imageName = req.params.imageName
  const readStream = fs.createReadStream(`images/${imageName}`)
  readStream.pipe(res)
})
// app.use(express.static("images"))


// app.get('/api/images', (req, res) => {
//   console.log('req.query', req.query)
//   const imagePath = req.query.imagePath
//   if (!imagePath) {
//       res.send("")
//       return
//   }
//   console.log('imagePath', imagePath)
//   const readStream = fs.createReadStream(imagePath)
//   readStream.pipe(res)
// })



app.post('/api/images', upload.single('image'), async (req, res) => {
    console.log(req.file,"test")
  const imagePath = req.file.filename;
  const description = req.body.description
  const result = await database.addImage(imagePath, description)
  // Save this data to a database probably

  //console.log(description, imagePath)
  res.send(result)
})

// After all other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html');
});

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))