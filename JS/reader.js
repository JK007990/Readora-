/* =====================================================
   READORA - ONLINE BOOK READER
   Book Selection | Chapters | Dark Mode | Progress
===================================================== */


/* ==================== BOOK DATABASE ==================== */

const books = {
    "atomic-habits": {
        title: "Atomic Habits",
        author: "James Clear",
        description:
            "Explore small habits, consistency, and practical ways to improve your daily routines.",
        chapters: [
            {
                title: "Introduction to Better Habits",
                content: `
                    <p>
                        Small actions repeated consistently can help
                        create meaningful changes in everyday life.
                        Progress often begins with one manageable step.
                    </p>
                    <h3>The Power of Small Steps</h3>
                    <p>
                        Choose one simple action you can practice today.
                        It could be reading for a few minutes, organizing
                        your workspace, or preparing for tomorrow.
                    </p>
                    <p>
                        Build a routine that is realistic enough to repeat.
                        Consistency makes it easier to continue working
                        toward your goals.
                    </p>
                `
            },
            {
                title: "Building a Consistent Routine",
                content: `
                    <p>
                        A useful routine starts with a clear action
                        and a practical plan.
                    </p>
                    <h3>Make the First Step Simple</h3>
                    <p>
                        Prepare your reading materials in advance,
                        reduce distractions, and choose a time that
                        fits your daily schedule.
                    </p>
                    <p>
                        Review your routine regularly and adjust it
                        to make it easier to maintain.
                    </p>
                `
            }
        ]
    },

    "psychology-of-money": {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description:
            "Explore how behavior, patience, and personal decisions influence financial outcomes.",
        chapters: [
            {
                title: "Money and Human Behavior",
                content: `
                    <p>
                        Financial decisions involve more than numbers.
                        Our experiences, emotions, and expectations
                        can influence how we manage money.
                    </p>
                    <h3>Different Experiences, Different Decisions</h3>
                    <p>
                        People may interpret the same financial situation
                        differently because their circumstances and
                        experiences are different.
                    </p>
                    <p>
                        Understanding your own assumptions can help
                        you make more thoughtful financial decisions.
                    </p>
                `
            },
            {
                title: "Patience and Long-Term Thinking",
                content: `
                    <p>
                        Long-term goals often require patience and
                        consistent decisions over time.
                    </p>
                    <h3>Define Your Priorities</h3>
                    <p>
                        Consider what financial security means to you.
                        A clear understanding of your priorities can
                        help guide your decisions.
                    </p>
                `
            }
        ]
    },

    "dopamine-nation": {
        title: "Dopamine Nation",
        author: "Anna Lembke",
        description:
            "Reflect on pleasure, distractions, and everyday habits.",
        chapters: [
            {
                title: "Understanding Everyday Habits",
                content: `
                    <p>
                        Modern life offers many opportunities for
                        entertainment and immediate rewards.
                    </p>
                    <h3>Notice Your Patterns</h3>
                    <p>
                        Pay attention to when you reach for your phone
                        or another distraction automatically.
                    </p>
                    <p>
                        Becoming aware of these patterns can help
                        you make more intentional choices.
                    </p>
                `
            },
            {
                title: "Making Time for Focus",
                content: `
                    <p>
                        Create space for activities that require
                        concentration and patience.
                    </p>
                    <p>
                        Consider setting aside uninterrupted time
                        for reading, learning, exercise, or meaningful
                        conversations.
                    </p>
                `
            }
        ]
    },

    "the-mountain-is-you": {
        title: "The Mountain Is You",
        author: "Brianna Wiest",
        description:
            "Reflect on personal growth, recurring patterns, and creating positive change.",
        chapters: [
            {
                title: "Understanding Personal Patterns",
                content: `
                    <p>
                        Change can be difficult even when we want
                        a different outcome.
                    </p>
                    <h3>Begin with Awareness</h3>
                    <p>
                        Identify a recurring situation that leaves
                        you feeling stuck. Think about the choices
                        and routines that may contribute to it.
                    </p>
                `
            },
            {
                title: "Taking the Next Step",
                content: `
                    <p>
                        Personal growth does not require solving
                        every challenge at once.
                    </p>
                    <p>
                        Focus on one manageable action, learn from
                        setbacks, and keep your expectations realistic.
                    </p>
                `
            }
        ]
    },

    "think-and-grow-rich": {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        description:
            "Explore goal setting, planning, persistence, and personal ambition.",
        chapters: [
            {
                title: "Defining a Clear Goal",
                content: `
                    <p>
                        A clear goal gives your efforts direction.
                        Specific goals are easier to turn into
                        practical daily actions.
                    </p>
                    <h3>Turn Intentions into a Plan</h3>
                    <p>
                        Write down what you want to achieve and
                        identify one action you can take this week.
                    </p>
                `
            },
            {
                title: "Persistence and Learning",
                content: `
                    <p>
                        Progress rarely follows a perfectly straight
                        line. Challenges can show which parts of
                        a plan need improvement.
                    </p>
                    <p>
                        Seek useful feedback, review your approach,
                        and continue learning.
                    </p>
                `
            }
        ]
    },

    "rich-dad-poor-dad": {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        description:
            "Explore financial education, money habits, and informed decision-making.",
        chapters: [
            {
                title: "Learning About Money",
                content: `
                    <p>
                        Financial education involves understanding
                        income, spending, saving, debt, and planning.
                    </p>
                    <h3>Understand Your Cash Flow</h3>
                    <p>
                        Record the money that comes in and the money
                        that goes out. This overview can help you
                        understand your spending habits.
                    </p>
                `
            },
            {
                title: "Making Informed Decisions",
                content: `
                    <p>
                        Before making a financial decision, consider
                        the costs, risks, and possible outcomes.
                    </p>
                    <p>
                        Build your knowledge gradually and remember
                        that financial results depend on individual
                        circumstances.
                    </p>
                `
            }
        ]
    },

    "the-alchemist": {
        title: "The Alchemist",
        author: "Paulo Coelho",
        description:
            "Reflect on dreams, courage, self-discovery, and the journey toward a meaningful life.",
        chapters: [
            {
                title: "Dreams and Possibilities",
                content: `
                    <p>
                        Dreams can encourage us to explore possibilities
                        beyond familiar routines.
                    </p>
                    <h3>The Value of the Journey</h3>
                    <p>
                        Working toward a meaningful goal can teach
                        us about patience, courage, and ourselves.
                    </p>
                `
            },
            {
                title: "Courage to Keep Exploring",
                content: `
                    <p>
                        New experiences often involve uncertainty.
                        Learning, preparing, and remaining open to
                        new information can help us navigate change.
                    </p>
                    <p>
                        The process of pursuing a goal may also
                        change what we value.
                    </p>
                `
            }
        ]
    },

    "ikigai": {
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        description:
            "Reflect on purpose, everyday meaning, community, and a balanced life.",
        chapters: [
            {
                title: "Finding Meaning in Everyday Life",
                content: `
                    <p>
                        Meaning can come from relationships, useful
                        work, creative interests, and everyday activities.
                    </p>
                    <h3>Notice What Gives You Energy</h3>
                    <p>
                        Think about activities that help you feel
                        engaged and connected to the world around you.
                    </p>
                `
            },
            {
                title: "Building a Balanced Routine",
                content: `
                    <p>
                        A sustainable routine leaves room for work,
                        rest, relationships, and personal interests.
                    </p>
                    <p>
                        Start with one realistic improvement and
                        build on it over time.
                    </p>
                `
            }
        ]
    }
};


/* ==================== SELECT ELEMENTS ==================== */

const $ = (id) => document.getElementById(id);

const readerTitle = $("reader-title");
const readerAuthor = $("reader-author");
const readerDescription = $("reader-description");
const readerCover = $("reader-cover");

const chapterTitle = $("chapter-title");
const chapterLabel = $("chapter-label");
const readerContent = $("reader-content");
const readerNotice = $("reader-notice");

const fontSizeLabel = $("font-size-label");

const progressBar = $("progress-bar");
const progressPercentage = $("progress-percentage");
const progressTrack = $("progress-track");

const previousButton = $("previous-chapter");
const nextButton = $("next-chapter");
const bottomPreviousButton = $("bottom-previous");
const bottomNextButton = $("bottom-next");

const themeToggle = $("theme-toggle");


/* ==================== SELECT BOOK ==================== */

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id") || "atomic-habits";
const book = books[bookId];

const storageKey = `readora-progress-${bookId}`;

let currentChapter = 0;
let fontSize = 18;


/* ==================== BOOK INFORMATION ==================== */

function renderBookInfo() {
    if (!book) {
        document.title = "Book Not Found | Readora";

        readerTitle.textContent = "Book Not Found";
        readerAuthor.textContent = "Readora";
        readerDescription.textContent =
            "Please return to the books page and select an available book.";

        readerCover.src =
            "https://placehold.co/180x260/fff0e6/f47721?text=Not+Found";

        readerCover.alt = "Book not found";

        chapterTitle.textContent = "Book unavailable";
        chapterLabel.textContent = "NOT FOUND";

        readerContent.replaceChildren();

        readerNotice.hidden = false;
        readerNotice.textContent =
            "This book is not available in the reader yet.";

        disableChapterButtons(true);

        return false;
    }

    document.title = `${book.title} | Readora`;

    readerTitle.textContent = book.title;
    readerAuthor.textContent = book.author;
    readerDescription.textContent = book.description;

    readerCover.src =
        `https://placehold.co/180x260/fff0e6/f47721?text=${encodeURIComponent(book.title)}`;

    readerCover.alt = `${book.title} book cover`;

    return true;
}


/* ==================== CHAPTER BUTTONS ==================== */

function disableChapterButtons(disabled) {
    [
        previousButton,
        nextButton,
        bottomPreviousButton,
        bottomNextButton
    ].forEach((button) => {
        if (button) button.disabled = disabled;
    });
}


function updateChapterButtons() {
    previousButton.disabled = currentChapter === 0;
    bottomPreviousButton.disabled = currentChapter === 0;

    nextButton.disabled =
        currentChapter >= book.chapters.length - 1;

    bottomNextButton.disabled =
        currentChapter >= book.chapters.length - 1;
}


/* ==================== SAVE PROGRESS ==================== */

function getSavedProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));

        if (
            saved &&
            Number.isInteger(saved.chapter) &&
            saved.chapter >= 0 &&
            saved.chapter < book.chapters.length
        ) {
            return saved;
        }
    } catch (error) {
        console.warn("Could not load reading progress.", error);
    }

    return {
        chapter: 0,
        scroll: 0
    };
}


function saveProgress() {
    if (!book) return;

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                chapter: currentChapter,
                scroll: window.scrollY
            })
        );
    } catch (error) {
        console.warn("Could not save reading progress.", error);
    }
}


/* ==================== RENDER CHAPTER ==================== */

function renderChapter(scrollToTop = false) {
    if (!book) return;

    const chapter = book.chapters[currentChapter];

    if (!chapter) return;

    chapterTitle.textContent = chapter.title;

    chapterLabel.textContent =
        `CHAPTER ${currentChapter + 1} OF ${book.chapters.length}`;

    readerContent.innerHTML = chapter.content;

    readerNotice.hidden = true;

    updateChapterButtons();
    updateProgress();
    saveProgress();

    if (scrollToTop) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


function goToChapter(index) {
    if (!book) return;

    if (index < 0 || index >= book.chapters.length) return;

    currentChapter = index;
    renderChapter(true);
}


/* ==================== CHAPTER EVENTS ==================== */

previousButton.addEventListener("click", () => {
    goToChapter(currentChapter - 1);
});

bottomPreviousButton.addEventListener("click", () => {
    goToChapter(currentChapter - 1);
});

nextButton.addEventListener("click", () => {
    goToChapter(currentChapter + 1);
});

bottomNextButton.addEventListener("click", () => {
    goToChapter(currentChapter + 1);
});


/* ==================== FONT SIZE ==================== */

function updateFontSize() {
    readerContent.style.fontSize = `${fontSize}px`;
    fontSizeLabel.textContent = `${fontSize}px`;

    try {
        localStorage.setItem(
            "readora-font-size",
            String(fontSize)
        );
    } catch (error) {
        console.warn("Could not save font size.", error);
    }
}


$("increase-font").addEventListener("click", () => {
    if (fontSize < 30) {
        fontSize++;
        updateFontSize();
    }
});


$("decrease-font").addEventListener("click", () => {
    if (fontSize > 12) {
        fontSize--;
        updateFontSize();
    }
});


try {
    const savedFontSize = Number(
        localStorage.getItem("readora-font-size")
    );

    if (
        Number.isFinite(savedFontSize) &&
        savedFontSize >= 12 &&
        savedFontSize <= 30
    ) {
        fontSize = savedFontSize;
    }
} catch (error) {
    console.warn("Could not load font size.", error);
}

updateFontSize();


/* ==================== DARK MODE ==================== */

const themeKey = "readora-reading-theme";


function applyTheme(isDark) {
    document.body.classList.toggle("dark-reading", isDark);

    const icon = themeToggle.querySelector("i");

    if (icon) {
        icon.className = isDark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light reading theme"
            : "Switch to dark reading theme"
    );

    try {
        localStorage.setItem(
            themeKey,
            isDark ? "dark" : "light"
        );
    } catch (error) {
        console.warn("Could not save theme.", error);
    }
}


let darkMode = false;

try {
    darkMode = localStorage.getItem(themeKey) === "dark";
} catch (error) {
    console.warn("Could not load theme.", error);
}

applyTheme(darkMode);

themeToggle.addEventListener("click", () => {
    darkMode =
        !document.body.classList.contains("dark-reading");

    applyTheme(darkMode);
});


/* ==================== READING PROGRESS ==================== */

function updateProgress() {
    if (!book) return;

    const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    let percentage = 0;

    if (documentHeight > 0) {
        percentage = Math.round(
            (window.scrollY / documentHeight) * 100
        );
    }

    percentage = Math.max(0, Math.min(100, percentage));

    progressBar.style.width = `${percentage}%`;

    progressPercentage.textContent = `${percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );
}


let scrollScheduled = false;

window.addEventListener(
    "scroll",
    () => {
        if (scrollScheduled) return;

        scrollScheduled = true;

        requestAnimationFrame(() => {
            updateProgress();
            saveProgress();
            scrollScheduled = false;
        });
    },
    { passive: true }
);

window.addEventListener("resize", updateProgress);


/* ==================== RESTORE READING POSITION ==================== */

function restoreProgress() {
    if (!book) return;

    const saved = getSavedProgress();

    currentChapter = saved.chapter;

    renderChapter(false);

    requestAnimationFrame(() => {
        const maxScroll = Math.max(
            0,
            document.documentElement.scrollHeight -
                window.innerHeight
        );

        const position = Math.max(
            0,
            Math.min(Number(saved.scroll) || 0, maxScroll)
        );

        window.scrollTo(0, position);

        updateProgress();
    });
}


/* ==================== FOOTER YEAR ==================== */

const yearElement = $("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* ==================== INITIALIZE READER ==================== */

if (renderBookInfo()) {
    restoreProgress();
}