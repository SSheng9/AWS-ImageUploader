import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 3306,
  })
  .promise()
  
export async function getImages() {
  let query = `
  SELECT *
  FROM images
  ORDER BY created DESC
  `
  const [rows] = await pool.query(query);
  return rows
}
// exports.getImages = getImages
export async function getImage(id) {
  let query = `
  SELECT *
  FROM images
  WHERE id = ?
  `
  const [rows] = await pool.query(query, [id]);
  const result = rows[0];
  return result
}
// exports.getImage = getImage


export async function addImage(filePath, description) {
  let query = `
  INSERT INTO images (file_name, description)
  VALUES(?, ?)
  `
  const [result] = await pool.query(query, [filePath, description]);
  const id = result.insertId
  return await getImage(id)
}
// exports.addImage = addImage

export async function deleteImage(id){
  let query = `
  DELETE FROM images
  WHERE id = ?
  `
  const result = await pool.query(query, [id]);
  return result
}