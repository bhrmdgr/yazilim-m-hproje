new Vue({
    el: '#favorites-app',
    data: {
        favoriTarifler: []
    },
    created() {
        const KullaniciId = localStorage.getItem('KullaniciId');
        const token = localStorage.getItem('token');

        if (!KullaniciId || !token) {
            console.error('Gerekli bilgiler eksik: KullaniciId veya token bulunamadı.');
            window.location.href = 'girisyap.html';
            return;
        }

        fetch('http://localhost:3000/favorilerim', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
              this.favoriTarifler = data.favoriler.map(tarif => {
                return {
                  ...tarif,
                  TarifResim: tarif.TarifResim ? `data:image/jpeg;base64,${tarif.TarifResim}` : null
                };
              });
            } else {
              alert('Favori tarifler alınırken bir hata oluştu.');
            }
          })
        .catch(error => console.error('Hata:', error));
    }
});
