console.log("===== TES RELOAD VERSI 2 =====");
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Pastikan pakai 'mysql2/promise'

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- ⬇️ PASTIKAN BAGIAN INI BENAR ⬇️ ---
const pool = mysql.createPool({
    host: 'localhost',      // Server MySQL Anda (biasanya localhost)
    user: 'root',           // User MySQL Anda
    password: 'gyan1234',            // Password MySQL Anda (kosong jika default XAMPP/Laragon)
    database: 'tugas_api',
    port: 3307   // Database yang BARU SAJA Anda buat
});

// Tes koneksi
pool.getConnection()
    .then(connection => {
        console.log('✅ Terhubung ke database MySQL!');
        connection.release();
    })
   .catch(err => {
    console.error('ERROR KONEKSI DATABASE:', err); // <--- HAPUS .message
})
// --- ⬆️ BAGIAN KONEKSI SELESAI ⬆️ ---


// Rute POST untuk Generate Key
app.post('/generate-key', async (req, res) => {
    try {
        const { keyName, keyPermissions } = req.body; 
        
        // 1. Generate Key (64 karakter hex)
        const finalApiKey = crypto.randomBytes(32).toString('hex');

        // 2. Simpan ke Database (Pakai backticks `keys`)
        const sql = "INSERT INTO `keys` (nama_key, api_key, izin) VALUES (?, ?, ?)";
        
        const [result] = await pool.execute(sql, [keyName, finalApiKey, keyPermissions]);

        console.log(`Key baru berhasil disimpan. ID: ${result.insertId}`);
            
        // 3. Kirim key kembali ke front-end
        res.status(200).json({ 
            apiKey: finalApiKey,
            message: 'Key berhasil dibuat dan disimpan di MySQL'
        });

    } catch (error) {
        console.error('Error saat generate key:', error);
        res.status(500).json({ message: 'Gagal membuat API key', error: error.message });
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server API Key berjalan di http://localhost:${port}`);
});