import pool from "../utils/db.js";

const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`

const createBookingsTableQuery = `
    CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        days INTEGER NOT NULL DEFAULT 1,
        rent_per_day DECIMAL(10,2) NOT NULL,
        car_name VARCHAR(100) NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('booked', 'completed', 'cancelled')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_user 
            FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );
`

const createTables = async ()=>{
    try{
        await pool.query(createUsersTableQuery)
        await pool.query(createBookingsTableQuery)

        console.log('connected to the DB. Created all the tables!')
    }catch(error){
        console.log(error)
    }
}

export default createTables