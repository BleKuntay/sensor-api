const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inisialisasi Express
const app = express();

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Connection string MongoDB Atlas (ganti <db_password> dengan password MongoDB kamu)
const mongoURI = 'mongodb+srv://rikimcdougall:Gilgam3sh@sensor-storage.gofji.mongodb.net/sensor-storage?retryWrites=true&w=majority';

// Koneksi ke MongoDB Atlas
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB Atlas', err);
    });

// Skema sensor
const sensorSchema = new mongoose.Schema({
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    soil_moisture: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

// Model untuk sensor
const Sensor = mongoose.model('Sensor', sensorSchema);

// Root endpoint untuk tes server
app.get('/', (req, res) => {
    res.send('Welcome to the Sensor Storage API');
});

// Endpoint POST untuk menerima data sensor
app.post('/api/sensors', async (req, res) => {
    const { temperature, humidity, soil_moisture } = req.body;

    // Validasi sederhana untuk memastikan semua data dikirim
    if (temperature == null || humidity == null || soil_moisture == null) {
        return res.status(400).json({ message: 'Temperature, humidity, and soil moisture are required.' });
    }

    // Membuat instance baru untuk data sensor
    const newSensorData = new Sensor({
        temperature,
        humidity,
        soil_moisture
    });

    try {
        // Simpan data sensor ke MongoDB
        const savedData = await newSensorData.save();
        res.status(201).json({ message: 'Sensor data saved successfully', data: savedData });
    } catch (err) {
        res.status(500).json({ message: 'Error saving sensor data', error: err });
    }
});

app.get('/api/sensors/latest-data', async (req, res) => {
    try {
        // Query untuk mendapatkan data sensor terbaru berdasarkan waktu (created_at)
        const latestData = await Sensor.findOne().sort({ created_at: -1 }); // Sort descending (data terbaru di atas)

        if (!latestData) {
            return res.status(404).json({ message: 'No sensor data found' });
        }

        // Kembalikan data sensor terbaru ke client
        res.status(200).json({
            message: 'Latest sensor data retrieved successfully',
            data: latestData
        });
    } catch (err) {
        // Tangani error
        console.error('Error fetching latest sensor data:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Jalankan server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
