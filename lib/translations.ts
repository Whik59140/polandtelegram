import {
  ParentCategoryKey,
  SubcategoryKey
} from "./slug-definitions";

// Diagnostic log to confirm usage
// console.log("Canonical Parent Slugs:", parentCategorySlugs);
// console.log("Canonical Subcategory Slugs:", subcategorySlugs);

const COUNTRY_NAME = process.env.NEXT_PUBLIC_COUNTRY_NAME || "USA";
const COUNTRY_FLAG = process.env.NEXT_PUBLIC_COUNTRY_FLAG || "🇺🇸";
// console.log("Translations - COUNTRY_NAME:", COUNTRY_NAME);
// console.log("Translations - COUNTRY_FLAG:", COUNTRY_FLAG);

// --- ENGLISH SLUG MAPPINGS ---
// These map the global/English keys from slug-definitions.ts to English slugs for URLs.
// For English, the key and the slug are usually the same.
const englishParentCategorySlugsMap: Record<ParentCategoryKey, string> = {
  groups: 'grupy',
  channels: 'kanaly', // For URL safety, 'kanały' becomes 'kanaly'
  videos: 'wideo',
  chat: 'czat',
};

const englishSubcategorySlugsMap: Record<SubcategoryKey, string> = {
  pornhub: 'pornhub', // Brand name, typically unchanged
  porn: 'porno',
  sex: 'seks',
  nude: 'nagie',
  NSFW: 'nsfw', // Acronym, typically unchanged
  hot: 'gorace', // 'gorące' -> 'gorace'
  amateur: 'amatorskie',
  masturbation: 'masturbacja',
  bitches: 'suki', // Consider if this term is appropriate for your site in Polish
  big_dick: 'duzy-penis', // 'duży-penis' -> 'duzy-penis'
  big_tits: 'duze-cycki', // 'duże-cycki' -> 'duze-cycki'
  big_ass: 'duzy-tylek', // 'duży-tyłek' -> 'duzy-tylek'
  curvy: 'puszyste',
  gay: 'gej',
  trans: 'trans',
  shemale: 'shemale', // Often kept for international recognition, or use a specific Polish term if preferred
  twink: 'twink',     // Often kept for international recognition
  ladyboy: 'ladyboy', // Often kept for international recognition
  BDSM: 'bdsm',
  hentai: 'hentai',
  gangbang: 'gangbang',
  kink: 'perwersje', // Alternative: 'fetysze'
  femdom: 'femdom',
  anal: 'analne',
  voyeur: 'podgladanie', // 'podglądanie' -> 'podgladanie'
  swinger: 'swingersi', // Alternative: 'wymiana-partnerow'
  blowjob: 'lod', // More descriptive: 'seks-oralny' or 'oralne'
  threesome: 'trojkat', // 'trójkąt' -> 'trojkat'
  public: 'publiczne',
  webcam: 'kamerki',
  hardcore: 'hardcore',
  bukkake: 'bukkake',
  feet: 'stopy',
  extreme: 'ekstremalne',
  dark_porn: 'mroczne-porno',
  MILF: 'milf', // Widely recognized acronym
  cougar: 'kuguary', // Alternative: 'dojrzale-kobiety'
  mature: 'dojrzale',
  teen: 'nastolatki',
  students: 'studentki',
  stepmom: 'macocha',
  OnlyFans: 'onlyfans', // Brand name
  escorts: 'eskorty',
  Latina: 'latynoski',
  Asian: 'azjatki',
  Arab: 'arabki',
  Indian: 'hinduski',
  cuckold: 'rogacz',
  squirting: 'wytrysk-kobiecy', // Or 'squirting' if commonly understood
  cosplay: 'cosplay',
};
// --- END ENGLISH SLUG MAPPINGS ---
export const siteStrings = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska",
  siteDescription: `Twój portal #1 do wyszukiwania grup, kanałów, filmów i czatów Telegram w ${COUNTRY_NAME}.`,
  logoText: process.env.NEXT_PUBLIC_TARGET_SITE_URL || "polska-telegram.pl",
  htmlLang: process.env.NEXT_PUBLIC_CONTENT_LANGUAGE || "pl-PL",
  countryFlag: COUNTRY_FLAG,
  defaultPageTitleSuffix: "Grupy, Kanały, Wideo & Czaty",
  breadcrumbs: {
    home: "Strona Główna"
  },
  home: {
    metaTitle: `${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}: Grupy, Kanały, Wideo & Czaty`,
    metaDescription: `Znajdź i odkrywaj najlepsze grupy, kanały, filmy i czaty Telegram w ${COUNTRY_NAME}. Zaktualizowane treści dla dorosłych.`,
    title: `Witamy w ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
    intro: `Twoje główne źródło do odkrywania grup, kanałów, filmów i czatów Telegram w ${COUNTRY_NAME}.`,
    groupsButton: "Odkryj Grupy",
    channelsButton: "Odkryj Kanały",
    videosButton: "Odkryj Wideo",
    chatButton: "Odkryj Czat",
    viewAll: "Zobacz Wszystkie",
    seoIntroTitle: `Twój Ekskluzywny Portal z Treściami dla Dorosłych Telegram w ${COUNTRY_NAME}`,
    seoIntroContent: `${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} to Twoje ostateczne i najbardziej aktualne miejsce do odkrywania i uzyskiwania dostępu do szerokiej gamy treści dla dorosłych na Telegramie, starannie wybranych dla polskiej publiczności. ${COUNTRY_FLAG}🔞 Niezależnie od tego, czy szukasz [grup Telegram](/groups), [ekskluzywnych kanałów porno](/channels), [filmów XXX](/videos) (zarówno [amatorskich](/videos/amateur), jak i profesjonalnych), czy [erotycznych czatów](/chat) do nawiązywania nowych znajomości, nasza platforma poprowadzi Cię przez krajobraz NSFW Telegrama. Po prostu przeglądaj kategorie tematyczne, znajduj bezpośrednie linki do [społeczności fetyszystów](/groups/kink), [gorących randek](/chat/hot) i niszowych treści, takich jak [BDSM](/groups/bdsm), [Trans](/channels/trans), [Gej](/chat/gay), [MILF](/videos/milf) i wiele więcej. Naszą misją jest zapewnienie bezpiecznego i przyjaznego dla użytkownika agregatora, stale aktualizowanego, aby dostarczać Ci najnowsze wiadomości i najbardziej niezawodne linki do treści dla dorosłych Telegram w ${COUNTRY_NAME}. Odkrywaj, znajduj i łącz się dyskretnie.`,
    faqTitle: "Często Zadawane Pytania (FAQ)",
    affiliateOffersTitle: "🔥 Ekskluzywne Oferty od Naszych Partnerów 🔥",
    supplementOffersTitle: "💊 Suplementy Diety i Produkty Uzupełniające",
    homePageDescriptionReadMore: "Czytaj Więcej",
    homePageDescriptionReadLess: "Czytaj Mniej",
    thematicButtons: {
      liveWebcams: `${COUNTRY_FLAG} Kamery na Żywo ${COUNTRY_NAME} 📹`,
      sexMeetings: `${COUNTRY_FLAG} Spotkania Seksualne ${COUNTRY_NAME} 😈`,
      gayMeetings: `${COUNTRY_FLAG} Spotkania Gejowskie ${COUNTRY_NAME} 👨‍❤️‍👨`,
      transMeetings: `${COUNTRY_FLAG} Spotkania Trans ${COUNTRY_NAME} ⚧️`,
      seriousDates: `${COUNTRY_FLAG} Poważne Randki ${COUNTRY_NAME} ❤️`
    },
    recommendedArticlesTitle: "Polecane Artykuły Blogowe"
  },
  navigation: {
    groups: "Grupy",
    channels: "Kanały",
    videos: "Wideo",
    chat: "Czat",
    liveWebcam: "Kamery na Żywo 🔞",
    home: "Strona Główna",
    blog: "Blog"
  },
  categories: {
    groups: {
      metaTitle: `Grupy | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
      metaDescription: `Wyszukuj i filtruj grupy Telegram dla dorosłych według różnych podkategorii w ${COUNTRY_NAME}.`,
      title: "Grupy Telegram",
      description: `Odkrywaj i dołączaj do najlepszych grup Telegram dla dorosłych w ${COUNTRY_NAME}. Dziel się, dyskutuj i wchodź w interakcje z tysiącami użytkowników.`,
    },
    channels: {
      metaTitle: `Kanały | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
      metaDescription: `Odkrywaj i filtruj kanały Telegram dla dorosłych w ${COUNTRY_NAME}.`,
      title: "Kanały Telegram",
      description: `Odkryj najczęściej obserwowane kanały Telegram w ${COUNTRY_NAME}. Ekskluzywne treści, filmy, zdjęcia i codzienne aktualizacje.`,
    },
    videos: {
      metaTitle: `Wideo | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
      metaDescription: `Oglądaj i filtruj filmy dla dorosłych z Telegrama w ${COUNTRY_NAME}.`,
      title: "Wideo Telegram",
      description: `Oglądaj i pobieraj tysiące filmów dla dorosłych z Telegrama bezpośrednio w ${COUNTRY_NAME}. Streaming HD, kategorie i codzienne aktualizacje.`,
    },
    chat: {
      metaTitle: `Czat | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
      metaDescription: `Uczestnicz w pokojach czatowych i dyskusjach dla dorosłych w ${COUNTRY_NAME}.`,
      title: "Czat Telegram",
      description: `Dołącz do najlepszych pokoi czatowych dla dorosłych w ${COUNTRY_NAME}. Poznawaj nowych ludzi, flirtuj i ciesz się anonimowym i bezpiecznym środowiskiem.`,
    },
  },
  blog: {
    metaTitle: `Blog | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}: Porady, Przewodniki i Aktualizacje`,
    metaDescription: `Przeglądaj naszego bloga, aby znaleźć najnowsze porady, szczegółowe przewodniki i aktualizacje dotyczące Telegrama w ${COUNTRY_NAME}. Zmaksymalizuj swoje doświadczenie.`,
    pageTitle: "Nasz Blog Telegram",
    noArticles: "Obecnie brak artykułów. Wróć wkrótce!",
    readMore: "Czytaj Więcej",
    publishedOn: "Opublikowano",
    defaultAuthorName: `Zespół ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
    authors: {
      "equipo-editorial": {
        name: "Zespół Redakcyjny",
        bio: `Zespół Redakcyjny ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} dokłada wszelkich starań, aby dostarczać najnowsze wiadomości, przewodniki i wskazówki, jak najlepiej wykorzystać Telegram.`
      },
      "especialista-telegram": {
        name: "Specjalista Telegram",
        bio: "Dzięki wieloletniemu doświadczeniu na platformie, nasz Specjalista Telegram dzieli się swoją wiedzą i sztuczkami, aby zoptymalizować korzystanie z Telegrama."
      }
    },
    authorImageAlt: "Zdjęcie profilowe {authorName}",
    featuredImageAlt: "Wyróżniony obraz dla artykułu: {postTitle}",
    defaultImageAlt: "Obraz artykułu na blogu: {postTitle}",
    postNotFoundTitle: "Nie Znaleziono Artykułu",
    postNotFoundDescription: "Artykuł, którego szukasz, nie istnieje lub został przeniesiony.",
    relatedArticles: "Powiązane Artykuły",
    faqTitle: "Często Zadawane Pytania",
    shareArticle: "Udostępnij ten artykuł:",
    affiliateComponents: {
      specialSupplementsTitle: "Specjalne Suplementy Wspomagające Wydajność",
      exclusiveCasinoOffersTitle: "Ekskluzywne Oferty Kasyn Online",
      joinTelegramGroupsTitle: "Dołącz do Naszych Grup Telegram",
      joinTelegramButtonText: "Dostęp do Grup VIP",
      exploreOtherOffersTitle: "Odkryj Inne Interesujące Oferty"
    },
    thematicButtons: {
        liveWebcams: "Kamery na Żywo",
        sexMeetings: "Spotkania Seksualne",
        gayMeetings: "Spotkania Gejowskie",
        transMeetings: "Spotkania Trans",
        seriousDates: "Poważne Randki"
    },
    featuredOffersTitle: "Wyróżnione Oferty",
    recommendedOfferTitle: "Nasza Rekomendacja",
    backToBlog: "Powrót do Bloga"
  },
  subcategoriesSectionTitle: "Odkrywaj według Podkategorii",
  subcategories: {
    pornhub: "Pornhub",
    porn: "Porno",
    sex: "Seks",
    nude: "Nagie",
    NSFW: "NSFW",
    hot: "Gorące",
    amateur: "Amatorskie",
    masturbation: "Masturbacja",
    bitches: "Suki",
    big_dick: "Duży Penis",
    big_tits: "Duże Cycki",
    big_ass: "Duży Tyłek",
    curvy: "Puszyste",
    gay: "Gej",
    trans: "Trans",
    shemale: "Shemale", // Polish equivalent could be specific or kept as is for recognition
    twink: "Twink",   // Polish equivalent could be specific or kept as is for recognition
    ladyboy: "Ladyboy", // Polish equivalent could be specific or kept as is for recognition
    BDSM: "BDSM",
    hentai: "Hentai",
    gangbang: "Gangbang",
    kink: "Perwersyjne", // "Fetysz" is also a good option
    femdom: "Femdom",
    anal: "Analne",
    voyeur: "Podglądanie",
    swinger: "Swinger",
    blowjob: "Lód", // "Seks oralny" or more colloquial terms also exist
    threesome: "Trójkąt",
    public: "Publiczne",
    webcam: "Kamerki",
    hardcore: "Hardcore",
    bukkake: "Bukkake",
    feet: "Stopy",
    extreme: "Ekstremalne",
    dark_porn: "Mroczne Porno",
    MILF: "MILF",
    cougar: "Kuguar", // "Dojrzałe" is also a good option
    mature: "Dojrzałe",
    teen: "Nastolatki",
    students: "Studentki",
    stepmom: "Macocha",
    OnlyFans: "OnlyFans",
    escorts: "Eskorty",
    Latina: "Latynoski",
    Asian: "Azjatki",
    Arab: "Arabki",
    Indian: "Hinduski",
    cuckold: "Rogacz",
    squirting: "Squirting", // "Wytrysk kobiecy" is the descriptive term
    cosplay: "Cosplay",
  },
  slugs: {
    parentCategories: englishParentCategorySlugsMap,
    subcategories: englishSubcategorySlugsMap,
  },
  placeholders: {
    cardTitle: "Zastępczy Tytuł Treści",
    cardDescription: "To jest opis zastępczej treści. Więcej szczegółów będzie dostępnych wkrótce.",
    pageTitle: "Zastępczy Tytuł Strony",
    pageDescription: "Zawartość tej strony będzie dostępna wkrótce.",
  },
  faq: [
    {
      question: `Jak działa ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} i co oferuje?`,
      answer: `${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} jest agregatorem linków do treści ([grupy](/groups), [kanały](/channels), [wideo](/videos), [czat](/chat)) dostępnych na Telegramie i skierowanych do polskiej publiczności. Nie hostujemy treści bezpośrednio, ale oferujemy zorganizowany i łatwy w nawigacji portal do ich odnajdywania poprzez bezpośrednie linki do Telegrama i uzyskiwania do nich dostępu.`
    },
    {
      question: "Jak mogę dołączyć do grupy lub kanału Telegram z waszej strony?",
      answer: "To proste! Przeszukaj nasze kategorie lub wyszukaj konkretne treści. Gdy znajdziesz interesującą Cię [grupę](/groups) lub [kanał](/channels), kliknij link \\\"Odkryj\\\" lub nazwę. Zostaniesz przekierowany bezpośrednio na stronę lub profil Telegram, gdzie możesz natychmiast dołączyć. Upewnij się, że masz zainstalowaną i zaktualizowaną aplikację Telegram na swoim urządzeniu."
    },
    {
      question: `Czy treści dodawane przez ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} są darmowe?`,
      answer: `Większość dodawanych przez nas linków prowadzi do darmowych treści i społeczności na Telegramie. Niektóre [kanały](/channels/onlyfans) lub indywidualni użytkownicy w tych [grupach](/groups/hot) mogą oferować treści premium, subskrypcje lub płatne usługi. ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} nie ponosi odpowiedzialności ani nie zarządza tymi płatnymi treściami.`
    },
    {
      question: `Czy korzystanie z ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} jest bezpieczne i anonimowe?`,
      answer: `Nawigacja po ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} jest bezpieczna; nie prosimy o dane osobowe w celu uzyskania dostępu do naszej strony. Jeśli klikniesz link, zostaniesz przekierowany na oficjalną platformę Telegram. Twoje działania i prywatność na Telegramie podlegają jego wytycznym. Zawsze zalecamy ostrożność i nieudostępnianie danych osobowych nieznajomym, zwłaszcza na [czacie erotycznym](/chat/sex).`
    },
    {
      question: `Jak mogę znaleźć konkretne treści na ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}, na przykład \\\"filmy amatorskie\\\" lub \\\"czaty gejowskie\\\"?`,
      answer: "Skorzystaj z naszych głównych kategorii ([grupy](/groups), [kanały](/channels), [wideo](/videos), [czat](/chat)), a następnie eksploruj wymienione podkategorie tematyczne (na przykład [Amatorskie](/videos/amateur), [Gej](/chat/gay), [MILF](/groups/milf) itp.). Pracujemy nad wdrożeniem zaawansowanej funkcji wyszukiwania słów kluczowych."
    },
    {
      question: `Ile czasu zajmuje aktualizacja linków i treści na ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}?`,
      answer: "Nasz zespół ciężko pracuje, aby regularnie aktualizować listy i dostarczać świeże oraz nowe treści. Ze względu na dynamiczny charakter Telegrama, niektóre linki mogą zostać dezaktywowane lub [grupy](/groups) / [kanały](/channels) mogą ulec zmianie. Chętnie przyjmujemy komentarze użytkowników w celu utrzymania jakości usługi!"
    },
    {
      question: `Czy mogę uzyskać dostęp do ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} z telefonu, tabletu i komputera?`,
      answer: `Tak, ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} został zaprojektowany tak, aby był w pełni responsywny i dostępny z dowolnego urządzenia z przeglądarką internetową i połączeniem internetowym. Doświadczenie użytkownika jest zoptymalizowane pod kątem telefonów, tabletów i komputerów stacjonarnych.`
    },
    {
      question: `Co zrobić, jeśli znajdę uszkodzony link lub nieodpowiednią treść (poza umową NSFW) na ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}?`,
      answer: "Jeśli znajdziesz uszkodzony link, możesz go zignorować i poszukać alternatyw. W przypadku treści wyraźnie naruszających warunki Telegrama (na przykład materiały nielegalne, niezgodne z umową), prosimy o zgłoszenie ich bezpośrednio na platformie Telegram. Posiadamy system komentarzy do linków na naszej stronie. Naszym priorytetem są treści takie jak [filmy porno](/videos/porn) i [umówione grupy erotyczne](/groups/sex)."
    }
  ],
  aboutPage: {
    metaTitle: `O Nas | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
    metaDescription: `Dowiedz się więcej o ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}, Twoim przewodniku po treściach dla dorosłych na Telegramie w ${COUNTRY_NAME}. Nasza misja i zaangażowanie.`,
    title: "O Nas",
    paragraphs: [
      `Witamy w ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}! Jesteśmy zespołem pasjonatów zajmujących się odkrywaniem i indeksowaniem ogromnej różnorodności treści dla dorosłych na platformie Telegram, ze szczególnym uwzględnieniem polskiej publiczności.`,
      "Naszą misją jest zapewnienie bezpiecznego i przyjaznego dla użytkownika agregatora, dzięki któremu możesz łatwo znaleźć grupy, kanały, filmy i czaty odpowiadające Twoim zainteresowaniom. Wierzymy w wolny dostęp do informacji i rozrywki dla dorosłych, z poszanowaniem prawa i prywatności użytkowników.",
      `Nieustannie poszukujemy nowych zasobów na Telegramie, weryfikujemy linki i intuicyjnie kategoryzujemy treści. Naszym celem jest stać się Twoim niezawodnym punktem odniesienia do eksplorowania treści NSFW w ${COUNTRY_NAME} na Telegramie.`,
      `${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} nie hostuje treści bezpośrednio. Dostarczamy jedynie linki do publicznie dostępnych treści na Telegramie i działamy jako wyspecjalizowana wyszukiwarka. Odpowiedzialność za linkowane treści spoczywa na twórcach i operatorach grup Telegram.`,
      `Dziękujemy za wybór ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}. Mamy nadzieję, że korzystanie z naszej platformy będzie przyjemne i satysfakcjonujące!`
    ]
  },
  privacyPage: {
    metaTitle: `Polityka Prywatności | ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}`,
    metaDescription: `Przeczytaj naszą politykę prywatności, aby zrozumieć, jak zarządzamy i chronimy Twoją prywatność podczas przeglądania naszej strony ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}.`,
    title: "Polityka Prywatności",
    lastUpdated: "Ostatnia aktualizacja: Lipiec 2024",
    sections: [
      {
        heading: "1. Wprowadzenie",
        content: `Twoja prywatność jest ważna dla ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"} ("nas", "my", "nasz"), dlatego niniejsza polityka prywatności wyjaśnia, w jaki sposób gromadzimy, wykorzystujemy, ujawniamy i chronimy Twoje informacje podczas odwiedzania naszej strony ${process.env.NEXT_PUBLIC_TARGET_SITE_URL || "polska-telegram.pl"} ("strona"). Prosimy o uważne przeczytanie tego oświadczenia. Jeśli nie zgadzasz się z warunkami niniejszej polityki prywatności, prosimy nie korzystać ze strony.`
      },
      {
        heading: "2. Gromadzenie Informacji",
        content: "Nie gromadzimy danych osobowych (takich jak imię i nazwisko, adres e-mail, numer telefonu), chyba że podasz je dobrowolnie (na przykład za pośrednictwem formularza kontaktowego, jeśli zostanie zaimplementowany). Automatycznie gromadzimy anonimowe informacje o korzystaniu ze strony, takie jak adresy IP, typ przeglądarki, odwiedzane strony i czas dostępu, za pomocą plików cookie i podobnych technologii w celu ulepszenia naszych usług i analizy ruchu na stronie."
      },
      {
        heading: "3. Wykorzystanie Informacji",
        content: "Anonimowo zebrane informacje są wykorzystywane do analizy trendów, zarządzania stroną, śledzenia ruchów użytkowników na stronie i gromadzenia informacji demograficznych. Pomaga nam to ulepszać projekt strony i doświadczenia użytkownika. Wszelkie dobrowolnie podane dane osobowe są wykorzystywane wyłącznie w celu, w jakim zostały podane."
      },
      {
        heading: "4. Linki do Stron Trzecich",
        content: "Nasza strona zawiera linki do grup, kanałów i innych treści na platformie Telegram. Nie ponosimy odpowiedzialności za praktyki dotyczące prywatności ani treści tych platform stron trzecich. Jeśli opuścisz naszą stronę za pośrednictwem linku, aby uzyskać dostęp do Telegrama, Twoja aktywność podlega polityce prywatności Telegrama. Zalecamy przeczytanie polityki prywatności każdej odwiedzanej strony trzeciej."
      },
      {
        heading: "5. Bezpieczeństwo Informacji",
        content: "Podejmujemy odpowiednie środki w celu ochrony zebranych informacji przed nieautoryzowanym dostępem, wykorzystaniem lub ujawnieniem. Jednak żadna transmisja przez Internet ani metoda przechowywania elektronicznego nie jest w 100% bezpieczna. Dlatego nie możemy zagwarantować jej absolutnego bezpieczeństwa."
      },
      {
        heading: "6. Pliki Cookie",
        content: "Używamy plików cookie, aby poprawić Twoje doświadczenie nawigacyjne, analizować ruch na stronie i personalizować treści. Możesz kontrolować i/lub usuwać pliki cookie według własnego uznania - więcej informacji znajdziesz na stronie aboutcookies.org. Możesz usunąć wszystkie pliki cookie znajdujące się już na Twoim komputerze i skonfigurować większość przeglądarek tak, aby uniemożliwić ich umieszczanie."
      },
      {
        heading: "7. Zmiany w Niniejszej Polityce Prywatności",
        content: "Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej polityce prywatności w dowolnym momencie i z dowolnego powodu. O wszelkich zmianach poinformujemy Cię, aktualizując datę \\\"Ostatniej aktualizacji\\\" niniejszej polityki prywatności. Zalecamy regularne przeglądanie niniejszej polityki prywatności w celu uzyskania aktualizacji."
      },
      {
        heading: "8. Kontakt",
        content: "Jeśli masz pytania lub uwagi dotyczące niniejszej polityki prywatności, skontaktuj się z nami (jeśli w przyszłości zostanie podana metoda kontaktu)."
      }
    ]
  },
  cta: {
    meetPrefix: "Odkryj",
    locationSuffix: `w ${COUNTRY_NAME}`,
    actionButtonText: "Dołącz Teraz 🔞",
    secondaryActionButtonText: "Odwiedź Stronę",
    freeTag: "GRATIS",
    quickSignupTag: "Szybki Dostęp",
    imageAltText: "Oferta od {partnerName}",
    floatingSexChatButton: "Czat Erotyczny na Żywo 🔥",
    membersOnlineSuffix: "Online",
    priceNowPrefix: "Teraz",
    discountSuffix: "% ZNIŻKI",
    originalPricePrefix: "Przed",
    bestSellerBadgeText: "⭐ Bestseller",
    bestOfferBadgeText: "🔥 Najlepsza Oferta",
    joinTelegramButton: "Dołącz do {subcategoryName} {categoryName} na Telegramie",
    joinSpecificTelegramGroupButton: "Dołącz do Grupy Telegram: Kanały - Dojrzałe", // Example, can be made more generic if needed
    offerAriaLabelPrefix: "Oferta",
    offerPrefix: "Oferta",
    clickHereButton: "Kliknij Tutaj",
    getBonusButton: "ODBIERZ BONUS",
    joinTelegramSection: {
      defaultButtonText: "Dołącz do Ekskluzywnej Grupy Telegram",
      mobileButtonText: "Dołącz",
      categorySubcategoryButtonText: "Dołącz do Grupy Telegram: {category} - {subcategory}",
      mobileCategorySubcategoryButtonText: "Dołącz {category} - {subcategory}",
      modalTitle: "✨ Dołącz do Naszej Grupy VIP! ✨",
      modalDescription1: "Ukończ <strong class=\\\"text-sky-300\\\">2 Proste Kroki</strong>, aby uzyskać dostęp do <strong class=\\\"text-pink-400\\\">EKSKLUZYWNEJ</strong> Grupy Telegram.",
      modalDescription2: "(Zajmuje tylko 30 sekund!)",
      step1Title: "KROK 1: Zarejestruj się na co najmniej 2 stronach partnerskich",
      step2Title: "KROK 2: Potwierdź swoją rejestrację",
      confirmationCheckboxLabel: "Potwierdzam, że zarejestrowałem/am się na <strong class=\\\"text-pink-400\\\">co najmniej 2</strong> stronach partnerskich.",
      goToTelegramButton: "PRZEJDŹ DO GRUPY TELEGRAM!",
      completeStepsButton: "Ukończ Powyższe Kroki",
      closeButton: "Zamknij",
      modalFooterDisclaimer: "To jest ekskluzywna grupa. Dostęp tylko po wykonaniu instrukcji.",
      partnerLabels: {
        gay: "Gej",
        milf: "MILF",
        trans: "Trans",
        toFuck: "Luźne Spotkania",
        seriousRelationships: "Poważne Związki",
        webcam: "Kamerki",
        grannies: "Babcie",
        women: "Kobiety",
        girls: "Dziewczyny",
        neighbors: "Sąsiadki"
      }
    },
  },
  dynamicPages: {
    faqTitle: "Często Zadawane Pytania",
    notFoundTitle: "Nie Znaleziono Strony",
    notFoundDescription: "Przepraszamy, strona, której szukasz, nie istnieje lub została przeniesiona.",
    subcategoryPageTitle: "{subcategoryName} {categoryName} - {siteName}",
    subcategoryPageDescription: "Odkryj najlepsze treści {subcategoryName} w kategorii {categoryName} na {siteName}.",
    subcategoryPageMetaDescription: "Znajdź linki i zasoby dla {subcategoryName} w kategorii {categoryName} na {siteName}. Przeglądaj naszą kolekcję w poszukiwaniu najnowszych aktualizacji.",
    subcategoryDetailedContentPlaceholder: "Szczegółowa treść dla {subcategoryName} w kategorii {categoryName} będzie dostępna wkrótce.",
    subcategoryFaqPlaceholderQuestion: "Co znajdę w {subcategoryName} {categoryName}?",
    subcategoryFaqPlaceholderAnswer: "Informacje o {subcategoryName} {categoryName} zostaną dodane wkrótce.",
    detailedDescriptionAccordionTitle: "Przeczytaj Pełny Opis",
    detailedDescriptionNotAvailablePlaceholder: "<p>Szczegółowy opis nie jest obecnie dostępny.</p>",
    exploreOtherCategoriesTitle: "Przeglądaj Inne Kategorie",
    exploreOtherSubcategoriesTitle: "Przeglądaj Inne Podkategorie {categoryName}",
    recommendedArticlesTitle: "Polecane Artykuły Blogowe",
    exploreTopicsTitle: "Przeglądaj Tematy"
  },
  affiliateOffers: {
    "milf": {
      name: "MILF",
      description: "Znajdź dostępne dojrzałe kobiety i MILF."
    },
    "-woman": { // Ensure key matches if it starts with "-"
      name: "Kobieta",
      description: "Znajdź kobiety na randki i związki."
    },
    "woman-60-plus": {
      name: "Kobieta 60+",
      description: "Znajdź dojrzałe kobiety powyżej 60 roku życia."
    },
    "trans": {
      name: "Trans",
      description: "Znajdź osoby transpłciowe."
    },
    "gay": {
      name: "Gej",
      description: "Znajdź gejów."
    },
    "to-fuck": {
      name: "Luźne Spotkania",
      description: "Luźne spotkania na seks."
    },
    "cam": {
      name: "Kamerki",
      description: "Czaty wideo i kamerki na żywo."
    },
    "neighbors": {
      name: "Sąsiadki",
      description: "Znajdź dostępne sąsiadki."
    },
    "girl": {
      name: "Dziewczyna",
      description: "Znajdź dziewczyny na randki i zabawę."
    }
  },
  footer: {
    aboutUs: "O Nas",
    privacyPolicy: "Polityka Prywatności",
    contactUs: "Kontakt (WKRÓTCE)",
    disclaimer: "Wszystkie modelki mają powyżej 18 lat. Ta strona zawiera materiały dla dorosłych. Wchodzisz na własne ryzyko.",
    copyright: `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "Telegram Polska"}. Wszelkie prawa zastrzeżone.`,
    telegramNetworkTitle: "Nasza Sieć Telegram",
    telegramNetworkLinks: [] as { name: string; url: string }[],
    otherSitesTitle: "Inne Interesujące Strony",
    otherSitesLinks: [] as { name: string; url: string }[],
    informationTitle: "Informacje",
    affiliateDisclaimerTitle: "Ujawnienie Partnerstwa",
    affiliateDisclaimer:
      "Ta strona może zawierać linki partnerskie. Jeśli klikniesz w te linki i dokonasz zakupu, możemy otrzymać niewielką prowizję bez dodatkowych kosztów dla Ciebie. Pomaga to wspierać naszą platformę. Polecamy tylko produkty lub usługi, w które wierzymy.",
    responsibleGamblingTitle: "Odpowiedzialny Hazard",
    responsibleGambling:
      "Hazard może uzależniać. Graj odpowiedzialnie. Jeśli Ty lub ktoś, kogo znasz, ma problem z hazardem, poszukaj pomocy. Dostępnych jest wiele zasobów zapewniających wsparcie i porady.",
    nonAffiliationDisclaimerTitle: "Zastrzeżenie o Braku Powiązań",
    nonAffiliationDisclaimer:
      `Nie jesteśmy powiązani z Telegram Messenger, nie są oni wspierani, sponsorowani ani specjalnie zatwierdzeni przez Telegram Messenger. Telegram jest zarejestrowanym znakiem towarowym Telegram Messenger Inc. Nasza strona jest niezależnym agregatorem treści dostępnych na platformie Telegram.`,
    exploreTopicsTitle: "Przeglądaj Tematy"
  },
  search: {
    inputPlaceholder: "Szukaj grup, kanałów, filmów...",
    noResults: "Nie znaleziono wyników dla \\\"{query}\\\". Spróbuj innego wyszukiwania.",
    filtersTitle: "Filtruj",
    sortByTitle: "Sortuj Według",
    sortOptions: {
      relevance: "Trafność",
      newest: "Najnowsze",
      oldest: "Najstarsze",
      popular: "Popularne"
    },
    categoryFilter: "Kategoria",
    subcategoryFilter: "Podkategoria",
    applyFiltersButton: "Zastosuj Filtr",
    resetFiltersButton: "Resetuj Filtr",
    viewMore: "Zobacz Więcej",
    viewLess: "Zobacz Mniej",
    allCategories: "Wszystkie Kategorie"
  },
  pagination: {
    previous: "Poprzednia",
    next: "Następna",
    page: "Strona",
    of: "z"
  },
  cookieConsent: {
    text: "Ta strona używa plików cookie, aby poprawić Twoje wrażenia z użytkowania. Kontynuując korzystanie z tej strony, zgadzasz się na użycie plików cookie.",
    accept: "Akceptuj",
    decline: "Odrzuć",
    learnMore: "Dowiedz się Więcej"
  },
  notFound: {
    title: "404 - Nie Znaleziono Strony",
    description: "Przepraszamy, strona, której szukasz, nie istnieje lub została przeniesiona.",
    homeButton: "Powrót na Stronę Główną"
  },
  common: {
    loading: "Ładowanie...",
    error: "Wystąpił błąd. Spróbuj ponownie później.",
    submit: "Wyślij",
    cancel: "Anuluj",
    close: "Zamknij",
    seeAll: "Zobacz Wszystkie"
  },
  ariaLabels: {
    mainNavigation: "Nawigacja Główna",
    openMenu: "Otwórz Menu Główne",
    closeMenu: "Zamknij Menu Główne",
    filterByCategory: "Filtruj Treści według Kategorii",
    subcategoryLink: "Pokaż Treści dla Podkategorii",
    themeToggle: "Przełącz Między Trybem Ciemnym a Jasnym",
    thematicButtonLink: "Link do {label}",
    blogPostLink: "Czytaj Więcej o {title}",
    blogPostImageAlt: "Obraz Artykułu dla {title}",
    socialShareButton: "Przycisk Udostępniania {platformName}",
    copyLinkButton: "Przycisk Kopiowania Linku do Artykułu"
  },
  supplementProducts: {
    bigDick: {
      name: "🍆 Duży Penis"
    },
    betterErection: {
      name: "🚀 Lepsza Erekcja"
    },
    fatBurn: {
      name: "🔥 Spalacz Tłuszczu"
    },
    extremeBulk: {
      name: "💪 Ekstremalna Masa"
    },
    hairLoss: {
      name: "👨‍🦲 Produkty na Wzrost Włosów"
    }
  },
  casinoOffers: {
    title: " Najlepsze Oferty Kasyn 🌟",
    vpnNeeded: "Wymagane VPN",
    topBadge: "🔥 Top"
  }
};

// --- Language-Specific Slug Maps ---
// These should ideally mirror the slug configurations used by your Python content generation script (data_config.py)

/* // Removed SUBCATEGORY_EN_TO_ES_SLUG as it is unused
const SUBCATEGORY_EN_TO_ES_SLUG: Record<string, string> = {
  // Example Spanish Slugs - Populate comprehensively
  "amateur": "amateur",
  "anal": "anal",
  // ... (rest of the map)
};
*/

/* // Removed SUBCATEGORY_EN_TO_DE_SLUG as it is unused
const SUBCATEGORY_EN_TO_DE_SLUG: Record<string, string> = {
  "amateur": "amateure",
  "anal": "anal",
  // ... (rest of the map)
};
*/

// --- End Language-Specific Slug Maps ---

export type AffiliateOfferId = keyof typeof siteStrings.affiliateOffers;

export type SiteStrings = typeof siteStrings;

// Update getSubcategorySlug to use the new englishSubcategorySlugsMap from siteStrings
export function getSubcategorySlug(subcategoryKey: SubcategoryKey): string {
  // Ensure it uses the map that now holds English slugs via siteStrings
  return siteStrings.slugs.subcategories[subcategoryKey];
}

export const subcategoryList = Object.keys(siteStrings.subcategories) as Array<keyof typeof siteStrings.subcategories>; 