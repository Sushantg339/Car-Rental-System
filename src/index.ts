import {config} from 'dotenv'
config()

import express from "express";
import createTables from './models/model.js';
import mainRoutes from './routes/main.routes.js'
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())


app.use('/api/v1' , mainRoutes)

app.listen(PORT , ()=>{
    createTables()
    console.log('server is running on port' +  PORT)
})