const express = require('express');
const { Pool } = require('pg');  // Library untuk PostgreSQL
const bodyParser = require('body-parser');

// Inisialisasi Express dan body-parser
const app = express();
app.use(bodyParser.json());

// Setup koneksi ke PostgreSQL menggunakan variabel lingkungan DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Endpoint untuk menerima POST request dan menyimpan data ke PostgreSQL
app.post('/api/sensors', async (req, res) => {
    const { temperature, humidity, soil_moisture } = req.body;

    try {
        // Query SQL untuk memasukkan data ke tabel sensors
        const query = `INSERT INTO sensors (temperature, humidity, soil_moisture) 
                   VALUES ($1, $2, $3) RETURNING *`;
        const values = [temperature, humidity, soil_moisture];
        const result = await pool.query(query, values);

        // Berikan response berhasil ke client
        res.status(200).json({
            message: 'Data inserted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error inserting data'
        });
    }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
