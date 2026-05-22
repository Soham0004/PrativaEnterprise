class ReviewModal {
    constructor(options = {}) {
        this.reviewSelector = options.reviewSelector || '#reviews .review-card';
        this.overlay = document.getElementById('reviewModalOverlay');
        this.backdrop = document.getElementById('reviewModalBackdrop');
        this.modalCard = document.getElementById('reviewModalCard');
        this.closeButton = document.getElementById('reviewModalClose');
        this.modalName = document.getElementById('reviewModalName');
        this.modalLocation = document.getElementById('reviewModalLocation');
        this.modalText = document.getElementById('reviewModalText');
        this.modalAvatar = document.getElementById('reviewModalAvatar');
        this.modalStars = document.getElementById('reviewModalStars');
        this.reviewCards = Array.from(document.querySelectorAll(this.reviewSelector));

        if (!this.overlay || !this.backdrop || !this.modalCard || !this.closeButton || !this.reviewCards.length) {
            return;
        }

        this.reviews = [];
        this.reviewKeyToIndex = new Map();
        this.cardToIndex = new WeakMap();
        this.currentIndex = 0;
        this.originCard = null;
        this.isOpen = false;
        this.isAnimating = false;
        this.dragPointerId = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
        this.lastFocusedElement = null;
        this.transitionDuration = 460;

        this.buildReviewIndex();
        this.bindReviewCards();
        this.bindModalEvents();
    }

    buildReviewIndex() {
        this.reviewCards.forEach((card) => {
            const review = this.extractReviewData(card);
            const key = `${review.name}|${review.location}|${review.text}`;

            let reviewIndex = this.reviewKeyToIndex.get(key);
            if (reviewIndex === undefined) {
                reviewIndex = this.reviews.length;
                this.reviewKeyToIndex.set(key, reviewIndex);
                this.reviews.push(review);
            }

            this.cardToIndex.set(card, reviewIndex);
            card.dataset.reviewIndex = String(reviewIndex);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open review from ${review.name}`);
        });
    }

    extractReviewData(card) {
        const contentBlock = card.querySelector('.relative.z-10.flex-grow');
        const reviewTextNode = contentBlock ? contentBlock.querySelector('p') : null;
        const footerBlock = card.querySelector('.border-t');
        const nameNode = footerBlock ? footerBlock.querySelector('h4') : null;
        const locationNode = footerBlock ? footerBlock.querySelector('p') : null;
        const avatarNode = footerBlock ? footerBlock.querySelector('div.w-10') : null;
        const starCount = contentBlock ? contentBlock.querySelectorAll('.ph-star').length : 5;
        const avatarClasses = avatarNode
            ? Array.from(avatarNode.classList)
                .filter((className) => className.startsWith('bg-') || className.startsWith('text-'))
                .join(' ')
            : 'bg-brand-blue text-white';

        return {
            name: nameNode ? nameNode.textContent.trim() : 'Happy Customer',
            location: locationNode ? locationNode.textContent.trim() : 'Kolkata',
            text: this.stripWrappingQuotes(reviewTextNode ? reviewTextNode.textContent : ''),
            avatarText: avatarNode ? avatarNode.textContent.trim() : 'K',
            avatarClasses,
            starCount: starCount || 5
        };
    }

    stripWrappingQuotes(text) {
        return text.trim().replace(/^"+|"+$/g, '');
    }

    bindReviewCards() {
        this.reviewCards.forEach((card) => {
            card.addEventListener('click', () => {
                this.openFromCard(card);
            });

            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.openFromCard(card);
                }
            });
        });
    }

    bindModalEvents() {
        this.closeButton.addEventListener('click', () => this.close());

        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay || event.target === this.backdrop) {
                this.close();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!this.isOpen) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.navigate(-1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.navigate(1);
            }
        });

        this.modalCard.addEventListener('pointerdown', (event) => this.onPointerDown(event));
        this.modalCard.addEventListener('pointermove', (event) => this.onPointerMove(event));
        this.modalCard.addEventListener('pointerup', () => this.onPointerUp());
        this.modalCard.addEventListener('pointercancel', () => this.onPointerUp());
    }

    openFromCard(card) {
        if (this.isAnimating || !card) return;

        this.originCard = card;
        this.currentIndex = Number(card.dataset.reviewIndex || 0);
        this.lastFocusedElement = document.activeElement;
        this.render(this.currentIndex);
        this.showOverlay();
        this.animateOpen(card);
    }

    showOverlay() {
        this.isOpen = true;
        document.body.classList.add('review-modal-open');
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('flex');
        this.overlay.setAttribute('aria-hidden', 'false');
        this.backdrop.style.opacity = '0';
        this.modalCard.style.opacity = '0';
        this.modalCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
    }

    hideOverlay() {
        this.isOpen = false;
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('flex');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.backdrop.style.opacity = '0';
        this.modalCard.style.opacity = '0';
        this.modalCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
        this.modalCard.classList.remove('is-dragging');
        document.body.classList.remove('review-modal-open');

        if (this.originCard) {
            this.originCard.style.opacity = '';
        }

        if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
            this.lastFocusedElement.focus({ preventScroll: true });
        }
    }

    render(index) {
        const review = this.reviews[index];
        if (!review) return;

        this.currentIndex = index;
        this.modalName.textContent = review.name;
        this.modalLocation.textContent = review.location;
        this.modalText.textContent = `"${review.text}"`;
        this.modalAvatar.textContent = review.avatarText;
        this.modalAvatar.className = `flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold shadow-lg shadow-sky-200/60 ${review.avatarClasses}`;
        if (this.modalStars) {
            this.modalStars.innerHTML = new Array(review.starCount || 5)
                .fill('<i class="ph-fill ph-star"></i>')
                .join('');
        }
    }

    animateOpen(sourceCard) {
        const sourceRect = sourceCard.getBoundingClientRect();

        sourceCard.style.opacity = '0';
        this.modalCard.style.transition = 'none';
        this.modalCard.style.opacity = '0';

        const finalRect = this.modalCard.getBoundingClientRect();
        this.modalCard.style.transform = this.getFlipTransform(sourceRect, finalRect);
        this.modalCard.style.opacity = '0.78';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
            this.isAnimating = true;
            this.modalCard.style.transition = '';
            this.backdrop.style.opacity = '1';
            this.modalCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
            this.modalCard.style.opacity = '1';

            window.setTimeout(() => {
                this.isAnimating = false;
                this.closeButton.focus({ preventScroll: true });
            }, this.transitionDuration);
            });
        });
    }

    close() {
        if (!this.isOpen || this.isAnimating) return;

        const targetCard = this.getReturnCard();
        if (targetCard) {
            targetCard.style.opacity = '';
        }

        this.isAnimating = true;
        this.modalCard.classList.remove('is-dragging');
        this.modalCard.style.transition = '';
        this.backdrop.style.opacity = '0';

        if (targetCard) {
            const currentRect = this.modalCard.getBoundingClientRect();
            const targetRect = targetCard.getBoundingClientRect();
            this.modalCard.style.transform = this.getFlipTransform(targetRect, currentRect);
            this.modalCard.style.opacity = '0.72';
        } else {
            this.modalCard.style.transform = 'translate3d(0, 36px, 0) scale(0.95)';
            this.modalCard.style.opacity = '0';
        }

        window.setTimeout(() => {
            this.isAnimating = false;
            this.hideOverlay();
        }, this.transitionDuration - 20);
    }

    getReturnCard() {
        const candidates = this.reviewCards.filter((card) => Number(card.dataset.reviewIndex || -1) === this.currentIndex);
        const viewportCenter = window.innerWidth / 2;
        let bestCard = null;
        let bestScore = Infinity;

        candidates.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
            if (!isVisible) return;

            const centerX = rect.left + rect.width / 2;
            const score = Math.abs(centerX - viewportCenter);
            if (score < bestScore) {
                bestScore = score;
                bestCard = card;
            }
        });

        return bestCard || this.originCard;
    }

    getFlipTransform(targetRect, currentRect) {
        const deltaX = targetRect.left - currentRect.left;
        const deltaY = targetRect.top - currentRect.top;
        const scaleX = Math.max(0.18, targetRect.width / currentRect.width);
        const scaleY = Math.max(0.18, targetRect.height / currentRect.height);

        return `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`;
    }

    onPointerDown(event) {
        if (!this.isOpen || this.isAnimating) return;
        if (event.target.closest('[data-review-modal-close]')) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        this.dragPointerId = event.pointerId;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
        this.modalCard.classList.add('is-dragging');
        this.modalCard.setPointerCapture(event.pointerId);
    }

    onPointerMove(event) {
        if (this.dragPointerId !== event.pointerId || !this.isOpen || this.isAnimating) return;

        this.dragDeltaX = event.clientX - this.dragStartX;
        this.dragDeltaY = event.clientY - this.dragStartY;

        const rotation = this.dragDeltaX * 0.04;
        const distance = Math.min(0.42, (Math.abs(this.dragDeltaX) + Math.max(0, this.dragDeltaY)) / 820);
        this.backdrop.style.opacity = String(1 - distance);
        this.modalCard.style.transform = `translate3d(${this.dragDeltaX}px, ${this.dragDeltaY}px, 0) rotate(${rotation}deg)`;
    }

    onPointerUp() {
        if (this.dragPointerId === null) return;

        if (this.modalCard.hasPointerCapture(this.dragPointerId)) {
            this.modalCard.releasePointerCapture(this.dragPointerId);
        }

        const deltaX = this.dragDeltaX;
        const deltaY = this.dragDeltaY;
        this.dragPointerId = null;
        this.modalCard.classList.remove('is-dragging');

        if (deltaY > 150 && Math.abs(deltaY) > Math.abs(deltaX)) {
            this.dismissWithSwipe();
            return;
        }

        if (deltaX < -120 && Math.abs(deltaX) > Math.abs(deltaY)) {
            this.navigate(-1);
            return;
        }

        if (deltaX > 120 && Math.abs(deltaX) > Math.abs(deltaY)) {
            this.navigate(1);
            return;
        }

        this.resetCardPosition();
    }

    resetCardPosition() {
        this.modalCard.style.transition = '';
        this.modalCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        this.modalCard.style.opacity = '1';
        this.backdrop.style.opacity = '1';
    }

    dismissWithSwipe() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.modalCard.style.transition = '';
        this.backdrop.style.opacity = '0';
        this.modalCard.style.transform = 'translate3d(0, 95vh, 0) rotate(7deg) scale(0.96)';
        this.modalCard.style.opacity = '0';

        window.setTimeout(() => {
            this.isAnimating = false;
            this.hideOverlay();
        }, 320);
    }

    navigate(step) {
        if (!this.isOpen || this.isAnimating || !this.reviews.length) return;

        const direction = step < 0 ? -1 : 1;
        const nextIndex = (this.currentIndex + step + this.reviews.length) % this.reviews.length;
        const exitDistance = window.innerWidth * 0.9 * direction;
        const enterDistance = -exitDistance * 0.35;

        this.isAnimating = true;
        this.modalCard.style.transition = '';
        this.backdrop.style.opacity = '0.82';
        this.modalCard.style.transform = `translate3d(${exitDistance}px, 0, 0) rotate(${direction * 12}deg) scale(0.97)`;
        this.modalCard.style.opacity = '0';

        window.setTimeout(() => {
            this.render(nextIndex);
            this.modalCard.style.transition = 'none';
            this.modalCard.style.transform = `translate3d(${enterDistance}px, 0, 0) scale(0.98)`;
            this.modalCard.style.opacity = '0';

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.modalCard.style.transition = '';
                    this.backdrop.style.opacity = '1';
                    this.modalCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    this.modalCard.style.opacity = '1';

                    window.setTimeout(() => {
                        this.isAnimating = false;
                    }, 300);
                });
            });
        }, 180);
    }
}

window.ReviewModal = ReviewModal;
