new Vue({
    el: '#recipe-app',
    data: {
      tarifler: [],
      groupedTarifler: {}
    },
    created() {
      this.fetchTarifler();
    },
    methods: {
      fetchTarifler() {
        fetch('http://localhost:3000/tarifler')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            this.tarifler = data.map(tarif => {
              if (tarif.TarifResim) {
                tarif.TarifResim = btoa(
                  new Uint8Array(tarif.TarifResim.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
              }
              return tarif;
            });
            this.groupTarifler();
          })
          .catch(error => {
            console.error('Tarifleri getirirken hata oluştu:', error);
          });
      },
      groupTarifler() {
        this.groupedTarifler = this.tarifler.reduce((groups, tarif) => {
          const category = tarif.KategoriID;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(tarif);
          return groups;
        }, {});
      },
      getCategoryName(categoryId) {
        const categories = {
          1: 'Ana Yemek',
          2: 'Çorba',
          3: 'Kahvaltılık',
          4: 'Tatlı'
        };
        return categories[categoryId] || 'Diğer';
      }
    }
  });
  new Vue({
    el: '#recipe-app-sayfa2',
    data: {
      tarifler: [],
      groupedTarifler: {}
    },
    created() {
      this.fetchTarifler();
    },
    methods: {
      fetchTarifler() {
        fetch('http://localhost:3000/sayfa2-tarifler')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            this.tarifler = data.map(tarif => {
              if (tarif.TarifResim) {
                tarif.TarifResim = btoa(
                  new Uint8Array(tarif.TarifResim.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
              }
              return tarif;
            });
            this.groupTarifler();
          })
          .catch(error => {
            console.error('Tarifleri getirirken hata oluştu:', error);
          });
      },
      groupTarifler() {
        this.groupedTarifler = this.tarifler.reduce((groups, tarif) => {
          const category = tarif.KategoriID;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(tarif);
          return groups;
        }, {});
      },
      getCategoryName(categoryId) {
        const categories = {
          5: 'Hamur İşi',
          6: 'Salata & Meze',
          7: 'İçecek',
          8: 'Bugün Ne Pişirsem?'
        };
        return categories[categoryId] || 'Diğer';
      }
    }
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    new Vue({
      el: '#tüm-tarifler-recipe-app',
      data: {
        tarifler: []
      },
      created() {
        this.fetchTarifler();
      },
      methods: {
        fetchTarifler() {
          console.log('Tarifler API çağrısı yapılıyor...');
          fetch('http://localhost:3000/tum-tarifler')
            .then(response => {
              console.log('API yanıtı alındı:', response);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('API yanıtı JSON olarak çözüldü:', data);
              this.tarifler = data.map(tarif => {
                if (tarif.TarifResim) {
                  tarif.TarifResim = 'data:image/jpeg;base64,' + tarif.TarifResim;
                }
                return tarif;
              });
              console.log('Tarifler:', this.tarifler);
            })
            .catch(error => {
              console.error('Tarifleri getirirken hata oluştu:', error);
            });
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const isim = contactForm.querySelector('input[name="isim"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const mesaj = contactForm.querySelector('textarea[name="mesaj"]').value;

        fetch('http://localhost:3000/iletisim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isim, email, mesaj })
        })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          contactForm.reset();
        })
        .catch(error => {
          console.error('Mesaj gönderilirken hata oluştu:', error);
          alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        });
      });
    }
  });

        
  new Vue({
    el: '#search-app',
    data: {
        aramaTerimi: ''
    },
    methods: {
        aramaYap() {
            if (!this.aramaTerimi.trim()) {
                alert('Arama terimi giriniz.');
                return;
            }
            window.location.href = `arama-sonuclari.html?q=${this.aramaTerimi}`;
        }
    }
});

function redirectToIndex() {
    window.location.href = "index.html";
}

function redirectToMainDishPage() {
    window.location.href = "ana-yemek.html";
}

function redirectToSoupPage() {
    window.location.href = "corba.html";
}

function redirectToDessertPage() {
    window.location.href = "tatli.html";
}

function redirectToBreakfastPage() {
    window.location.href = "kahvaltilik.html";
}

    function redirectToPastryPage() {
        window.location.href = "hamurisi.html";
    }

    function redirectToSaladPage() {
        window.location.href = "salata-meze.html";
    }

    function redirectToDrinkPage() {
        window.location.href = "icecek.html";
    }

    function redirectToSuggestionPage() {
        window.location.href = "oneri.html";
    }


    document.addEventListener('DOMContentLoaded', function () {
        if (window.location.href.indexOf('index.html') > -1) {
            var anaYemekPage1 = document.querySelector('.ana-yemek-page1');
            if (anaYemekPage1) {
                anaYemekPage1.classList.add('active');
            }
        } else if (window.location.href.indexOf('sayfa2.html') > -1) {
            var anaYemekPage4 = document.querySelector('.ana-yemek-page4');
            if (anaYemekPage4) {
                anaYemekPage4.classList.add('active');
            }
        }
    document.querySelectorAll('.page-navigation span').forEach(function (navItem) {
        navItem.addEventListener('click', function () {
            if (this.classList.contains('desktop1-text40')) {
                window.location.href = 'sayfa2.html';
            } else if (this.classList.contains('desktop1-text41')) {
                window.location.href = 'index.html';
            }
        });
    });

    if (window.location.href.indexOf('index.html') > -1) {
        var anaYemekPage1 = document.querySelector('.ana-yemek-page1');
        if (anaYemekPage1) {
            anaYemekPage1.classList.add('active');
        }
    } else if (window.location.href.indexOf('sayfa2.html') > -1) {
        var anaYemekPage4 = document.querySelector('.ana-yemek-page4');
        if (anaYemekPage4) {
            anaYemekPage4.classList.add('active');
        }
    }

    document.querySelectorAll('.page-navigation-ana-yemek span').forEach(function (navItem) {
        navItem.addEventListener('click', function () {
            if (this.classList.contains('ana-yemek-page4')) {
                window.location.href = 'sayfa2.html';
            } else if (this.classList.contains('ana-yemek-page1')) {
                window.location.href = 'index.html';
            }
        });
    });
});
