import { Pool } from "pg";

const pool = new Pool({
    connectionString : 'postgres://postgres:root@localhost:5432/car_rental_db'
})

export default pool