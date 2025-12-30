// Virgilian Lots - JavaScript functionality

class VirgilianLots {
    constructor() {
        this.data = null;
        this.currentLine = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.validateData();
    }

    cacheElements() {
        this.elements = {
            getLineBtn: document.getElementById('getLine'),
            resultContainer: document.getElementById('result'),
            verseText: document.getElementById('verseText'),
            bookInfo: document.getElementById('bookInfo'),
            lineInfo: document.getElementById('lineInfo'),
            loading: document.getElementById('loading')
        };
    }

    bindEvents() {
        this.elements.getLineBtn.addEventListener('click', () => this.getRandomLine());
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                if (!this.isLoading) {
                    this.getRandomLine();
                }
            }
        });
    }

    validateData() {
        if (typeof aeneidData !== 'undefined' && aeneidData.books && aeneidData.books.length > 0) {
            this.data = aeneidData;
            console.log('Aeneid data loaded successfully:', 
                this.data.books.length, 'books,',
                this.getTotalLines(), 'total lines');
        } else {
            console.error('Aeneid data not found or invalid');
            this.showError('Unable to load Virgil\'s Aeneid. Please refresh the page.');
        }
    }

    getTotalLines() {
        return this.data.books.reduce((total, book) => total + book.lines.length, 0);
    }

    getRandomLine() {
        if (this.isLoading || !this.data) return;

        this.setLoading(true);

        // Simulate consultation delay for dramatic effect
        setTimeout(() => {
            const randomLine = this.selectRandomLine();
            this.displayLine(randomLine);
            this.setLoading(false);
        }, 1200 + Math.random() * 800);
    }

    selectRandomLine() {
        if (!this.data || !this.data.books || this.data.books.length === 0) {
            return null;
        }

        // Weight books by their line count
        const totalLines = this.getTotalLines();
        const randomIndex = Math.floor(Math.random() * totalLines);
        
        let cumulativeLines = 0;
        for (const book of this.data.books) {
            if (randomIndex < cumulativeLines + book.lines.length) {
                const lineIndex = randomIndex - cumulativeLines;
                return {
                    book: book.bookNumber,
                    line: book.lines[lineIndex].lineNumber,
                    text: book.lines[lineIndex].text,
                    bookTitle: `Book ${book.bookNumber}`
                };
            }
            cumulativeLines += book.lines.length;
        }

        // Fallback - should not reach here
        const firstBook = this.data.books[0];
        const firstLine = firstBook.lines[0];
        return {
            book: firstBook.bookNumber,
            line: firstLine.lineNumber,
            text: firstLine.text,
            bookTitle: `Book ${firstBook.bookNumber}`
        };
    }

    displayLine(verse) {
        if (!verse) {
            this.showError('Unable to retrieve a verse. Please try again.');
            return;
        }

        this.currentLine = verse;

        // Update text content
        this.elements.verseText.textContent = verse.text;
        this.elements.bookInfo.textContent = verse.bookTitle;
        this.elements.lineInfo.textContent = `Line ${verse.line}`;

        // Show result with animation
        this.elements.resultContainer.classList.remove('hidden');
        
        // Scroll to result
        setTimeout(() => {
            this.elements.resultContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);

        // Update button text
        this.elements.getLineBtn.querySelector('.btn-text').textContent = 'Consult Again';
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.elements.loading.classList.remove('hidden');
            this.elements.resultContainer.classList.add('hidden');
            this.elements.getLineBtn.disabled = true;
            this.elements.getLineBtn.style.opacity = '0.6';
            this.elements.getLineBtn.style.cursor = 'not-allowed';
        } else {
            this.elements.loading.classList.add('hidden');
            this.elements.getLineBtn.disabled = false;
            this.elements.getLineBtn.style.opacity = '1';
            this.elements.getLineBtn.style.cursor = 'pointer';
        }
    }

    showError(message) {
        this.setLoading(false);
        
        // Create error element if it doesn't exist
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            document.querySelector('.divination-section').appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Public method for external access
    getCurrentLine() {
        return this.currentLine;
    }

    // Reset functionality
    reset() {
        this.currentLine = null;
        this.elements.resultContainer.classList.add('hidden');
        this.elements.getLineBtn.querySelector('.btn-text').textContent = 'Consult the Oracle';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.virgilianLots = new VirgilianLots();
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker registration failed');
        });
    });
}

// Add some easter eggs
let clickCount = 0;
document.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 7) {
        console.log('🎭 "Arma virumque cano..." - Virgil would be proud!');
        clickCount = 0;
    }
});