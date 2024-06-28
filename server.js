require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const db = require('./db'); // Veritabanı bağlantısı

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const secretKey = process.env.SECRET_KEY;
console.log('Secret Key:', secretKey);

app.use('/images', express.static(path.join(__dirname, 'tasarım-figma')));
// Kullanıcı kayıt 
app.post('/kayitol', (req, res) => {
  const { username, email, password } = req.body;
  const sql = 'INSERT INTO kullanicilar (KullaniciAdi, KullaniciEmail, KullaniciSifre) VALUES (?, ?, ?)';
  const values = [username, email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    // Yeni kayıt sonrası token oluştur
    const KullaniciId = result.insertId;
    const token = jwt.sign({ KullaniciId: KullaniciId, username: username }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ message: 'Kayıt başarılı', token });
  });
});


// Kullanıcı  giriş
app.post('/girisyap', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM kullanicilar WHERE KullaniciAdi = ? AND KullaniciSifre = ?';
  const values = [username, password];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Kullanıcı objesi:', user); // Kullanıcı objesini logla
      console.log('Kullanıcı objesi anahtarları:', Object.keys(user)); // Kullanıcı objesi anahtarlarını logla

      if (user.KullaniciId) { // `KullaniciId` veritabanında büyük 'D' ile geliyor
        console.log('Kullanıcı ID:', user.KullaniciId); // Kullanıcı ID'sini logla
      } else {
        console.log('Kullanıcı ID alınamadı'); // Kullanıcı ID'si alınamadıysa logla
      }

      const token = jwt.sign({ KullaniciId: user.KullaniciId, username: user.KullaniciAdi }, secretKey, { expiresIn: '1h' });
      console.log('Oluşturulan token:', token); // Oluşturulan token'ı logla
      res.status(200).json({ message: 'Giriş başarılı', token });
    } else {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış' });
    }
  });
});


// Tüm tarifleri getirme
app.get('/tum-tarifler', (req, res) => {
  console.log('/tum-tarifler endpoint\'ine istek geldi.');
  const sql = 'SELECT * FROM tarifler';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    const tarifler = results.map(tarif => {
      if (tarif.TarifResim) {
        tarif.TarifResim = Buffer.from(tarif.TarifResim).toString('base64');
      }
      return tarif;
    });
    console.log('Tarifler başarıyla çekildi:', tarifler);
    res.status(200).json(tarifler);
  });
});
app.get('/tarifler', (req, res) => {
  const queries = [
    'SELECT * FROM tarifler WHERE KategoriID = 1 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 2 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 3 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 4 LIMIT 4'
  ];

  const promises = queries.map(query => new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  }));

  Promise.all(promises)
    .then(results => {
      const combinedResults = [].concat(...results);
      res.status(200).json(combinedResults);
    })
    .catch(error => {
      console.error('SQL sorgu hatası: ', error);
      res.status(500).json({ error: 'Veritabanı hatası' });
    });
});
// Endpoint for sayfa2.html
app.get('/sayfa2-tarifler', (req, res) => {
  const queries = [
    'SELECT * FROM tarifler WHERE KategoriID = 5 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 6 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 7 LIMIT 4',
    'SELECT * FROM tarifler WHERE KategoriID = 8 LIMIT 4'
  ];

  const promises = queries.map(query => new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  }));

  Promise.all(promises)
    .then(results => {
      const combinedResults = [].concat(...results);
      res.status(200).json(combinedResults);
    })
    .catch(error => {
      console.error('SQL query error: ', error);
      res.status(500).json({ error: 'Database error' });
    });
});
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('Token gerekli');
    return res.status(401).json({ error: 'Token gerekli' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Received token:', token);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log('Token geçersiz:', err);
      return res.status(401).json({ error: 'Token geçersiz' });
    }
    console.log('Decoded token:', decoded);
    req.KullaniciId = decoded.KullaniciId;
    console.log('Decoded Kullanici Id:', req.KullaniciId);
    next();
  });
}



app.get('/tarif/:id', (req, res) => {
  const TarifID = req.params.id;
  const sql = 'SELECT * FROM tarifler WHERE TarifID = ?';
  db.query(sql, [TarifID], (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Tarif bulunamadı' });
    }
    // Görseli base64 formatında döndürme
    if (result[0].TarifResim) {
      result[0].TarifResim = result[0].TarifResim.toString('base64');
    }
    res.status(200).json(result[0]);
  });
});

// Tarif ekleme işlemi
app.post('/tarifler', verifyToken, upload.single('TarifResim'), (req, res) => {
  const { TarifAdi, TarifDetayi, Malzemeler, KategoriID } = req.body;
  const KullaniciId = req.KullaniciId;
  const TarifResim = req.file ? req.file.buffer : null;

  if (!KullaniciId) {
    return res.status(400).json({ error: 'Kullanıcı ID eksik' });
  }

  const sql = 'INSERT INTO tarifler (TarifAdi, TarifDetayi, Malzemeler, KategoriID, KullaniciId, TarifResim) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [TarifAdi, TarifDetayi, Malzemeler, KategoriID, KullaniciId, TarifResim];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.status(200).json({ message: 'Tarif eklendi', TarifID: result.insertId });
  });
});
// Kategori ID'si 1 olan tarifleri getirme
app.get('/ana-yemek-tarifler', (req, res) => {
  console.log('Ana yemek tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 1';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Ana yemek tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Ana yemek tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});
// Kategori ID'si 2 olan tarifleri getirme (Çorba)
app.get('/corba-tarifler', (req, res) => {
  console.log('Çorba tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 2';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Çorba tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Çorba tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 3 olan tarifleri getirme (Kahvaltılık)
app.get('/kahvaltilik-tarifler', (req, res) => {
  console.log('Kahvaltılık tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 3';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Kahvaltılık tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Kahvaltılık tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 4 olan tarifleri getirme (Tatlı)
app.get('/tatli-tarifler', (req, res) => {
  console.log('Tatlı tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 4';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Tatlı tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Tatlı tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 5 olan tarifleri getirme (Hamur İşi)
app.get('/hamurisi-tarifler', (req, res) => {
  console.log('Hamur İşi tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 5';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hamur İşi tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Hamur İşi tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 6 olan tarifleri getirme (Salata & Meze)
app.get('/salata-meze-tarifler', (req, res) => {
  console.log('Salata & Meze tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 6';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Salata & Meze tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Salata & Meze tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 7 olan tarifleri getirme (İçecek)
app.get('/icecek-tarifler', (req, res) => {
  console.log('İçecek tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 7';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('İçecek tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('İçecek tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});

// Kategori ID'si 8 olan tarifleri getirme (Bugün Ne Pişirsem?)
app.get('/bugun-ne-pisirsem-tarifler', (req, res) => {
  console.log('Bugün Ne Pişirsem? tarifleri isteği alındı.');
  const sql = 'SELECT * FROM tarifler WHERE KategoriID = 8';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Bugün Ne Pişirsem? tarifleri sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Bugün Ne Pişirsem? tarifleri başarıyla gönderildi.');
    res.status(200).json(results);
  });
});
// Kullanıcı tariflerini getirme işlemi

app.get('/kullanici-tarifler', verifyToken, (req, res) => {
  const KullaniciId = req.KullaniciId;
  const sql = 'SELECT * FROM tarifler WHERE KullaniciId = ?';
  db.query(sql, [KullaniciId], (err, results) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.status(200).json(results);
  });
});

// Tarif güncelleme işlemi
app.put('/tarifler/:id', verifyToken, (req, res) => {
  const TarifID = req.params.id;
  const { TarifAdi, TarifDetayi, Malzemeler, KategoriID } = req.body;
  const KullaniciId = req.KullaniciId;
  console.log('Kullanıcı ID:', KullaniciId);

  if (!KullaniciId) {
    return res.status(400).json({ error: 'Kullanıcı ID eksik' });
  }

  const sql = 'UPDATE tarifler SET TarifAdi = ?, TarifDetayi = ?, Malzemeler = ?, KategoriID = ? WHERE TarifID = ? AND KullaniciId = ?';
  const values = [TarifAdi, TarifDetayi, Malzemeler, KategoriID, TarifID, KullaniciId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarif bulunamadı' });
    }
    res.status(200).json({ message: 'Tarif güncellendi' });
  });
});



// Tarif silme işlemi
app.delete('/tarifler/:id', verifyToken, (req, res) => {
  const TarifID = req.params.id;
  const sql = 'DELETE FROM tarifler WHERE TarifID = ? AND KullaniciId = ?';
  const values = [TarifID, req.KullaniciId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarif bulunamadı' });
    }
    res.status(200).json({ message: 'Tarif silindi' });
  });
});
//Favoriye ekleme
app.post('/favori-ekle', verifyToken, (req, res) => {
  console.log('Favori ekleme isteği alındı:', req.body); // Log ekledik
  const { tarifId } = req.body; // KullaniciId'yi body'den değil, req.KullaniciId'den alacağız.
  const KullaniciId = req.KullaniciId; // Token'dan gelen KullaniciId

  console.log('Tarif ID:', tarifId);
  console.log('Kullanici ID:', KullaniciId);

  if (!tarifId || !KullaniciId) {
    console.error('Gerekli bilgiler eksik: tarifId veya KullaniciId bulunamadı.');
    return res.status(400).json({ success: false, message: 'Gerekli bilgiler eksik.' });
  }

  const sql = 'INSERT INTO favorilerim (TarifId, KullaniciId) VALUES (?, ?)';
  db.query(sql, [tarifId, KullaniciId], (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası:', err);
      return res.status(500).json({ success: false, message: 'Veritabanı hatası', error: err });
    }
    res.status(200).json({ success: true, message: 'Favori başarıyla eklendi.' });
  });
});
//Favorileri Getirme
app.get('/favorilerim', verifyToken, (req, res) => {
  console.log('Favorilerim endpoint\'i çalıştırıldı');
  const KullaniciId = req.KullaniciId;
  console.log('KullaniciId:', KullaniciId);
  const sql = `
    SELECT DISTINCT t.TarifID, t.TarifAdi, t.TarifDetayi, t.TarifResim
    FROM favorilerim f 
    JOIN tarifler t ON f.TarifId = t.TarifID 
    WHERE f.KullaniciId = ?
  `;
  db.query(sql, [KullaniciId], (err, results) => {
    if (err) {
      console.error('SQL sorgu hatası:', err);
      return res.status(500).json({ success: false, message: 'Veritabanı hatası', error: err });
    }
    else {
      const favoriler = results.map(row => {
        if (row.TarifResim) {
          // Buffer nesnesini base64 string'e dönüştür
          row.TarifResim = Buffer.from(row.TarifResim).toString('base64');
        }
        return row;
      });
      res.json({ success: true, favoriler });
    }
  });
});

// Yorum ekleme işlemi
app.post('/yorum-ekle', verifyToken, (req, res) => {
  const { TarifId, YorumMetni } = req.body; 
  const kullaniciId = req.KullaniciId;

  console.log(`Yorum ekleme isteği alındı: TarifId = ${TarifId}, kullaniciId = ${kullaniciId}, YorumMetni = ${YorumMetni}`);

  if (!TarifId || !YorumMetni || !kullaniciId) {
    console.error('Gerekli bilgiler eksik.');
    return res.status(400).json({ error: 'Gerekli bilgiler eksik.' });
  }

  const sql = 'INSERT INTO yorumlar (TarifId, KullaniciId, YorumMetni) VALUES (?, ?, ?)';
  const values = [TarifId, kullaniciId, YorumMetni];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Yorum ekleme SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası', details: err });
    }
    console.log('Yorum başarıyla eklendi:', result);
    res.status(200).json({ message: 'Yorum eklendi', YorumId: result.insertId });
  });
});


// Yorumları getirme işlemi
app.get('/yorumlar/:tarifId', (req, res) => {
  const tarifId = req.params.tarifId;
  console.log(`Yorumlar istek alındı: tarifId = ${tarifId}`);

  const sql = `
    SELECT y.YorumMetni, k.KullaniciAdi AS username
    FROM yorumlar y
    JOIN kullanicilar k ON y.KullaniciId = k.KullaniciId
    WHERE y.TarifId = ?
  `;

  db.query(sql, [tarifId], (err, results) => {
    if (err) {
      console.error('SQL sorgu hatası: ', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    console.log('Yorum sorgu sonucu:', results);
    if (results.length === 0) {
      console.log('Yorum bulunamadı');
      return res.status(404).json({ error: 'Yorum bulunamadı' });
    }
    res.status(200).json(results);
  });
});


// Puan ekleme işlemi
app.post('/puan-ekle', verifyToken, (req, res) => {
  const { TarifId, Puan } = req.body;
  const KullaniciId = req.KullaniciId;

  console.log(`Puan ekleme isteği alındı: TarifId = ${TarifId}, KullaniciId = ${KullaniciId}, Puan = ${Puan}`);

  if (!TarifId || !Puan || !KullaniciId) {
    console.error('Gerekli bilgiler eksik.');
    return res.status(400).json({ error: 'Gerekli bilgiler eksik.' });
  }

  const sql = 'INSERT INTO puanlar (TarifId, KullaniciId, Puan) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Puan = ?';
  const values = [TarifId, KullaniciId, Puan, Puan];

  console.log('SQL Sorgusu:', sql);
  console.log('Sorgu Değerleri:', values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Puan ekleme SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası', details: err });
    }
    console.log('Puan başarıyla eklendi veya güncellendi:', result);
    res.status(200).json({ message: 'Puan eklendi veya güncellendi' });
  });
});

// Puan ortalamasını getirme işlemi
app.get('/puan-ortalama/:TarifId', (req, res) => {
  const TarifId = req.params.TarifId;

  const sql = `
    SELECT AVG(Puan) AS ortalamaPuan
    FROM (
      SELECT MAX(Puan) AS Puan
      FROM puanlar
      WHERE TarifId = ?
      GROUP BY KullaniciId
    ) AS Subquery
  `;
  const values = [TarifId];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Puan ortalaması SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası', details: err });
    }
    console.log('Puan ortalaması sorgu sonucu:', results);
    if (results.length === 0 || results[0].ortalamaPuan === null) {
      return res.status(404).json({ ortalamaPuan: 0 });
    }
    res.status(200).json({ ortalamaPuan: results[0].ortalamaPuan });
  });
});
// İletişim formu verilerini kaydetme
app.post('/iletisim', (req, res) => {
  const { isim, email, mesaj } = req.body;

  const sql = 'INSERT INTO iletisim (isim, email, mesaj) VALUES (?, ?, ?)';
  db.query(sql, [isim, email, mesaj], (err, result) => {
    if (err) {
      console.error('SQL sorgu hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.status(200).json({ message: 'Mesaj iletildi. En kısa zamanda dönüş yapılacaktır. Teşekkürler.' });
  });
});



// Statik dosyaları hizmet etmek için
app.use(express.static(__dirname));

// Arama API endpoint'i
app.get('/arama', (req, res) => {
    const aramaTerimi = req.query.q;
    if (!aramaTerimi) {
        return res.status(400).json({ error: 'Arama terimi gerekli' });
    }

    const sql = 'SELECT * FROM tarifler WHERE TarifAdi LIKE ?';
    const values = [`%${aramaTerimi}%`];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('SQL sorgu hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tarif bulunamadı' });
        }
        const tarifler = results.map(tarif => {
            if (tarif.TarifResim) {
                tarif.TarifResim = Buffer.from(tarif.TarifResim).toString('base64');
            }
            return tarif;
        });
        res.status(200).json(tarifler);
    });
});

// Arama sonuç sayfası için
app.get('/arama-sonuc', (req, res) => {
    res.sendFile(path.join(__dirname, 'arama-sonuclari.html'));
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
