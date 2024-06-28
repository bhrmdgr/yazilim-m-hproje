new Vue({
  el: '#recipe-app',
  data: {
    tarif: {  },
    malzemeler: [],
    comments: [],
    newComment: '',
    rating: 0,
    TarifId: null, // TarifId'yi burada tanımlayın
    KullaniciId: null // KullaniciId'yi burada tanımlayın
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.TarifId = urlParams.get('id');
    this.KullaniciId = localStorage.getItem('KullaniciId'); // `const` anahtar kelimesini kaldırın
    const token = localStorage.getItem('token');
    if (token) {
      this.user = JSON.parse(atob(token.split('.')[1])); // Kullanıcı bilgilerini token'dan alın
    }
    this.fetchTarifDetails(this.TarifId);
    this.fetchComments(this.TarifId);
    this.fetchRatingAverage(this.TarifId);  // Ortalama puanı sayfa yüklendiğinde çek
    console.log('TarifId:', this.TarifId);
    console.log('KullaniciId:', this.KullaniciId);
  },
  methods: {
    fetchTarifDetails(TarifId) {
      fetch(`http://localhost:3000/tarif/${TarifId}`)
        .then(response => response.json())
        .then(data => {
          this.tarif = data;
          this.malzemeler = data.Malzemeler.split(',');
          if (data.TarifResim) {
            this.tarif.TarifResim = data.TarifResim;
          }
        })
        .catch(error => console.error('Tarif detayları alınırken hata oluştu:', error));
    },


    fetchComments(TarifId) {
      console.log(`Yorumlar istek gönderiliyor: tarifId = ${TarifId}`);
      fetch(`http://localhost:3000/yorumlar/${TarifId}`)
        .then(response => {
          console.log('Yorumlar endpoint yanıtı:', response);
          if (!response.ok) {
            throw new Error('Yorumlar endpoint hatası: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('Alınan yorumlar:', data);
          this.comments = data;
        })
        .catch(error => console.error('Yorumlar alınırken hata oluştu:', error));
    },
    addComment() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Lütfen Giriş Yapınız.');
        return;
      }
    
      const commentData = {
        TarifId: this.TarifId,
        YorumMetni: this.newComment
      };
    
      console.log('Yorum ekleme isteği gönderiliyor:', commentData);
      fetch('http://localhost:3000/yorum-ekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      })
      .then(response => {
        console.log('Yorum ekleme yanıtı:', response);
        if (!response.ok) {
          return response.json().then(data => {
            console.error('Yorum ekleme hatası:', data);
            throw new Error(data.message || 'Bir hata oluştu');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.YorumId) {
          this.comments.push({
            username: this.user.username,
            YorumMetni: this.newComment
          });
          this.newComment = '';
        } else {
          console.error('Yorum eklenirken bir hata oluştu:', data);
        }
      })
      .catch(error => {
        console.error('Yorum eklenirken hata oluştu:', error);
        alert('Yorum eklenirken bir hata oluştu: ' + error.message);
      });
    },
   

    fetchTarifDetails(TarifId) {
      fetch(`http://localhost:3000/tarif/${TarifId}`)
        .then(response => response.json())
        .then(data => {
          this.tarif = data;
          this.malzemeler = data.Malzemeler.split(',');
          if (data.TarifResim) {
            this.tarif.TarifResim = data.TarifResim;
          }
        })
        .catch(error => console.error('Tarif detayları alınırken hata oluştu:', error));
    },
  
    fetchComments(TarifId) {
      console.log(`Yorumlar istek gönderiliyor: tarifId = ${TarifId}`);
      fetch(`http://localhost:3000/yorumlar/${TarifId}`)
        .then(response => {
          console.log('Yorumlar endpoint yanıtı:', response);
          if (!response.ok) {
            throw new Error('Yorumlar endpoint hatası: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('Alınan yorumlar:', data);
          this.comments = data;
        })
        .catch(error => console.error('Yorumlar alınırken hata oluştu:', error));
    },
  
    fetchTarifDetails(TarifId) {
      fetch(`http://localhost:3000/tarif/${TarifId}`)
        .then(response => response.json())
        .then(data => {
          this.tarif = data;
          this.malzemeler = data.Malzemeler.split(',');
          if (data.TarifResim) {
            this.tarif.TarifResim = data.TarifResim;
          }
        })
        .catch(error => console.error('Tarif detayları alınırken hata oluştu:', error));
    },
  
    fetchComments(TarifId) {
      console.log(`Yorumlar istek gönderiliyor: tarifId = ${TarifId}`);
      fetch(`http://localhost:3000/yorumlar/${TarifId}`)
        .then(response => {
          console.log('Yorumlar endpoint yanıtı:', response);
          if (!response.ok) {
            throw new Error('Yorumlar endpoint hatası: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('Alınan yorumlar:', data);
          this.comments = data;
        })
        .catch(error => console.error('Yorumlar alınırken hata oluştu:', error));
    },
  
    fetchRatingAverage(TarifId) {
      fetch(`http://localhost:3000/puan-ortalama/${TarifId}`)
        .then(response => {
          console.log('Puan ortalaması endpoint yanıtı:', response);
          if (!response.ok) {
            throw new Error('Puan ortalaması endpoint hatası: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('Alınan puan ortalaması:', data);
          this.tarif.ortalamaPuan = data.ortalamaPuan;  // Doğru güncellendiğinden emin olun
        })
        .catch(error => console.error('Puan ortalaması alınırken hata oluştu:', error));
    },
  
    rateRecipe(star) {
      this.rating = star;
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Puan vermek için giriş yapmalısınız.');
        return;
      }
  
      const ratingData = {
        TarifId: this.TarifId,
        Puan: star
      };
  
      console.log('Puan ekleme isteği gönderiliyor:', ratingData);
      fetch('http://localhost:3000/puan-ekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ratingData)
      })
      .then(response => {
        console.log('Puan ekleme yanıtı:', response);
        if (!response.ok) {
          return response.json().then(data => {
            console.error('Puan ekleme hatası:', data);
            throw new Error(data.message || 'Bir hata oluştu');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Puan başarıyla eklendi veya güncellendi:', data);
        this.fetchRatingAverage(this.TarifId);  // Puan verildikten sonra ortalamayı güncelle
      })
      .catch(error => {
        console.error('Puan eklenirken hata oluştu:', error);
        alert('Puan eklenirken bir hata oluştu: ' + error.message);
      });
 
  },


    addToFavorites() {
      const TarifId = this.TarifId;
      const KullaniciId = this.KullaniciId;
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Lütfen giriş yapınız.');
        return;
      }
  
      // Logları ekleyin
      console.log('TarifId:', TarifId);
      console.log('KullaniciId:', KullaniciId);
      console.log('token:', token);

      if (!TarifId || !KullaniciId || !token) {
        console.error('Gerekli bilgiler eksik: TarifId, KullaniciId veya token bulunamadı.');
        return;
      }

      console.log('Favori ekleme isteği:', { TarifId, KullaniciId, token });

      fetch('http://localhost:3000/favori-ekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tarifId: TarifId })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert('Tarif favorilere eklendi!');
        } else {
          alert('Tarif favorilere eklenirken bir hata oluştu.');
        }
      })
      .catch(error => console.error('Hata:', error.message));
    }
  }
});
