// require('dotenv').config()

// const express = require('express')
// const database = require("./database")
// const fs = require('fs')
// const multer = require('multer')
// const upload = multer({ dest: 'images/' })
// const app = express()

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { addImage, getImage, getImages, deleteImage } from './database.js';
import * as s3 from './s3.js';

import crypto from 'crypto'

import sharp from 'sharp'
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const app = express()

// Before the other routes

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(express.static("dist"))


app.get("/api/images", async (req, res) => {
    const images = await getImages()

    for (const image of images){
      image.url = await s3.getSignedUrl(image.file_name);
    }

        // do something
        console.log(images)

    res.send(images)
  })


// app.use('/images', express.static('images'))
// app.get('/api/images/:imageName', (req, res) => {
//   // do a bunch of if statements to make sure the user is 
//   // authorized to view this image, then

//   const imageName = req.params.imageName
//   const readStream = fs.createReadStream(`images/${imageName}`)
//   readStream.pipe(res)
// })
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
  // Get the data from the post request
  const description = req.body.description;
  const fileBuffer = req.file.buffer;
  const mimetype = req.file.mimetype;
  const fileName = generateFileName();

  const imageBuffer = await sharp(fileBuffer).resize({height: 480, width: 720, fit:"fill"}).toBuffer()
 
  // process image
  const images = fileName + "_450"
const imagem = fileName + "_750"
const imagel = fileName + "_1000"
  

  // save to s3
  const s3Result = await s3.uploadImage(imageBuffer, fileName, mimetype)
  console.log(s3Result)

  //save to the database
  const result = await addImage(fileName, description)
  // Save this data to a database probably

  //console.log(description, imagePath)
  res.send(result)
})

app.delete('/api/images/:id', async (req,res)=>{
  const id = +req.params.id
  const image = await getImage(id)
  const s3resultD = await s3.deleteFile(image)
  console.log(s3resultD)
  const result = await deleteImage(id)
  res.send(result)
})



// const __dirname = path.resolve()
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./dist/index.html"))
// })


// After all other routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html');
});

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))