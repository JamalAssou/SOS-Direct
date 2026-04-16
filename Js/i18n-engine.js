document.addEventListener('DOMContentLoaded', () => {
    const langOptions = document.querySelectorAll('.lang-option');

    const updateContent = (lang) => {
        // 1. Mettre à jour les textes simples et HTML
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // 2. Mettre à jour les placeholders (formulaires)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // 3. Mettre à jour l'attribut lang du site
        document.documentElement.lang = lang;

        // 4. Mettre à jour l'état visuel des boutons
        langOptions.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
                btn.style.fontWeight = '700';
                btn.style.opacity = '1';
            } else {
                btn.classList.remove('active');
                btn.style.fontWeight = '400';
                btn.style.opacity = '0.7';
            }
        });
    };

    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.dataset.lang;
            localStorage.setItem('sosDirectLang', selectedLang);
            updateContent(selectedLang);
        });
    });

    // Charger la langue sauvegardée ou français par défaut
    const savedLang = localStorage.getItem('sosDirectLang') || 'fr';
    updateContent(savedLang);
});