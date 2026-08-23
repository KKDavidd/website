(async () => {
    try {
        const { inject } = await import('@vercel/analytics');
        inject();
    } catch (err) {
        console.error('Vercel Analytics nem tudott elindulni:', err);
    }
})();

(() => {
    const setFavicon = (isDark) => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = isDark ? '/img/favi_dark.png' : '/img/favi_light.png';
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setFavicon(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => setFavicon(e.matches));
})();

const langBtnLabel = document.getElementById('lang-btn-label');
const langBtn = document.getElementById('lang-btn');
const langTexts = document.querySelectorAll('.lang-text');

let currentLang = localStorage.getItem('portfolioLang') || 'hu';

function applyLanguage() {
    langBtnLabel.textContent = currentLang === 'en' ? 'EN' : 'HU';

    langTexts.forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    document.documentElement.lang = currentLang;
}

applyLanguage();

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hu' : 'en';
    localStorage.setItem('portfolioLang', currentLang);
    applyLanguage();
});

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const contactForm = document.querySelector('form');
const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
const formStatus = document.getElementById('form-status');

function setStatus(message) {
    if (formStatus) {
        formStatus.textContent = message;
    }
}

// Firebase is ~100 KiB. Instead of pulling it in on every page load, it's
// fetched only the moment someone actually submits the contact form, and
// only once (the promise is cached so a second submit reuses the same app).
let firebasePromise = null;

function loadFirebase() {
    if (!firebasePromise) {
        firebasePromise = (async () => {
            const { initializeApp } = await import('firebase/app');
            const { getFirestore, collection, addDoc } = await import('firebase/firestore');

            const firebaseConfig = {
                apiKey: "AIzaSyAafCFyainmMmbaVt4Vl_EHnjgRpFJgfU0",
                authDomain: "crazyportfoliom.firebaseapp.com",
                projectId: "crazyportfoliom",
                storageBucket: "crazyportfoliom.firebasestorage.app",
                messagingSenderId: "679897293455",
                appId: "1:679897293455:web:6b445c414e297bd45006fa"
            };

            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            return { db, collection, addDoc };
        })();
    }
    return firebasePromise;
}

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !message) {
            setStatus(currentLang === 'hu' ? 'Kérlek tölts ki minden mezőt.' : 'Please fill in every field.');
            return;
        }

        if (!isValidEmail(email)) {
            setStatus(currentLang === 'hu' ? 'Kérlek adj meg egy érvényes e-mail címet.' : 'Please enter a valid email address.');
            return;
        }

        submitBtn.disabled = true;
        setStatus(currentLang === 'hu' ? 'Küldés...' : 'Sending...');

        let savedToDb = false;

        try {
            const { db, collection, addDoc } = await loadFirebase();

            await addDoc(collection(db, "messages"), {
                name,
                email,
                message,
                timestamp: new Date()
            });
            savedToDb = true;

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message, lang: currentLang }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Hiba részletei:", errorData);
                throw new Error('A backend nem tudta elküldeni az e-mailt.');
            }

            setStatus(currentLang === 'hu' ? 'Ajánlatkérés sikeresen elküldve! Hamarosan kereslek.' : 'Inquiry sent successfully! I will contact you soon.');
            e.target.reset();
        } catch (error) {
            console.error(error);
            if (savedToDb) {
                setStatus(currentLang === 'hu'
                    ? 'Az üzeneted megérkezett, de a visszaigazoló e-mail küldése nem sikerült. Hamarosan mindenképp jelentkezem.'
                    : 'Your message was received, but the confirmation email could not be sent. I will still get back to you soon.');
                e.target.reset();
            } else {
                setStatus(currentLang === 'hu' ? 'Hiba történt a küldés során. Kérlek próbáld újra.' : 'Error sending message. Please try again.');
            }
        } finally {
            submitBtn.disabled = false;
        }
    });
}
