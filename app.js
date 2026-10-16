
    // ----------------- GLOBAL DEVLET VE VERİTABANI YÖNETİMİ -----------------

    let recognition;
    let isRecording = false;
    let isSpeechEnabled = false; // Tek bir let tanımı ile korunuyor
    let currentUser = {
      role: 'President',
      city_id: null,
      displayName: 'Türkiye Genel Sorumlusu'
    };

    // Ana Veritabanı (Mock Teşkilat Verileri)
    let dbActivities = [
      { id: "act_101", dateText: "13-19 Temmuz 2026", date: "2026-07-15", city: "Siirt", district: "Merkez", level: "Lise", school: "Siirt Anadolu Lisesi", location: "Kütüphane", type: "Komisyon Toplantısı", participants: 12, volunteers: 3, notes: "Haftalık komisyon planlama toplantısı." },
      { id: "act_102", dateText: "13-19 Temmuz 2026", date: "2026-07-16", city: "İstanbul", district: "Fatih", level: "Üniversite", school: "İstanbul Üniversitesi", location: "Genç Ofis", type: "Haftalık Eğitim", participants: 45, volunteers: 5, notes: "Üniversite gençliği ile kitap tahlili." },
      { id: "act_103", dateText: "13-19 Temmuz 2026", date: "2026-07-14", city: "Ankara", district: "Çankaya", level: "Üniversite", school: "Hacettepe Üniversitesi", location: "Teşkilat Salonu", type: "Workshop", participants: 60, volunteers: 8, notes: "Akademik proje workshop çalışması yapıldı." },
      { id: "act_104", dateText: "06-12 Temmuz 2026", date: "2026-07-08", city: "İstanbul", district: "Üsküdar", level: "Lise", school: "İstanbul Erkek Lisesi", location: "Sınıf", type: "Haftalık Eğitim", participants: 50, volunteers: 4, notes: "Değerler eğitimi çalışması." },
      { id: "act_105", dateText: "06-12 Temmuz 2026", date: "2026-07-10", city: "Bursa", district: "Osmangazi", level: "Ortaokul", school: "Osmangazi Ortaokulu", location: "Çok Amaçlı Salon", type: "Ziyaret Programı", participants: 18, volunteers: 2, notes: "Okul idaresi koordinasyon ziyareti." }
    ];

    // Aktif form kartları dizisi
    let activeFormCards = [];


    const STORAGE_KEY = "serdengectiler.v1";
    let savedDrafts = {};
    let storageBlocked = false;
    let observedRaw = null;
    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    }
    function draftKey() { return currentUser.role + ":" + (currentUser.city_id || "all"); }
    function canAccess(act) { return currentUser.role === "President" || act.city === currentUser.city_id; }
    function validRecord(a, draft = false) {
      return a && /^[a-zA-Z0-9_-]+$/.test(a.id) && TURKEY_CITIES.includes(a.city) && ["Üniversite","Lise","Ortaokul","Çocuk Birimi"].includes(a.level) &&
        ["city","level","school","type","date","district","location","notes"].every(k => typeof a[k] === "string" && a[k].length <= 2000) &&
        (draft || (a.school.trim() && a.type.trim() && /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
        new Date(a.date + "T12:00:00Z").toISOString().slice(0,10) === a.date &&
        Number.isInteger(Number(a.participants)) && Number(a.participants) > 0 &&
        Number(a.participants) <= 100000 && Number.isInteger(Number(a.volunteers)) &&
        Number(a.volunteers) >= 0 && Number(a.volunteers) <= 100000));
    }
    function persist(nextActivities = dbActivities, nextDrafts = savedDrafts) {
      if (storageBlocked) { showToast("Depolama okunamadı. Veriyi korumak için kayıt engellendi; tarayıcı depolamasını kontrol et.", "error"); return false; }
      try {
        if (localStorage.getItem(STORAGE_KEY) !== observedRaw) { showToast("Başka sekmede veri değişti. Kaydetmeden önce bu sayfayı yenile; formunu önce kopyala.", "error"); return false; }
        const encoded = JSON.stringify({version:1, activities:nextActivities, drafts:nextDrafts});
        localStorage.setItem(STORAGE_KEY, encoded);
        observedRaw = encoded;
        dbActivities = nextActivities; savedDrafts = nextDrafts; return true;
      } catch { showToast("Kaydedilemedi: tarayıcı depolaması kapalı veya dolu. Form korunuyor.", "error"); return false; }
    }
    function loadStored() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        observedRaw = raw;
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.version !== 1 || !Array.isArray(data.activities) || !data.activities.every(a => validRecord(a)) ||
            !data.drafts || typeof data.drafts !== "object" || !Object.values(data.drafts).every(v => Array.isArray(v) && v.every(a => validRecord(a,true)))) throw Error();
        dbActivities = data.activities; savedDrafts = data.drafts;
      } catch { storageBlocked = true; showToast("Kayıtlı veri okunamadı; mevcut veri silinmedi. Kayıt işlemleri engellendi.", "error"); }
    }

    // İl listesi
    const TURKEY_CITIES = [
      "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
    ].sort((a,b) => a.localeCompare(b, 'tr'));

    // Coğrafi 81 İl Koordinatları
    const CITIES_COORDS = [
      { name: "Adana", x: 420, y: 280 }, { name: "Adıyaman", x: 530, y: 250 }, { name: "Afyonkarahisar", x: 220, y: 190 },
      { name: "Ağrı", x: 740, y: 130 }, { name: "Amasya", x: 460, y: 100 }, { name: "Ankara", x: 320, y: 140 },
      { name: "Antalya", x: 230, y: 280 }, { name: "Artvin", x: 700, y: 60 }, { name: "Aydın", x: 100, y: 230 },
      { name: "Balıkesir", x: 100, y: 120 }, { name: "Bilecik", x: 190, y: 120 }, { name: "Bingöl", x: 640, y: 180 },
      { name: "Bitlis", x: 710, y: 200 }, { name: "Bolu", x: 270, y: 100 }, { name: "Burdur", x: 200, y: 250 },
      { name: "Bursa", x: 160, y: 110 }, { name: "Çanakkale", x: 60, y: 90 }, { name: "Çankırı", x: 350, y: 100 },
      { name: "Çorum", x: 410, y: 100 }, { name: "Denizli", x: 140, y: 230 }, { name: "Diyarbakır", x: 600, y: 230 },
      { name: "Edirne", x: 60, y: 40 }, { name: "Elazığ", x: 580, y: 200 }, { name: "Erzincan", x: 580, y: 140 },
      { name: "Erzurum", x: 680, y: 130 }, { name: "Eskişehir", x: 240, y: 140 }, { name: "Gaziantep", x: 490, y: 290 },
      { name: "Giresun", x: 550, y: 90 }, { name: "Gümüşhane", x: 590, y: 100 }, { name: "Hakkari", x: 780, y: 240 },
      { name: "Hatay", x: 440, y: 330 }, { name: "Isparta", x: 210, y: 230 }, { name: "Mersin", x: 360, y: 290 },
      { name: "İstanbul", x: 150, y: 70 }, { name: "İzmir", x: 70, y: 190 }, { name: "Kars", x: 750, y: 80 },
      { name: "Kastamonu", x: 340, y: 70 }, { name: "Kayseri", x: 420, y: 190 }, { name: "Kırklareli", x: 80, y: 20 },
      { name: "Kırşehir", x: 360, y: 170 }, { name: "Kocaeli", x: 190, y: 80 }, { name: "Konya", x: 310, y: 230 },
      { name: "Kütahya", x: 180, y: 160 }, { name: "Malatya", x: 520, y: 200 }, { name: "Manisa", x: 90, y: 170 },
      { name: "Kahramanmaraş", x: 470, y: 240 }, { name: "Mardin", x: 660, y: 260 }, { name: "Muğla", x: 100, y: 270 },
      { name: "Muş", x: 690, y: 170 }, { name: "Nevşehir", x: 370, y: 190 }, { name: "Niğde", x: 370, y: 220 },
      { name: "Ordu", x: 510, y: 90 }, { name: "Rize", x: 650, y: 70 }, { name: "Sakarya", x: 210, y: 90 },
      { name: "Samsun", x: 450, y: 70 }, { name: "Siirt", x: 720, y: 230 }, { name: "Sinop", x: 400, y: 50 },
      { name: "Sivas", x: 480, y: 150 }, { name: "Tekirdağ", x: 100, y: 60 }, { name: "Tokat", x: 460, y: 120 },
      { name: "Trabzon", x: 600, y: 80 }, { name: "Tunceli", x: 620, y: 160 }, { name: "Şanlıurfa", x: 550, y: 290 },
      { name: "Uşak", x: 140, y: 180 }, { name: "Van", x: 770, y: 180 }, { name: "Yozgat", x: 400, y: 140 },
      { name: "Zonguldak", x: 280, y: 70 }, { name: "Aksaray", x: 350, y: 210 }, { name: "Bayburt", x: 630, y: 110 },
      { name: "Karaman", x: 320, y: 270 }, { name: "Kırıkkale", x: 350, y: 140 }, { name: "Batman", x: 680, y: 230 },
      { name: "Şırnak", x: 740, y: 260 }, { name: "Bartın", x: 300, y: 60 }, { name: "Ardahan", x: 750, y: 50 },
      { name: "Iğdır", x: 790, y: 110 }, { name: "Yalova", x: 160, y: 90 }, { name: "Karabük", x: 310, y: 80 },
      { name: "Kilis", x: 500, y: 310 }, { name: "Osmaniye", x: 450, y: 280 }, { name: "Düzce", x: 250, y: 90 }
    ];

    // İL TEŞKİLATLARI İÇİN DETAYLI VE RESMİ ÜNİVERSİTE / OKUL VERİTABANI
    const REAL_CITY_DATA = {
      "İstanbul": {
        "Üniversite": ["İstanbul Üniversitesi", "Marmara Üniversitesi", "Boğaziçi Üniversitesi", "İstanbul Teknik Üniversitesi", "Yıldız Teknik Üniversitesi", "Galatasaray Üniversitesi", "Genç İHH İstanbul Eğitim Akademisi"],
        "Lise": ["Galatasaray Lisesi", "İstanbul Erkek Lisesi", "Kabataş Erkek Lisesi", "Cağaloğlu Anadolu Lisesi", "Kadıköy Anadolu Lisesi", "Fatih Kız Anadolu İmam Hatip Lisesi"],
        "Ortaokul": ["Fatih Ortaokulu", "Beşiktaş Atatürk Ortaokulu", "Kadıköy İmam Hatip Ortaokulu", "Üsküdar Merkez Ortaokulu"],
        "Çocuk Birimi": ["Fatih Çocuk Gelişim Merkezi", "Başakşehir Çocuk Kulübü"]
      },
      "Ankara": {
        "Üniversite": ["Hacettepe Üniversitesi", "Ankara Üniversitesi", "Orta Doğu Teknik Üniversitesi", "Gazi Üniversitesi", "Bilkent Üniversitesi", "Ankara Yıldırım Beyazıt Üniversitesi", "Genç İHH Ankara Eğitim Akademisi"],
        "Lise": ["Ankara Atatürk Lisesi", "Gazi Anadolu Lisesi", "Ankara Fen Lisesi", "Tevfik İleri Anadolu İmam Hatip Lisesi", "Keçiören Anadolu Lisesi"],
        "Ortaokul": ["Keçiören İmam Hatip Ortaokulu", "Yenimahalle Merkez Ortaokulu", "Çankaya Atatürk Ortaokulu", "Mamak Ortaokulu"],
        "Çocuk Birimi": ["Kızılcahamam Çocuk Birimi", "Altındağ Çocuk Kulübü"]
      },
      "İzmir": {
        "Üniversite": ["Ege Üniversitesi", "Dokuz Eylül Üniversitesi", "İzmir Yüksek Teknoloji Enstitüsü", "Yaşar Üniversitesi", "Katip Çelebi Üniversitesi", "Genç İHH İzmir Eğitim Akademisi"],
        "Lise": ["İzmir Fen Lisesi", "Bornova Anadolu Lisesi", "İzmir Atatürk Lisesi", "Konak Anadolu İmam Hatip Lisesi"],
        "Ortaokul": ["Konak Merkez Ortaokulu", "Bornova Ortaokulu", "Karşıyaka İmam Hatip Ortaokulu"],
        "Çocuk Birimi": ["Buca Çocuk Birimi", "Bornova Çocuk Akademisi"]
      },
      "Siirt": {
        "Üniversite": ["Siirt Üniversitesi", "Genç İHH Siirt Akademisi", "Siirt Yüksek Öğrenim Vakfı Merkez Birimi"],
        "Lise": ["Siirt Anadolu Lisesi", "Siirt Fen Lisesi", "Siirt Sosyal Bilimler Lisesi", "Siirt Selami Değer Anadolu Lisesi", "Siirt Anadolu İmam Hatip Lisesi"],
        "Ortaokul": ["Siirt Merkez İmam Hatip Ortaokulu", "Sancak Ortaokulu", "14 Eylül Ortaokulu", "Siirt Çocuk Gelişim Ortaokulu"],
        "Çocuk Birimi": ["Siirt Yetim ve Çocuk Merkezi", "Merkez Çocuk Oyun Atölyesi"]
      },
      "Bursa": {
        "Üniversite": ["Bursa Uludağ Üniversitesi", "Bursa Teknik Üniversitesi", "Genç İHH Bursa Eğitim Akademisi"],
        "Lise": ["Bursa Anadolu Lisesi", "Bursa Erkek Lisesi", "Tophane Mesleki ve Teknik Anadolu Lisesi", "Bursa Merkez Anadolu İmam Hatip Lisesi"],
        "Ortaokul": ["Osmangazi Ortaokulu", "Nilüfer İmam Hatip Ortaokulu", "Yıldırım Merkez Ortaokulu"],
        "Çocuk Birimi": ["Osmangazi Çocuk Birimi", "Yıldırım Çocuk Atölyesi"]
      }
    };

    // 81 İle Ait Üniversite ve Okul Listesi Çekme / Dinamik Üretme Algoritması
    function getSchoolsForCity(city, level) {
      if (!city || city === "Tümü") return ["Lütfen önce şehir seçin"];

      if (REAL_CITY_DATA[city] && REAL_CITY_DATA[city][level]) {
        return REAL_CITY_DATA[city][level];
      }

      const universities = [
        `${city} Üniversitesi`,
        `${city} Teknik Üniversitesi`,
        `Genç İHH ${city} Eğitim Akademisi`,
        `${city} Bilim ve Teknoloji Üniversitesi`
      ];

      const highSchools = [
        `${city} Anadolu Lisesi`,
        `${city} Fen Lisesi`,
        `${city} Anadolu İmam Hatip Lisesi`,
        `${city} Sosyal Bilimler Lisesi`,
        `Genç İHH ${city} Gönüllü Lisesi`
      ];

      const middleSchools = [
        `${city} İmam Hatip Ortaokulu`,
        `${city} Merkez Ortaokulu`,
        `${city} Cumhuriyet Ortaokulu`,
        `Genç İHH ${city} Çocuk Ortaokulu`
      ];

      if (level === "Üniversite") return universities;
      if (level === "Lise") return highSchools;
      if (level === "Ortaokul" || level === "Çocuk Birimi") return middleSchools;

      return [...universities, ...highSchools, ...middleSchools];
    }

    // Seçilen Tarih Haftasına Ait Dinamik Aylık Kaydırma Kütüphanesi
    function get6MonthsLeadingTo(dateString) {
      const date = new Date(dateString || "2026-07-18");
      let year = date.getFullYear();
      let monthIndex = date.getMonth();

      const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

      let months = [];
      for (let i = 5; i >= 0; i--) {
        let m = monthIndex - i;
        let y = year;
        if (m < 0) {
          m += 12;
          y -= 1;
        }
        months.push({ name: monthNames[m], label: `${monthNames[m]} '${String(y).substring(2)}` });
      }
      return months;
    }

    // ----------------- DETERMINISTIK ANALITIK VERI MOTORU -----------------
    // ----------------- ILK YUKLEME VE NAVIGASYON -----------------
    document.addEventListener("DOMContentLoaded", () => {
      loadStored();
      initNavigation();
      initSpeechRecognition();
      setupCitySelectFilters();

      // Güvenli KaTeX Matematiksel Otomatik Çizim Tetikleyicisi
      try {
        if (typeof renderMathInElement === "function") {
          renderMathInElement(document.body);
        }
      } catch (err) {
        console.warn("KaTeX render deferred: ", err);
      }
    });

    function initNavigation() {
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
          const targetPage = e.currentTarget.getAttribute("data-page");

          navLinks.forEach(nl => nl.classList.remove("active"));
          e.currentTarget.classList.add("active");

          document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
          document.getElementById(targetPage).classList.add("active-page");

          if(targetPage === 'dashboardPage') {
            renderDashboard();
          } else if(targetPage === 'reportFormPage') {
            if(activeFormCards.length === 0) {
              addNewBlankFormCard();
            }
          } else if(targetPage === 'managementPage') {
            applyFiltersAndRender();
          }
        });
      });
    }

    function setupCitySelectFilters() {
      const filterCity = document.getElementById("filter-city");
      const editCity = document.getElementById("edit-city");
      const dashFilterCity = document.getElementById("dash-filter-city");

      let filterOptions = `<option value="Tümü">Tüm Şehirler</option>`;
      let dashFilterOptions = `<option value="Tümü">Türkiye Geneli (Tümü)</option>`;
      let editOptions = ``;

      TURKEY_CITIES.forEach(c => {
        filterOptions += `<option value="${c}">${c}</option>`;
        dashFilterOptions += `<option value="${c}">${c}</option>`;
        editOptions += `<option value="${c}">${c}</option>`;
      });

      if(filterCity) filterCity.innerHTML = filterOptions;
      if(dashFilterCity) dashFilterCity.innerHTML = dashFilterOptions;
      if(editCity) editCity.innerHTML = editOptions;
    }

    // ----------------- OTURUM DOĞRULAMA (RBAC) -----------------
    function selectQuickRole(role, cityId, displayName, email, btnId) {
      currentUser.role = role;
      currentUser.city_id = cityId;
      currentUser.displayName = displayName;

      document.getElementById("login-email").value = email;

      document.querySelectorAll('.role-selector-btn').forEach(btn => {
        btn.classList.remove('border-[#009639]', 'ring-2', 'ring-emerald-100');
      });

      if(btnId) {
        document.getElementById(btnId).classList.add('border-[#009639]', 'ring-2', 'ring-emerald-100');
      }

      showToast(`${displayName} rolü seçildi!`, 'info');
    }

    function loginUser() {
      activeFormCards = structuredClone(savedDrafts[draftKey()] || []);
      renderFormCards();
      const loginPageEl = document.getElementById("loginPage");
      const appEl = document.getElementById("app");
      if (loginPageEl) loginPageEl.classList.add("hidden");
      if (appEl) appEl.classList.remove("hidden");

      // Header ve Yetki Kartı Güncelleme
      const headerNameEl = document.getElementById("header-name");
      const headerRoleEl = document.getElementById("header-role");
      if (headerNameEl) headerNameEl.textContent = currentUser.displayName;
      if (headerRoleEl) headerRoleEl.textContent = currentUser.role === 'President' ? 'Türkiye Genel Sorumlusu' : `${currentUser.city_id} Temsilcisi`;

      renderBadges();
      onCityFilterChanged();
      renderDashboard();

      showToast("Demo görünümü açıldı.", "success");
    }

    function logoutUser() {
      document.getElementById("app").classList.add("hidden");
      document.getElementById("loginPage").classList.remove("hidden");
      stopRecording();
      activeFormCards = [];
      document.querySelector('[data-page="dashboardPage"]').click();
      showToast("Oturum kapatıldı.", "info");
    }

    // Rozetleri dinamik çizdirme (Görsel 1 ile birebir uyumlu)
    function renderBadges() {
      const badgesContainer = document.getElementById("header-badges");
      if (!badgesContainer) return;
      badgesContainer.innerHTML = "";

      const badgeTemplates = [
        { icon: "fa-microphone", color: "text-amber-600", bg: "bg-amber-100 border-amber-300", title: "Ses Hızı" },
        { icon: "fa-arrow-trend-up", color: "text-slate-400", bg: "bg-slate-100 border-slate-300", title: "Zirveye Doğru" },
        { icon: "fa-shield-halved", color: "text-slate-400", bg: "bg-slate-100 border-slate-300", title: "Veri Muhafızı" },
        { icon: "fa-house-fire", color: "text-amber-600", bg: "bg-amber-100 border-amber-300", title: "Afet Öncüsü" }
      ];

      badgeTemplates.forEach(b => {
        badgesContainer.innerHTML += `
          <span class="px-2 py-0.5 rounded-full ${b.bg} ${b.color} border text-[9px] font-bold flex items-center gap-1 cursor-pointer" title="${b.title}">
            <i aria-hidden="true" class="fa-solid ${b.icon}"></i> ${b.title}
          </span>
        `;
      });
    }

    // ----------------- GÖSTERGE PANELİ, HARİTA & HAFTALIK KATILIM ANALİTİĞİ -----------------
    function onCityFilterChanged() {
      const citySelect = document.getElementById("dash-filter-city");
      const birimSelect = document.getElementById("dash-filter-level");
      const schoolSelect = document.getElementById("dash-filter-school");

      if (!citySelect || !birimSelect || !schoolSelect) return;

      const city = citySelect.value;
      const birim = birimSelect.value;

      if (city === "Tümü") {
        schoolSelect.innerHTML = `<option value="Tümü">İlgili Birimdeki Tüm Okullar</option>`;
      } else {
        const schools = getSchoolsForCity(city, birim);
        let options = `<option value="Tümü">Tüm Kurumlar</option>`;
        schools.forEach(s => {
          options += `<option value="${s}">${s}</option>`;
        });
        schoolSelect.innerHTML = options;
      }
      onDashboardFiltersChanged();
    }

    function onBirimFilterChanged() {
      onCityFilterChanged();
    }

    function onDashboardFiltersChanged() {
      renderDashboard();
    }

    function renderDashboard() {
      const isPresident = currentUser.role === 'President';
      const allowedCity = currentUser.city_id;

      const cityFilterEl = document.getElementById("dash-filter-city");
      const levelFilterEl = document.getElementById("dash-filter-level");
      const schoolFilterEl = document.getElementById("dash-filter-school");
      const typeFilterEl = document.getElementById("dash-filter-type");
      const startDateEl = document.getElementById("dash-start-date");

      const selectedCityFilter = cityFilterEl ? cityFilterEl.value : "Tümü";
      const selectedLevelFilter = levelFilterEl ? levelFilterEl.value : "Tümü";
      const selectedSchoolFilter = schoolFilterEl ? schoolFilterEl.value : "Tümü";
      const selectedTypeFilter = typeFilterEl ? typeFilterEl.value : "Tümü";
      const selectedDateFilter = startDateEl ? startDateEl.value : "2026-07-18";

      // Yetkiye ve süzgeçlere göre faaliyet havuzunu filtreleme
      const filtered = dbActivities.filter(act => {
        if (!isPresident && act.city.toLowerCase() !== allowedCity.toLowerCase()) {
          return false;
        }
        if (selectedCityFilter !== "Tümü" && act.city !== selectedCityFilter) {
          return false;
        }
        if (selectedLevelFilter !== "Tümü" && act.level !== selectedLevelFilter) {
          return false;
        }
        if (selectedSchoolFilter !== "Tümü" && act.school !== selectedSchoolFilter) {
          return false;
        }
        if (selectedTypeFilter !== "Tümü" && act.type !== selectedTypeFilter) {
          return false;
        }
        return !selectedDateFilter || act.date <= selectedDateFilter;
      });

      // UI Gösterge Güncellemeleri - Safe Set Helpers (TypeError Engelleme)
      const currentSelectionName = selectedCityFilter !== "Tümü" ? selectedCityFilter : (isPresident ? "Türkiye Geneli" : allowedCity);

      const setSafeText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      setSafeText("dashCityName", currentSelectionName);
      setSafeText("side-city-header", currentSelectionName);
      setSafeText("dashTotalActivities", filtered.length);

      // Dinamik Katılımcı Hacmi
      const totalParticipants = filtered.reduce((s, a) => s + parseInt(a.participants || 0), 0);
      setSafeText("dashTotalParticipants", totalParticipants);

      // Dinamik Karne Skoru
      let dynamicScore = "16.67";
      if (filtered.length > 0) {
        dynamicScore = (totalParticipants / (filtered.length * 10)).toFixed(2);
      } else {
        dynamicScore = "0.00";
      }
      setSafeText("dashScore", `${dynamicScore} Puan`);
      setSafeText("side-score-badge", dynamicScore);

      // Sağ Panel Bilgi Güncelleme
      const targetCount = "Tanımlanmadı";
      setSafeText("side-target-count", targetCount);
      setSafeText("side-active-count", filtered.length);

      // Gelişmiş Üçlü Grafik Güncelleme Motoru (Deterministik AI Algoritması ile)
      drawTurkeyCitiesMap(currentSelectionName, filtered);
      renderAnalyticsCharts(selectedCityFilter, selectedLevelFilter, selectedSchoolFilter, selectedTypeFilter, selectedDateFilter, filtered);
    }

    // Seçilen il, birim, okul, etkinlik ve tarihe göre ÜÇLÜ grafiği (Çizgi, Sütun, Pasta) çizdirir
    function renderAnalyticsCharts(city, level, school, type, date, filtered) {
      const trendSubtitle = document.getElementById("trend-subtitle");
      const trendRatioPercentage = document.getElementById("trend-ratio-percentage");

      const currentCity = city === "Tümü" ? "Tüm iller" : city;
      const currentLevel = level;
      const currentSchool = school;
      const currentType = type;
      const currentDate = date || "2026-07-18";

      // Altyazıyı güncelle
      if (trendSubtitle) {
        trendSubtitle.textContent = `${currentCity} ili ${currentLevel} birimi - ${currentSchool} (${currentType} - ${currentDate})`;
      }


      const endDate = new Date(currentDate + "T23:59:59");
      const weekly = Array(5).fill(0), monthly = Array(6).fill(0);
      for (const item of filtered) {
        const d = new Date(item.date + "T12:00:00");
        const days = Math.floor((endDate-d)/86400000);
        const months = (endDate.getFullYear()-d.getFullYear())*12 + endDate.getMonth()-d.getMonth();
        if (days >= 0 && days < 35) weekly[4-Math.floor(days/7)] += Number(item.participants);
        if (months >= 0 && months < 6) monthly[5-months] += Number(item.participants);
      }
      // Participant categories are not collected: do not invent demographic ratios.
      const pie = [0,0,0];
      // 1. ÇİZGİ GRAFİĞİ ÇİZİMİ (Line Chart - SVG) - Y-Ekseni Grid Çizgileri ve Sayısal Veriler Eklendi
      const maxWeekly = Math.max(...weekly) || 100;
      const lineCoords = weekly.map((val, idx) => {
        const x = 50 + (idx / 4) * 510; // 50 ile 560 arasına dağıtıldı (Sol Y-Ekseni payı ayrıldı)
        const y = 130 - (val / maxWeekly) * 100; // 30 ile 130 dikey aralığı
        return { x, y, val };
      });

      const linePath = `M ${lineCoords[0].x},${lineCoords[0].y} ` + lineCoords.slice(1).map(c => `L ${c.x},${c.y}`).join(' ');
      const areaPath = `${linePath} L ${lineCoords[lineCoords.length - 1].x},130 L ${lineCoords[0].x},130 Z`;

      const trendSvg = document.getElementById("trend-svg-chart");

      if (trendSvg) {
        // Dinamik Y-Ekseni Kademe Sayıları ve Kılavuz Çizgileri
        const yGridLevels = [0, 0.25, 0.5, 0.75, 1];
        let gridLinesHtml = yGridLevels.map(ratio => {
          const val = Math.round(maxWeekly * ratio);
          const y = 130 - (ratio * 100);
          return `
            <line x1="45" y1="${y}" x2="570" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
            <text x="35" y="${y + 3}" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="end">${val}</text>
          `;
        }).join('');

        trendSvg.innerHTML = `
          <defs>
            <linearGradient id="grad-trend" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#009639" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#009639" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Y-Ekseni Sayısal Değerleri ve Kılavuz Gridleri -->
          ${gridLinesHtml}

          <!-- Alan Degrade Dolgusu -->
          <path d="${areaPath}" fill="url(#grad-trend)"/>
          <!-- Çizgi Yolu -->
          <path d="${linePath}" fill="none" stroke="#009639" stroke-width="3" stroke-linecap="round"/>

          <!-- Etkileşim Noktaları ve Veriler -->
          ${lineCoords.map((c, idx) => `
            <g class="group cursor-pointer">
              <circle cx="${c.x}" cy="${c.y}" r="6" fill="#f39c12" stroke="#ffffff" stroke-width="2"/>
              <!-- Değer Etiketi (Her Zaman Görünür) -->
              <text x="${c.x}" y="${c.y - 12}" font-family="sans-serif" font-size="9" font-weight="black" fill="#1e293b" text-anchor="middle">${c.val}</text>
              <!-- X Ekseni Etiketi (Haftalar) -->
              <text x="${c.x}" y="155" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="middle">${idx + 1}. Hafta</text>
            </g>
          `).join('')}
        `;
      }

      // Çizgi grafiğindeki son hafta değişim oranı hesaplaması
      if (trendRatioPercentage) {
        const lastWeek = weekly[4];
        const prevWeek = weekly[3];
        const ratio = Math.round(((lastWeek - prevWeek) / (prevWeek || 1)) * 100);
        if (prevWeek === 0) { trendRatioPercentage.textContent = "Önceki hafta karşılaştırması yok"; }
        else if (ratio >= 0) {
          trendRatioPercentage.textContent = `+%${ratio} Gelişim`;
          trendRatioPercentage.className = "text-[10px] text-[#009639] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 font-black";
        } else {
          trendRatioPercentage.textContent = `-%${Math.abs(ratio)} Gerileme`;
          trendRatioPercentage.className = "text-[10px] text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 font-black";
        }
      }

      // 2. SÜTUN GRAFİĞİ ÇİZİMİ (Bar Chart - SVG) - Y-Ekseni Grid Çizgileri ve Sayısal Veriler Eklendi
      const maxMonthly = Math.max(...monthly) || 150;
      const barSvg = document.getElementById("bar-svg-chart");

      if (barSvg) {
        const leadingMonths = get6MonthsLeadingTo(currentDate);
        const yBarGridLevels = [0, 0.25, 0.5, 0.75, 1];
        let barGridLinesHtml = yBarGridLevels.map(ratio => {
          const val = Math.round(maxMonthly * ratio);
          const y = 130 - (ratio * 100);
          return `
            <line x1="45" y1="${y}" x2="570" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
            <text x="35" y="${y + 3}" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="end">${val}</text>
          `;
        }).join('');

        let barHtml = barGridLinesHtml;

        monthly.forEach((val, idx) => {
          const x = idx * 85 + 65; // offset 65 ile 490 arasına dengelendi
          const barHeight = (val / maxMonthly) * 100;
          const y = 130 - barHeight;
          barHtml += `
            <g class="group cursor-pointer">
              <!-- Köşeleri Yuvarlatılmış Sütun Dikdörtgeni -->
              <rect x="${x}" y="${y}" width="28" height="${barHeight}" rx="4" fill="#009639" class="transition-all duration-300 hover:fill-[#c59b27]" />
              <!-- Sütun Üzeri Değer Etiketi (Her Zaman Görünür) -->
              <text x="${x + 14}" y="${y - 8}" font-family="sans-serif" font-size="9" font-weight="black" fill="#1e293b" text-anchor="middle">${val}</text>
              <!-- X Ekseni Etiketi (Aylar) -->
              <text x="${x + 14}" y="155" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#64748b" text-anchor="middle">${leadingMonths[idx].label}</text>
            </g>
          `;
        });
        barSvg.innerHTML = barHtml;
      }

      // 3. PASTA GRAFİĞİ GÜNCELLEMESİ (Pie Chart - CSS Conic Gradient)
      const pieRender = document.getElementById("pie-chart-render");
      if (pieRender) {
        const p1 = pie[0];
        const p2 = pie[1];
        const p3 = pie[2];

        pieRender.style.background = "#e5e7eb";

        const setSafeText = (id, text) => {
          const el = document.getElementById(id);
          if (el) el.textContent = text;
        };

        setSafeText("pie-lbl-students", "Ölçülmüyor");
        setSafeText("pie-lbl-volunteers", "Ölçülmüyor");
        setSafeText("pie-lbl-members", "Ölçülmüyor");
      }
    }

    // 81 İl Düğüm Haritası Oluşturucu ( Constellation/Bubble Yapısında)
    function drawTurkeyCitiesMap(activeCityName, records = dbActivities) {
      const group = document.getElementById("map-cities-nodes-group");
      if (!group) return;
      group.innerHTML = "";

      // Şehirlerin faaliyet sayılarını hesapla (Boyutlandırma için)
      const cityActivityCounts = {};
      records.forEach(act => {
        cityActivityCounts[act.city] = (cityActivityCounts[act.city] || 0) + 1;
      });

      CITIES_COORDS.forEach(city => {
        const count = cityActivityCounts[city.name] || 0;
        const radius = count > 0 ? 5 + Math.min(count * 2.5, 9) : 4.5;
        const isSelected = city.name === activeCityName;

        let fillColor = "#94a3b8"; // Varsayılan pasif slate rengi
        let strokeColor = "transparent";
        let strokeWidth = 0;

        if (count > 0) {
          fillColor = "#009639"; // Aktif IHH Yeşili
        }
        if (isSelected) {
          fillColor = "#c59b27"; // Seçili IHH Altın Sarısı
          strokeColor = "#ffffff";
          strokeWidth = 2;
        }

        // SVG Grup elemanı
        const cityG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        cityG.setAttribute("class", "cursor-pointer group");
        cityG.addEventListener("click", () => {
          selectCityFromMap(city.name);
        });

        // Çember Düğüm (Bubble)
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", city.x);
        circle.setAttribute("cy", city.y);
        circle.setAttribute("r", radius);
        circle.setAttribute("fill", fillColor);
        circle.setAttribute("class", "map-city-node");
        if (strokeWidth > 0) {
          circle.setAttribute("stroke", strokeColor);
          circle.setAttribute("stroke-width", strokeWidth);
        }

        // Önemli büyük illeri haritada her zaman etiketle, diğerleri hover durumunda görünecek
        const alwaysShowLabel = ["İstanbul", "Ankara", "Siirt", "İzmir", "Diyarbakır", "Samsun", "Van", "Bursa"].includes(city.name);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", city.x);
        text.setAttribute("y", city.y - (radius + 4));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-family", "sans-serif");
        text.setAttribute("font-size", "8");
        text.setAttribute("font-weight", alwaysShowLabel || isSelected ? "800" : "500");
        text.setAttribute("class", alwaysShowLabel || isSelected ? "" : "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none");
        text.textContent = city.name;

        cityG.appendChild(circle);
        cityG.appendChild(text);
        group.appendChild(cityG);
      });
    }

    // Haritadan il tıklanınca tetiklenen filtreleme fonksiyonu
    function selectCityFromMap(cityName) {
      if(currentUser.role === 'Representative' && cityName.toLowerCase() !== currentUser.city_id.toLowerCase()) {
        showCustomModal("Erişim Sınırlandırıldı", "İl Temsilcisi yetkisindeyken sadece kendi şehrinizin verilerini inceleyebilirsiniz.", null);
        return;
      }
      const filterCityEl = document.getElementById("dash-filter-city");
      if (filterCityEl) {
        filterCityEl.value = cityName;
        onCityFilterChanged();
        showToast(`${cityName} ili seçildi ve tüm göstergeler güncellendi!`, "success");
      }
    }

    // ----------------- TEŞKİLAT DURUMU GÖSTERGE BARLARI (Uyum Koruması) -----------------
    function renderDistributionBars(filteredList) {
      const counts = { "Üniversite": 0, "Lise": 0, "Ortaokul": 0, "Çocuk Birimi": 0 };
      filteredList.forEach(act => {
        if(counts[act.level] !== undefined) {
          counts[act.level]++;
        }
      });
    }

    // ----------------- AI SESLİ NLP & RAPOR GİRİŞ SİSTEMİ -----------------
    function initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.log = false;
        recognition.lang = 'tr-TR';
        recognition.interimResults = false;

        recognition.onstart = () => {
          isRecording = true;
          document.getElementById("mic-status").textContent = "Dinleniyor...";
          document.getElementById("mic-status").className = "inline-block mt-2 text-[10px] font-black tracking-widest text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full uppercase";
          document.getElementById("mic-icon").className = "fa-solid fa-microphone-slash";
          document.getElementById("mic-pulse").classList.remove("hidden");
          showToast("Ses kaydı başladı, konuşun.", "info");
        };

        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          const txt = document.getElementById("nlp-text-input");
          txt.value = txt.value ? txt.value + " " + transcript : transcript;
        };

        recognition.onerror = () => stopRecording();
        recognition.onend = () => stopRecording();
      } else {
        document.getElementById("mic-status").textContent = "Desteklenmiyor";
        document.getElementById("mic-btn").disabled = true;
      }
    }

    function toggleSpeech() {
      if(!recognition) { showToast("Bu tarayıcı sesli yazımı desteklemiyor. Metni elle girebilirsin.", "info"); return; }
      if(isRecording) {
        recognition.stop();
      } else {
        try { recognition.start(); } catch { showToast("Mikrofon başlatılamadı.", "error"); }
      }
    }

    function stopRecording() {
      if (recognition && isRecording) recognition.stop();
      isRecording = false;
      document.getElementById("mic-status").textContent = "Hazır";
      document.getElementById("mic-status").className = "inline-block mt-2 text-[10px] font-black tracking-widest text-gray-400 bg-white border px-2.5 py-0.5 rounded-full uppercase";
      document.getElementById("mic-icon").className = "fa-solid fa-microphone";
      document.getElementById("mic-pulse").classList.add("hidden");
    }

    function fillSampleNlpText() {
      const samples = [
        "Ankara Çankaya'da Üniversite düzeyinde Hacettepe Üniversitesi'nde Teşkilat Salonu konumunda Workshop gerçekleştirdik. 45 katılımcı vardı ve 8 gönüllü görev aldı.",
        "Siirt ilinde lise düzeyinde Merkez teşkilat ofisinde Genç Ofis konumunda haftalık eğitim programı yaptık. Katılımcı sayısı 14 oldu.",
        "Komisyon toplantısı organize ettik. Ankara Çankaya'da üniversite teşkilatı ile Hacettepe Üniversitesi'nde mescit konumunda toplandık. 10 kişi katıldı."
      ];
      document.getElementById("nlp-text-input").value = samples[Math.floor(Math.random() * samples.length)];
      showToast("Örnek rapor metni yüklendi.", "info");
    }


    function analyzeNlpWithGemini() { showToast("Otomatik alan çıkarımı bağlı değil. Metni kontrol ederek manuel formu doldur.", "info"); }
    function triggerImageUpload() { showToast("Fotoğrafla katılımcı sayımı uygulanmadı. Sayıyı manuel gir.", "info"); }
    function simulatePhotoAnalysis() { triggerImageUpload(); }
    function applyAiRecommendation() { showToast("Otomatik öneri servisi bu demoya bağlı değil.", "info"); }
    function closeAiModal() { document.getElementById("ai-modal").classList.add("hidden"); }
    async function copyAiContent() {
      try { await navigator.clipboard.writeText(document.getElementById("aiModalContent").textContent); showToast("Kopyalandı.", "success"); }
      catch { showToast("Panoya erişilemedi.", "error"); }
    }

    // ----------------- DİNAMİK FORM KARTLARININ ÇİZİMİ -----------------
    function addNewBlankFormCard() {
      const defaultData = {
        id: "f_" + crypto.randomUUID(),
        city: currentUser.city_id || "İstanbul",
        district: "",
        level: "Üniversite",
        school: "",
        location: "",
        type: "Haftalık Ders",
        date: new Date().toLocaleDateString("en-CA"),
        participants: 0,
        volunteers: 0,
        notes: ""
      };
      activeFormCards.push(defaultData);
      renderFormCards();
    }

    function removeFormCard(id) {
      if(activeFormCards.length === 1) {
        showToast("En az bir faaliyet kartı bulunmalıdır.", "info");
        return;
      }
      activeFormCards = activeFormCards.filter(c => c.id !== id);
      renderFormCards();
    }

    // ----------------- FORM VE ALAN DEĞER DEĞİŞİKLİĞİ TAKİBİ -----------------
    function updateCardField(id, field, value) {
      const card = activeFormCards.find(c => c.id === id);
      if(card) {
        card[field] = value;
        if (field === "city" || field === "level") card.school = "";
      }
      calculateCompletion();
    }

    function renderFormCards() {
      const container = document.getElementById("report-form-container");
      container.innerHTML = "";

      activeFormCards.forEach((card, index) => {
        const isCityDisabled = currentUser.role === 'Representative';
        const displayCity = isCityDisabled ? currentUser.city_id : card.city;

        const availableSchools = getSchoolsForCity(displayCity, card.level);

        const div = document.createElement("div");
        div.className = "bg-white p-5 rounded-3xl border border-gray-155 shadow-sm space-y-4";
        div.innerHTML = `
          <div class="flex justify-between items-center border-b pb-3 border-gray-150">
            <span class="text-xs font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-full">${index + 1}. Rapor Kartı</span>
            <button onclick="removeFormCard('${card.id}')" class="text-red-500 hover:text-red-755 text-xs font-bold transition flex items-center gap-1">
              <i aria-hidden="true" class="fa-solid fa-trash-can"></i> Sil
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">İL</label>
              <select onchange="updateCardField('${card.id}', 'city', this.value); renderFormCards();" ${isCityDisabled ? 'disabled' : ''} class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
                ${TURKEY_CITIES.map(c => `<option value="${c}" ${c === displayCity ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">İLÇE</label>
              <input type="text" value="${escapeHtml(card.district)}" oninput="updateCardField('${card.id}', 'district', this.value)" placeholder="Örn: Çankaya" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">KURUM TÜRÜ</label>
              <select onchange="updateCardField('${card.id}', 'level', this.value); renderFormCards();" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
                <option value="Üniversite" ${card.level === "Üniversite" ? "selected" : ""}>Üniversite</option>
                <option value="Lise" ${card.level === "Lise" ? "selected" : ""}>Lise</option>
                <option value="Ortaokul" ${card.level === "Ortaokul" ? "selected" : ""}>Ortaokul</option>
                <option value="Çocuk Birimi" ${card.level === "Çocuk Birimi" ? "selected" : ""}>Çocuk Birimi</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">KURUM ADI *</label>
              <select onchange="updateCardField('${card.id}', 'school', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
                <option value="">Seçiniz...</option>
                ${availableSchools.map(s => `<option value="${s}" ${s === card.school ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">FAALİYET TÜRÜ *</label>
              <select onchange="updateCardField('${card.id}', 'type', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
                <option value="Workshop" ${card.type === "Workshop" ? "selected" : ""}>Workshop</option>
                <option value="Komisyon Toplantısı" ${card.type === "Komisyon Toplantısı" ? "selected" : ""}>Komisyon Toplantısı</option>
                <option value="Haftalık Ders" ${card.type === "Haftalık Ders" ? "selected" : ""}>Haftalık Ders</option>
                <option value="Eğitim" ${card.type === "Eğitim" ? "selected" : ""}>Eğitim</option>
                <option value="Sosyal Faaliyet" ${card.type === "Sosyal Faaliyet" ? "selected" : ""}>Sosyal Faaliyet</option>
                <option value="Ziyaret Programı" ${card.type === "Ziyaret Programı" ? "selected" : ""}>Ziyaret Programı</option>
                <option value="Afet Bilinci Semineri" ${card.type === "Afet Bilinci Semineri" ? "selected" : ""}>Afet Bilinci Semineri</option>
                <option value="İlk Yardım Eğitimi" ${card.type === "İlk Yardım Eğitimi" ? "selected" : ""}>İlk Yardım Eğitimi</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">FAALİYET TARİHİ *</label>
              <input type="date" value="${escapeHtml(card.date)}" onchange="updateCardField('${card.id}', 'date', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium focus:outline-none">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">KATILIMCI SAYISI</label>
              <input type="number" value="${escapeHtml(card.participants)}" oninput="updateCardField('${card.id}', 'participants', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium focus:outline-none">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">GÖNÜLLÜ SAYISI</label>
              <input type="number" value="${escapeHtml(card.volunteers)}" oninput="updateCardField('${card.id}', 'volunteers', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium focus:outline-none">
            </div>

            <div class="sm:col-span-2">
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">KONUM</label>
              <input type="text" value="${escapeHtml(card.location || '')}" oninput="updateCardField('${card.id}', 'location', this.value)" placeholder="Örn: Genç Ofis, Mescit vb." class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:outline-none">
            </div>

            <div class="sm:col-span-2">
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">AÇIKLAMA / DETAYLAR</label>
              <textarea rows="2" oninput="updateCardField('${card.id}', 'notes', this.value)" class="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium focus:outline-none">${escapeHtml(card.notes)}</textarea>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
      calculateCompletion();
    }

    function calculateCompletion() {
      let filled = 0;
      let total = activeFormCards.length * 4;

      activeFormCards.forEach(c => {
        if(c.city) filled++;
        if(c.school) filled++;
        if(c.type) filled++;
        if(c.participants > 0) filled++;
      });

      const ratio = Math.round((filled/total)*100) || 0;
      document.getElementById("completion-ratio-text").textContent = `${ratio}%`;
      document.getElementById("completion-ratio-bar").style.width = `${ratio}%`;
    }

    function saveDraft() {
      if (persist(dbActivities, {...savedDrafts, [draftKey()]: structuredClone(activeFormCards)})) showToast("Taslak bu tarayıcıya kaydedildi.", "success");
    }


    function submitFinalReport() {
      const parsed = activeFormCards.map(c => ({...c, id:"act_"+crypto.randomUUID(),
        city: currentUser.role === "Representative" ? currentUser.city_id : c.city,
        dateText:c.date, participants:Number(c.participants), volunteers:Number(c.volunteers)}));
      try {
        if (!parsed.length || !parsed.every(a => validRecord(a))) throw Error();
      } catch { showToast("Kurum, geçerli tarih, pozitif tam sayı katılımcı ve negatif olmayan tam sayı gönüllü gerekli.", "error"); return; }
      const drafts = {...savedDrafts}; delete drafts[draftKey()];
      if (!persist([...parsed, ...dbActivities], drafts)) return;
      activeFormCards = []; addNewBlankFormCard(); renderDashboard();
      showToast("Rapor bu tarayıcıya kaydedildi.", "success");
      document.querySelector('[data-page="managementPage"]').click();
    }

    // ----------------- CRUD VERİ YÖNETİMİ & EXCEL DIŞA AKTARIM -----------------
    let editTargetId = null;

    function applyFiltersAndRender() {
      const tableBody = document.getElementById("crud-table-body");
      tableBody.innerHTML = "";

      const isPresident = currentUser.role === 'President';
      const allowedCity = currentUser.city_id;

      const filterCityVal = document.getElementById("filter-city").value || 'Tümü';
      const filterLevelVal = document.getElementById("filter-level").value;
      const searchSchoolVal = document.getElementById("search-school").value.toLocaleLowerCase("tr");

      const filtered = dbActivities.filter(act => {
        if(!isPresident && act.city.toLowerCase() !== allowedCity.toLowerCase()) {
          return false;
        }

        if(isPresident && filterCityVal !== 'Tümü' && act.city !== filterCityVal) return false;
        if(filterLevelVal !== 'Tümü' && act.level !== filterLevelVal) return false;
        if(searchSchoolVal && !act.school.toLocaleLowerCase("tr").includes(searchSchoolVal)) return false;

        return true;
      });

      document.getElementById("record-count-badge").textContent = `${filtered.length} Kayıt Listeleniyor`;

      if(filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-gray-400">Aranılan kriterlere uygun faaliyet bulunamadı.</td></tr>`;
        return;
      }

      filtered.forEach(act => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50/50 transition border-b border-gray-100";
        tr.innerHTML = `
          <td class="py-3.5 font-bold text-slate-800">
            <div>${escapeHtml(act.dateText || '13-19 Temmuz 2026')}</div>
            <div class="text-[9px] text-gray-400 font-medium">${escapeHtml(act.date || '2026-07-15')}</div>
          </td>
          <td class="py-3.5 font-black text-slate-800">${escapeHtml(act.city.toLocaleUpperCase("tr"))}</td>
          <td class="py-3.5"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">${escapeHtml(act.level)}</span></td>
          <td class="py-3.5 font-bold text-gray-700">${escapeHtml(act.school)}</td>
          <td class="py-3.5"><span class="bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 text-[10px] font-semibold">${escapeHtml(act.type)}</span></td>
          <td class="py-3.5 font-bold text-slate-900">${escapeHtml(act.participants)} Kişi</td>
          <td class="py-3.5 text-right space-x-2">
            <button onclick="openEditModal('${act.id}')" class="text-blue-500 hover:text-blue-700 transition font-bold text-[11px]"><i aria-hidden="true" class="fa-solid fa-pen-to-square"></i> Düzenle</button>
            <button aria-label="Sil" onclick="deleteActivity('${act.id}')" class="text-red-500 hover:text-red-700 transition font-bold text-[11px]"><i aria-hidden="true" class="fa-solid fa-trash-can"></i> Sil</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    function openAddRecordModal() {
      document.querySelector('[data-page="reportFormPage"]').click();
      showToast("Yeni rapor ekleme formuna yönlendirildiniz.", "info");
    }

    function openEditModal(id) {
      editTargetId = id;
      const act = dbActivities.find(a => a.id === id);
      if(!act || !canAccess(act)) return;

      const isRep = currentUser.role === 'Representative';
      const citySelect = document.getElementById("edit-city");
      citySelect.value = act.city;
      citySelect.disabled = isRep;

      document.getElementById("edit-level").value = act.level;
      document.getElementById("edit-school").value = act.school;
      document.getElementById("edit-type").value = act.type;
      document.getElementById("edit-participants").value = act.participants;
      document.getElementById("edit-date").value = act.date;
      document.getElementById("edit-volunteers").value = act.volunteers;
      document.getElementById("edit-location").value = act.location || "";
      document.getElementById("edit-notes").value = act.notes;

      document.getElementById("edit-modal").classList.remove("hidden");
    }

    function closeEditModal() {
      document.getElementById("edit-modal").classList.add("hidden");
    }

    function saveEditFromModal() {
      const act = dbActivities.find(a => a.id === editTargetId);
      if(!act || !canAccess(act)) return;


      const next = {...act};
      for (const field of ["city","level","school","type","participants","date","volunteers","location","notes"]) next[field] = document.getElementById("edit-"+field).value;
      if (currentUser.role === "Representative") next.city = currentUser.city_id;
      next.participants = Number(next.participants); next.volunteers = Number(next.volunteers); next.dateText = next.date;
      try { if (!validRecord(next)) throw Error(); }
      catch { showToast("Geçersiz kayıt: kurum, tarih ve tam sayı adetlerini kontrol et.", "error"); return; }
      if (!persist(dbActivities.map(a => a.id === next.id ? next : a))) return;
      closeEditModal();
      applyFiltersAndRender();
      renderDashboard();
      showToast("Faaliyet başarıyla güncellendi.", "success");
    }

    function deleteActivity(id) {
      const actOriginal = dbActivities.find(a => a.id === id);
      if(!actOriginal) return;

      if(currentUser.role === 'Representative' && actOriginal.city.toLowerCase() !== currentUser.city_id.toLowerCase()) {
        showCustomModal("Yetkisiz İşlem", "Sadece kendi şehrinize ait kayıtları silebilirsiniz.", null);
        return;
      }

      showCustomModal(
        "Kayıt Silinecek",
        `"${actOriginal.school}" okuluna ait bu faaliyet raporunu silmek istediğinizden emin misiniz?`,
        () => {
          if (!persist(dbActivities.filter(a => a.id !== id))) return;
          applyFiltersAndRender();
          renderDashboard();
          showToast("Kayıt başarıyla silindi.", "info");
        }
      );
    }

    function exportToExcel() {
      triggerDownload("excel");
    }

    function exportToCsv() {
      triggerDownload("csv");
    }

    function generatePdfReport() {
      showToast("PDF Raporlama başlatıldı. Rapor yazıcı çıktısı veya indirme olarak hazırlanıyor...", "success");
      setTimeout(() => {
        window.print();
      }, 1000);
    }

    function triggerDownload(format) {
      const isPresident = currentUser.role === 'President';
      const allowedCity = currentUser.city_id;

      const targetList = dbActivities.filter(act => {
        if (!isPresident) return act.city.toLowerCase() === allowedCity.toLowerCase();
        return true;
      });

      if(targetList.length === 0) {
        showToast("Dışa aktarılacak veri bulunamadı.", "error");
        return;
      }


      const city = document.getElementById("filter-city").value;
      const level = document.getElementById("filter-level").value;
      const search = document.getElementById("search-school").value.toLocaleLowerCase("tr");
      const rows = targetList.filter(a => (city === "Tümü" || a.city === city) && (level === "Tümü" || a.level === level) && a.school.toLocaleLowerCase("tr").includes(search));
      const cell = value => {
        let text = String(value ?? "");
        if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
        return '"' + text.replaceAll('"', '""') + '"';
      };
      const fields = ["city","level","school","location","type","date","participants","volunteers"];
      const csv = "\uFEFF" + ["Şehir;Birim;Kurum;Konum;Faaliyet;Tarih;Katılımcı;Gönüllü", ...rows.map(a => fields.map(k => cell(a[k])).join(";"))].join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
      const link = document.createElement("a"); link.href = url; link.download = "Serdengectiler_Rapor.csv"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Filtrelenen kayıtlar CSV olarak indirildi.", "success");
    }

    // ----------------- YARDIMCI MODAL VE TOAST SİSTEMİ -----------------
    function showToast(message, type = "info") {
      const container = document.getElementById("toast-container");
      const toast = document.createElement("div");
      toast.className = "p-4 rounded-2xl shadow-xl text-white text-xs font-bold flex justify-between items-center transform transition-all duration-300 translate-y-2 opacity-0";

      if(type === 'success') toast.style.backgroundColor = '#009639';
      else if(type === 'error') toast.style.backgroundColor = '#e74c3c';
      else toast.style.backgroundColor = '#1f2937';

      toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="text-white ml-2 text-base">&times;</button>
      `;
      container.appendChild(toast);

      setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 50);
      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function showCustomModal(title, message, confirmCallback) {
      const modal = document.getElementById("custom-modal");
      document.getElementById("modal-title").textContent = title;
      document.getElementById("modal-message").textContent = message;

      const confirmBtn = document.getElementById("modal-confirm-btn");
      const cancelBtn = document.getElementById("modal-cancel-btn");

      modal.classList.remove("hidden");

      const cleanup = () => {
        modal.classList.add("hidden");
      };

      cancelBtn.onclick = cleanup;
      confirmBtn.onclick = () => {
        cleanup();
        if(confirmCallback) confirmCallback();
      };
    }
