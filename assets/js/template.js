/**
 * Main Application Script & Initialization
 */

// Simpan variabel lenis di tingkat global (window) agar bisa diakses dari file/script lain
window.lenis = null;


window.submitFormThenWhatsApp = function (opts) {
  const form = opts.form;
  const alertBox = opts.alertBox;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (typeof grecaptcha !== 'undefined') {
    opts.payload['g-recaptcha-response'] = grecaptcha.getResponse();
  }

  function showAlert(type, messages) {
    alertBox.className = 'alert alert-' + type;
    alertBox.innerHTML = '';
    const list = document.createElement('ul');
    list.className = 'mb-0';
    messages.forEach(function (m) {
      const li = document.createElement('li');
      li.textContent = m;
      list.appendChild(li);
    });
    alertBox.appendChild(list);
  }

  alertBox.className = 'alert d-none';

  // Jendela WhatsApp dibuka lebih dulu (masih dalam aksi klik) supaya tidak diblokir browser,
  // URL-nya baru diisi setelah server memastikan data tersimpan.
  const waWindow = window.open('', '_blank');
  if (submitBtn) submitBtn.disabled = true;

  fetch(opts.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
    },
    body: JSON.stringify(opts.payload),
  })
    .then(async function (res) {
      if (res.status === 422) {
        const data = await res.json();
        showAlert('danger', Object.values(data.errors).flat());
        if (waWindow) waWindow.close();
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
      }
      if (res.status === 429) {
        showAlert('warning', ['Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.']);
        if (waWindow) waWindow.close();
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
      }
      if (!res.ok) {
        throw new Error('server');
      }

      const waUrl = 'https://wa.me/' + opts.waNumber + '?text=' + encodeURIComponent(opts.buildWaText(opts.payload));
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        window.location.href = waUrl;
      }

      showAlert('success', ['Data berhasil dikirim, terima kasih! Silakan lanjutkan pesan di WhatsApp yang terbuka.']);
      form.reset();
      if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    })
    .catch(function () {
      showAlert('danger', ['Terjadi kendala saat mengirim data. Silakan coba lagi.']);
      if (waWindow) waWindow.close();
      if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    })
    .finally(function () {
      if (submitBtn) submitBtn.disabled = false;
    });
};



document.addEventListener("DOMContentLoaded", function () {

  // Lottie Animation
  const container = document.getElementById('webdev-animation');
  if (container && typeof lottie !== 'undefined') {
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/img/webdev.json'
    });
  }

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);
  if (!isTouchDevice && typeof Lenis !== 'undefined') {
    window.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      window.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        window.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Back to Top Button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Pakai Lenis kalau ada, kalau gak ada balik ke native smooth scroll
      if (window.lenis) {
        window.lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  // Swiper Slider (Portfolio)
    let portfolioSwiper = null;
    if (typeof Swiper !== 'undefined' && document.querySelector('.portfolio-slider')) {
        portfolioSwiper = new Swiper('.portfolio-slider', {
            slidesPerView: 1.2,
            spaceBetween: 24,
            grabCursor: true,
            speed: 800,
            loop: false,
            observer: true,       // PENTING: Mendeteksi perubahan pada elemen anak/DOM
            observeParents: true, // PENTING: Mendeteksi perubahan pada parent container
            observerSlideChildren: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2.2,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 2.5,
                    spaceBetween: 40,
                }
            }
        });
    }

    // Swiper Slider (Trainer) — 1 kartu di HP, 2 di tablet, 3 di desktop, looping
    if (typeof Swiper !== 'undefined' && document.querySelector('.trainer-slider')) {
      new Swiper('.trainer-slider', {
        slidesPerView: 1,
        spaceBetween: 24,
        grabCursor: true,
        speed: 800,
        loop: true,
        pagination: {
          el: '.trainer-slider .swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next-trainer',
          prevEl: '.swiper-button-prev-trainer',
        },
        breakpoints: {
          576: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          992: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },
      });
    }

  // Filter Kategori Portfolio
  const filterBtns = document.querySelectorAll('.filter-btn:not([data-news-filter])');
  const slides = document.querySelectorAll('.portfolio-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        slides.forEach(slide => {
          const categoryAttr = slide.getAttribute('data-category');
          if (!categoryAttr) return;

          const categories = categoryAttr.split(' ');

          if (filterValue === 'all' || categories.includes(filterValue)) {
            slide.classList.remove('is-hidden');
          } else {
            slide.classList.add('is-hidden');
          }
        });

        // Update tampilan swiper & refresh scrolltrigger
        if (portfolioSwiper) {
          portfolioSwiper.updateProgress();
          portfolioSwiper.update();
          portfolioSwiper.slideTo(0);
        }

        if (typeof ScrollTrigger !== 'undefined') {
          setTimeout(() => ScrollTrigger.refresh(), 200);
        }
      });
    });
  }

  // Filter Kategori & Search Berita / Blog
  const newsFilterBtns = document.querySelectorAll('[data-news-filter]');
  const newsItems = document.querySelectorAll('.news-card-item');
  const newsSearchInput = document.getElementById('newsSearchInput');
  const noResultsMsg = document.getElementById('noResultsMessage');

  if (newsItems.length > 0) {
    let currentNewsFilter = 'all';

    // Logika gabungan filter kategori dan live search
    const applyNewsFilterAndSearch = () => {
      const query = newsSearchInput ? newsSearchInput.value.toLowerCase().trim() : '';
      let visibleCount = 0;

      newsItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const textContent = item.innerText.toLowerCase();

        const matchesCategory = (currentNewsFilter === 'all' || category === currentNewsFilter);
        const matchesSearch = textContent.includes(query);

        if (matchesCategory && matchesSearch) {
          item.classList.remove('d-none');
          visibleCount++;
        } else {
          item.classList.add('d-none');
        }
      });

      // Buka/tutup pesan kalau hasil pencarian kosong
      if (noResultsMsg) {
        if (visibleCount === 0) {
          noResultsMsg.classList.remove('d-none');
        } else {
          noResultsMsg.classList.add('d-none');
        }
      }

      // Sync ketinggian halaman ke GSAP ScrollTrigger biar nggak patah
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    };

    // Event click tombol filter berita
    newsFilterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        newsFilterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        currentNewsFilter = this.getAttribute('data-news-filter');
        applyNewsFilterAndSearch();
      });
    });

    // Event input live search berita
    if (newsSearchInput) {
      newsSearchInput.addEventListener('input', applyNewsFilterAndSearch);
    }
  }

  // Accordion Mobile (Level 1 & Level 2)
  const accButtons = document.querySelectorAll('.acc-btn');
  accButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const parent = this.closest('.mobile-accordion');
      if (!parent) return;

      const content = parent.querySelector('.acc-content');
      const isOpen = parent.classList.contains('is-open');

      // Tutup item accordion lain yang lagi kebuka
      document.querySelectorAll('.mobile-accordion').forEach(item => {
        item.classList.remove('is-open');
        const itemContent = item.querySelector('.acc-content');
        if (itemContent) itemContent.style.maxHeight = null;
      });

      if (!isOpen && content) {
        parent.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // Label menu level 1 yang punya panah (Jasa Website & SEO, Program, Karir, Profil):
  // diketuk = buka/tutup dropdown, bukan pindah halaman. Menu tanpa panah (Blog, Kontak) tetap link biasa.
  document.querySelectorAll('.mobile-accordion > .accordion-trigger .mobile-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const toggleBtn = this.closest('.accordion-trigger').querySelector('.acc-btn');
      if (toggleBtn) toggleBtn.click();
    });
  });

  const nestedButtons = document.querySelectorAll('.nested-btn');
  nestedButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const parent = this.closest('.nested-accordion');
      if (!parent) return;

      const content = parent.querySelector('.nested-content');
      const mainAccContent = this.closest('.acc-content');
      const isOpen = parent.classList.contains('is-open');

      if (isOpen) {
        parent.classList.remove('is-open');
        if (content) content.style.maxHeight = null;
      } else {
        parent.classList.add('is-open');
        if (content) {
          content.style.maxHeight = content.scrollHeight + "px";
          // Hitung ulang tinggi parent biar konten gak kepotong
          if (mainAccContent) {
            mainAccContent.style.maxHeight = (mainAccContent.scrollHeight + content.scrollHeight) + "px";
          }
        }
      }
    });
  });

  // Slider Testimonial & Progress Bar
  const track = document.getElementById("testimonialTrack");
  const prevBtn = document.getElementById("slidePrev");
  const nextBtn = document.getElementById("slideNext");
  const progressBar = document.getElementById("sliderProgress");

  if (track) {
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const item = track.querySelector(".testimonial-slide-item");
        const slideWidth = item ? item.offsetWidth + 24 : 320;
        track.scrollBy({ left: slideWidth, behavior: "smooth" });
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const item = track.querySelector(".testimonial-slide-item");
        const slideWidth = item ? item.offsetWidth + 24 : 320;
        track.scrollBy({ left: -slideWidth, behavior: "smooth" });
      });
    }

    if (progressBar) {
      track.addEventListener("scroll", () => {
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        if (maxScrollLeft > 0) {
          const scrollPercentage = (track.scrollLeft / maxScrollLeft) * 100;
          progressBar.style.width = Math.max(20, scrollPercentage) + "%";
        }
      });
    }
  }

  // Halaman Career
  // oper judul posisi ke modal
  const jobModal = document.getElementById('applyJobModal');
  if (jobModal) {
    jobModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      if (!button) return;

      const jobTitle = button.getAttribute('data-jobtitle');

      const selectedText = document.getElementById('selectedJobTitleText');
      const inputPosition = document.getElementById('jobPositionInput');

      if (selectedText) selectedText.textContent = jobTitle;
      if (inputPosition) inputPosition.value = jobTitle;
    });
  }

  // filter posisi loker / portofolio
    const filterButtons = document.querySelectorAll('#jobFilterContainer button');
    const jobItems = document.querySelectorAll('.job-item-wrapper'); // Pastikan ini mengarah ke .swiper-slide jika di slider portofolio

    if (filterButtons.length > 0 && jobItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Ubah class tombol aktif
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'btn-outline-warning');
                    btn.classList.add('btn-outline-secondary', 'text-light');
                });

                this.classList.add('active', 'btn-outline-warning');
                this.classList.remove('btn-outline-secondary', 'text-light');

                const filterValue = this.getAttribute('data-filter');

                // Sembunyikan / Tampilkan item
                jobItems.forEach(item => {
                    const category = item.getAttribute('data-category') || '';
                    
                    if (filterValue === 'all' || category.includes(filterValue)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });

                // ⚠️ TAMBAHKAN BAGIAN INI JIKA ELEMEN ADA DI DALAM SWIPER SLIDER:
                if (typeof portfolioSwiper !== 'undefined' && portfolioSwiper) {
                    portfolioSwiper.update();       // Perbarui perhitungan layout Swiper
                    portfolioSwiper.slideTo(0, 0);  // Kembalikan ke slide pertama agar tidak nyangkut
                }
            });
        });
    }

  // kirim lamaran kerja: validasi server -> simpan database -> email -> buka WhatsApp
  const careerForm = document.getElementById('careerApplyForm');
  if (careerForm) {
    careerForm.addEventListener('submit', function (event) {
      event.preventDefault();

      window.submitFormThenWhatsApp({
        form: careerForm,
        url: careerForm.dataset.action,
        waNumber: careerForm.dataset.wa,
        alertBox: document.getElementById('careerFormAlert'),
        payload: {
          position: document.getElementById('jobPositionInput').value.trim(),
          name: document.getElementById('applicantName').value.trim(),
          email: document.getElementById('applicantEmail').value.trim(),
          phone: document.getElementById('applicantPhone').value.trim(),
          portfolio_url: document.getElementById('applicantPortfolio').value.trim(),
          cover_letter: document.getElementById('applicantCoverLetter').value.trim(),
        },
        buildWaText: function (d) {
          return 'Halo Admin Rubicweb,\n\n'
            + 'Saya ingin melamar untuk posisi: *' + d.position + '*\n\n'
            + '*Data Pelamar:*\n'
            + '- Nama: ' + d.name + '\n'
            + '- Email: ' + d.email + '\n'
            + '- WhatsApp: ' + d.phone + '\n'
            + '- Portofolio/LinkedIn: ' + d.portfolio_url + '\n\n'
            + '*Pesan Singkat:*\n' + (d.cover_letter || '-');
        },
      });
    });
  }

  // Halaman Internship
  // 1. Filter Kategori Posisi Magang
  const internFilterBtns = document.querySelectorAll('#internFilterContainer .career-filter-btn, #internFilterContainer button');
  const internJobItems = document.querySelectorAll('#internCardsGrid .job-item-wrapper');

  if (internFilterBtns.length > 0 && internJobItems.length > 0) {
    internFilterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        internFilterBtns.forEach(b => {
          b.classList.remove('active', 'btn-outline-warning');
          if (b.tagName === 'BUTTON') {
            b.classList.add('btn-outline-secondary', 'text-light');
          }
        });

        this.classList.add('active');
        if (this.tagName === 'BUTTON') {
          this.classList.add('btn-outline-warning');
          this.classList.remove('btn-outline-secondary', 'text-light');
        }

        const filterValue = this.getAttribute('data-filter');

        internJobItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });

        if (typeof ScrollTrigger !== 'undefined') {
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      });
    });
  }

  // 2. Form Pendaftaran Magang ke WA
  const internForm = document.getElementById('internApplyForm');
  if (internForm) {
    internForm.addEventListener('submit', function (event) {
      event.preventDefault();

      window.submitFormThenWhatsApp({
        form: internForm,
        url: internForm.dataset.action,
        waNumber: internForm.dataset.wa,
        alertBox: document.getElementById('internFormAlert'),
        payload: {
          position: document.getElementById('jobPositionInput').value.trim(),
          name: document.getElementById('applicantName').value.trim(),
          email: document.getElementById('applicantEmail').value.trim(),
          phone: document.getElementById('applicantPhone').value.trim(),
          institution: document.getElementById('applicantInstitution').value.trim(),
          duration_plan: document.getElementById('applicantDuration').value.trim(),
          portfolio_url: document.getElementById('applicantPortfolio').value.trim(),
          motivation: document.getElementById('applicantCoverLetter').value.trim(),
        },
        buildWaText: function (d) {
          return 'Halo Admin Rubicweb,\n\n'
            + 'Saya ingin mengajukan pendaftaran magang dengan detail sebagai berikut:\n\n'
            + '*Posisi:* ' + d.position + '\n'
            + '*Nama Lengkap:* ' + d.name + '\n'
            + '*Email:* ' + d.email + '\n'
            + '*Nomor WA:* ' + d.phone + '\n'
            + '*Asal Sekolah/Kampus:* ' + d.institution + '\n'
            + '*Durasi & Rencana Mulai:* ' + d.duration_plan + '\n'
            + '*Link Portofolio/GitHub:* ' + d.portfolio_url + '\n'
            + '*Motivasi/Pesan:* ' + (d.motivation || '-') + '\n\n'
            + 'Mohon informasi mengenai proses pendaftaran selanjutnya. Terima kasih!';
        }
      });
    });
  }
    // 3. Form Konsultasi Paket Jasa: validasi server -> simpan database -> email -> buka WhatsApp
    const consultForm = document.getElementById('consultForm');
    if (consultForm) {
      consultForm.addEventListener('submit', function (event) {
        event.preventDefault();
  
        window.submitFormThenWhatsApp({
          form: consultForm,
          url: consultForm.dataset.action,
          waNumber: consultForm.dataset.wa,
          alertBox: document.getElementById('consultFormAlert'),
          payload: {
            name: document.getElementById('consultName').value.trim(),
            phone: document.getElementById('consultPhone').value.trim(),
            package: document.getElementById('consultPackage').value,
          },
          buildWaText: function (d) {
            return 'Halo Admin Rubicweb,\n\n'
              + 'Saya ingin konsultasi paket jasa website:\n\n'
              + '*Nama:* ' + d.name + '\n'
              + '*Nomor WA:* ' + d.phone + '\n'
              + '*Paket:* ' + d.package + '\n\n'
              + 'Mohon informasi selanjutnya. Terima kasih!';
          }
        });
      });
    }
  
    // 4. Form Pendaftaran Program: validasi server -> simpan database -> email -> buka WhatsApp
    const programForm = document.getElementById('programRegisterForm');
    if (programForm) {
      programForm.addEventListener('submit', function (event) {
        event.preventDefault();
  
        const programSelect = document.getElementById('programSelect');
        const programLabel = programSelect.selectedIndex > 0
          ? programSelect.options[programSelect.selectedIndex].text
          : '-';
  
        window.submitFormThenWhatsApp({
          form: programForm,
          url: programForm.dataset.action,
          waNumber: programForm.dataset.wa,
          alertBox: document.getElementById('programFormAlert'),
          payload: {
            name: document.getElementById('programName').value.trim(),
            email: document.getElementById('programEmail').value.trim(),
            program: programSelect.value,
          },
          buildWaText: function (d) {
            return 'Halo Admin Rubicweb,\n\n'
              + 'Saya ingin mendaftar program pelatihan:\n\n'
              + '*Nama:* ' + d.name + '\n'
              + '*Email:* ' + d.email + '\n'
              + '*Program:* ' + programLabel + '\n\n'
              + 'Mohon detail materi dan penawarannya. Terima kasih!';
          }
        });
      });
    }
});
