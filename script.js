/* ─── Vercel Web Analytics ───
   Wrapped in an async IIFE + try/catch so that even if this fails to load
   (blocked by an ad-blocker, offline, etc.) it can never break the rest
   of the page. */
(async () => {
    try {
        const { inject } = await import('@vercel/analytics');
        inject();
    } catch (err) {
        console.error('Vercel Analytics nem tudott elindulni:', err);
    }
})();

/* ─── Language switcher & mobile menu ───
   These run first and don't depend on Firebase, so a Firebase/network
   problem can never take them down with it. */

const langBtn = document.getElementById('lang-btn');
const langTexts = document.querySelectorAll('.lang-text');
const langPlaceholders = document.querySelectorAll('.lang-placeholder');

let currentLang = localStorage.getItem('portfolioLang') || 'en';

function applyLanguage() {
    langBtn.innerHTML = currentLang === 'en'
        ? '<i class="fa-solid fa-globe" aria-hidden="true"></i> EN'
        : '<i class="fa-solid fa-globe" aria-hidden="true"></i> HU';

    langTexts.forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    langPlaceholders.forEach(el => {
        el.setAttribute('placeholder', el.getAttribute(`data-${currentLang}`));
    });

    document.documentElement.lang = currentLang;
}

applyLanguage();

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hu' : 'en';
    localStorage.setItem('portfolioLang', currentLang);
    applyLanguage();
});

/* ─── Mobile menu toggle ─── */
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu after a nav link is clicked (mobile UX)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ─── Contact form (Firebase + email API) ───
   Wrapped so that any failure here (bad config, blocked request,
   offline, etc.) can never break the language switcher or menu above. */

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const contactForm = document.querySelector('form');
const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

async function setupContactForm() {
    if (!contactForm || !submitBtn) return;

    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
    const { getFirestore, collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");

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

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs = e.target.querySelectorAll('input, textarea');
        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const message = inputs[2].value.trim();

        if (!name || !email || !message) {
            alert(currentLang === 'hu' ? 'Kérlek tölts ki minden mezőt.' : 'Please fill in every field.');
            return;
        }

        if (!isValidEmail(email)) {
            alert(currentLang === 'hu' ? 'Kérlek adj meg egy érvényes e-mail címet.' : 'Please enter a valid email address.');
            return;
        }

        // Prevent double submits while the request is in flight
        submitBtn.disabled = true;
        const originalLabel = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'hu' ? 'Küldés...' : 'Sending...';

        let savedToDb = false;

        try {
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

            alert(currentLang === 'hu' ? 'Ajánlatkérés sikeresen elküldve! Hamarosan kereslek.' : 'Inquiry sent successfully! I will contact you soon.');
            e.target.reset();
        } catch (error) {
            console.error(error);
            if (savedToDb) {
                // The message was captured even if the confirmation email failed —
                // don't tell the user the whole thing failed.
                alert(currentLang === 'hu'
                    ? 'Az üzeneted megérkezett, de a visszaigazoló e-mail küldése nem sikerült. Hamarosan mindenképp jelentkezem.'
                    : 'Your message was received, but the confirmation email could not be sent. I will still get back to you soon.');
                e.target.reset();
            } else {
                alert(currentLang === 'hu' ? 'Hiba történt a küldés során. Kérlek próbáld újra.' : 'Error sending message. Please try again.');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    });
}

setupContactForm().catch(error => {
    // If Firebase fails to load/init (network/ad-blocker/bad config),
    // the rest of the page (language switcher, menu, content) still works.
    console.error('A kapcsolati űrlap háttérszolgáltatása nem tudott elindulni:', error);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.title = currentLang === 'hu'
            ? 'Az űrlap jelenleg nem elérhető. Kérlek írj e-mailt közvetlenül.'
            : 'The form is currently unavailable. Please email directly instead.';
    }
});
