/**
 * ============================================
 * メインのJavaScriptファイル
 * コーポレートサイトのインタラクティブな機能を実装
 * ============================================
 */

// DOM要素が読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // 各機能を初期化
    initNavigation();
    initScrollEffects();
    initSkillAnimations();
    initStatCounter();
    initContactForm();
    initSmoothScroll();
    initScrollToTop();
});

/**
 * ============================================
 * ナビゲーション機能
 * ============================================
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // スクロール時のナビゲーションバーのスタイル変更
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ハンバーガーメニューの開閉
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ナビゲーションリンククリック時にメニューを閉じる（モバイル用）
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // アクティブなセクションに応じてナビゲーションリンクをハイライト
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // 初期状態でも実行
}

/**
 * 現在表示されているセクションに応じてナビゲーションリンクをハイライト
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    // 各セクションの位置を確認
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // ビューポートの中央付近にあるセクションをアクティブと判定
        if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    // ナビゲーションリンクのアクティブ状態を更新
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * ============================================
 * スクロールエフェクト
 * ============================================
 */
function initScrollEffects() {
    // Intersection Observer APIを使用して要素がビューポートに入ったときにアニメーション
    const observerOptions = {
        threshold: 0.1, // 要素の10%が表示されたら発火
        rootMargin: '0px 0px -50px 0px' // 少し早めに発火させる
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                // 一度表示されたら監視を停止（パフォーマンス向上）
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animatedElements = document.querySelectorAll(
        '.about-grid, .skill-category, .project-card, .contact-wrapper'
    );
    
    animatedElements.forEach(element => {
        element.classList.add('fade-in-element');
        observer.observe(element);
    });
}

/**
 * ============================================
 * スキルバーのアニメーション
 * ============================================
 */
function initSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    // Intersection Observerでスキルセクションが表示されたときにアニメーション
    const skillObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }
}

/**
 * スキルバーをアニメーションで表示
 */
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach((bar, index) => {
        const width = bar.getAttribute('data-width');
        
        // 各バーを少しずつ遅延させてアニメーション（視覚的に美しい）
        setTimeout(() => {
            bar.style.width = width + '%';
        }, index * 100); // 100msずつ遅延
    });
}

/**
 * ============================================
 * 統計カウンターのアニメーション
 * ============================================
 */
function initStatCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Intersection Observerで統計セクションが表示されたときにカウントアップ
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        statObserver.observe(aboutSection);
    }
}

/**
 * カウンターをアニメーションでカウントアップ
 */
function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2秒でカウントアップ
        const increment = target / (duration / 16); // 60fpsを想定
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 16); // 約60fps
    });
}

/**
 * ============================================
 * お問い合わせフォームの処理
 * ============================================
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // デフォルトのフォーム送信を防止
        
        // フォームデータを取得
        const formData = new FormData(contactForm);
        
        // 送信ボタンを無効化（二重送信防止）
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>送信中...</span>';
        
        try {
            // PHPファイルにフォームデータを送信
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            // 成功メッセージを表示
            if (result.success) {
                formMessage.textContent = result.message || 'お問い合わせありがとうございます。メッセージを送信しました。';
                formMessage.className = 'form-message success';
                contactForm.reset(); // フォームをリセット
            } else {
                // エラーメッセージを表示
                formMessage.textContent = result.message || 'エラーが発生しました。もう一度お試しください。';
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            // ネットワークエラーなどの場合
            formMessage.textContent = 'デモ版のため、送信は実行されません。';
            formMessage.className = 'form-message error';
            console.error('Form submission error:', error);
        } finally {
            // 送信ボタンを再有効化
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // メッセージを5秒後に自動で非表示
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 5000);
        }
    });
    
    // リアルタイムバリデーション（オプション）
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
    });
}

/**
 * 個別のフォームフィールドをバリデーション
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // 必須チェック
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'この項目は必須です';
    }
    
    // メールアドレスの形式チェック
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = '有効なメールアドレスを入力してください';
        }
    }
    
    // エラー表示（簡易版）
    if (!isValid) {
        field.style.borderColor = '#ef4444';
        // エラーメッセージを表示する場合はここに追加
    } else {
        field.style.borderColor = '#e5e7eb';
    }
    
    return isValid;
}

/**
 * ============================================
 * スムーズスクロール
 * ============================================
 */
function initSmoothScroll() {
    // アンカーリンク（#で始まるリンク）をクリックしたときの処理
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // #だけの場合は何もしない
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // ナビゲーションバーの高さを考慮してスクロール位置を調整
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * ============================================
 * トップに戻るボタン
 * ============================================
 */
function initScrollToTop() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    if (!scrollToTopButton) return;
    
    // スクロール位置に応じてボタンの表示/非表示を切り替え
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });
    
    // ボタンクリック時にトップにスクロール
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * ============================================
 * パフォーマンス最適化：画像の遅延読み込み
 * ============================================
 */
function initLazyLoading() {
    // 画像の遅延読み込み（Intersection Observerを使用）
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        // data-src属性を持つ画像を監視
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * ============================================
 * ユーティリティ関数
 * ============================================
 */

/**
 * デバウンス関数（連続実行を防ぐ）
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * スロットル関数（実行頻度を制限）
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ミリ秒）
 * @returns {Function} スロットルされた関数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// スクロールイベントを最適化（パフォーマンス向上）
const optimizedScrollHandler = throttle(function() {
    // スクロール時の処理をここに追加
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

/**
 * ============================================
 * エラーハンドリング
 * ============================================
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // 本番環境では、エラーをログサービスに送信するなどの処理を追加
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // 本番環境では、エラーをログサービスに送信するなどの処理を追加
});



