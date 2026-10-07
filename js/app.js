/**
 * FORNO & BRASA — Pizzaria Artesanal
 * Script Principal: Interatividade, Cardápio, Carrinho e Integração WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ESTADO GLOBAL & CARRINHO (LocalStorage)
    // ==========================================
    const CART_STORAGE_KEY = 'forno_brasa_cart_v1';
    const FREE_SHIPPING_THRESHOLD = 60.00;
    const DEFAULT_DELIVERY_FEE = 7.90;
    const PIZZERIA_PHONE = '5519998866956'; // Número do WhatsApp comercial

    let cart = [];
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.error('Erro ao ler carrinho do localStorage:', e);
        cart = [];
    }

    const saveCart = () => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Erro ao salvar carrinho no localStorage:', e);
        }
    };

    // ==========================================
    // 2. ELEMENTOS DOM
    // ==========================================
    // Header & Mobile Nav
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    // Cart Drawer & Triggers
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartTriggerBtn = document.getElementById('cart-trigger');
    const cartFloatBtn = document.getElementById('cart-float-btn');
    const cartCountBadge = document.getElementById('cart-count');
    const cartFloatBadge = document.getElementById('cart-float-count');
    const cartDrawerCount = document.getElementById('cart-drawer-count');
    const cartEmptyState = document.getElementById('cart-empty-state');
    const cartEmptyCta = document.getElementById('cart-empty-cta');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartDeliveryFeeEl = document.getElementById('cart-delivery-fee');
    const cartTotalEl = document.getElementById('cart-total');
    const shippingBarText = document.getElementById('shipping-bar-text');
    const shippingBarFill = document.getElementById('shipping-bar-fill');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    // Form inputs de entrega
    const orderNameInput = document.getElementById('order-name');
    const orderAddressInput = document.getElementById('order-address');
    const orderNeighborhoodInput = document.getElementById('order-neighborhood');
    const orderPaymentSelect = document.getElementById('order-payment');
    const orderChangeGroup = document.getElementById('order-change-group');
    const orderChangeInput = document.getElementById('order-change');

    // Pizza Modal
    const pizzaModalBackdrop = document.getElementById('pizza-modal-backdrop');
    const pizzaModal = document.getElementById('pizza-modal');
    const pizzaModalClose = document.getElementById('pizza-modal-close');
    const modalPizzaImg = document.getElementById('modal-pizza-img');
    const modalPizzaBadge = document.getElementById('modal-pizza-badge');
    const modalPizzaName = document.getElementById('modal-pizza-name');
    const modalPizzaDesc = document.getElementById('modal-pizza-desc');
    const modalNotesInput = document.getElementById('modal-pizza-notes');
    const modalQtyMinus = document.getElementById('modal-qty-minus');
    const modalQtyPlus = document.getElementById('modal-qty-plus');
    const modalQtyValue = document.getElementById('modal-qty-value');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    const modalTotalPriceEl = document.getElementById('modal-total-price');
    const sizeRadioInputs = document.querySelectorAll('input[name="pizza-size"]');
    const crustRadioInputs = document.querySelectorAll('input[name="pizza-crust"]');

    // Filter Buttons
    const filterButtons = document.querySelectorAll('.menu__filter-btn');
    const pizzaCards = document.querySelectorAll('.pizza-card');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // Floating Actions (WhatsApp + Sacola)
    const floatingActions = document.getElementById('floating-actions');

    // ==========================================
    // 3. NAVEGAÇÃO & HEADER
    // ==========================================
    // Header Scroll Glassmorphism Effect
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // Mobile Hamburger Menu
    const toggleMobileMenu = () => {
        const isOpen = nav.classList.toggle('header__nav--mobile-open');
        burger.classList.toggle('header__burger--active');
        burger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        // Eleva o header acima do overlay quando o menu está aberto,
        // para que logo e burger (filhos do header) fiquem visíveis e clicáveis
        header.classList.toggle('header--nav-open', isOpen);
    };

    const closeMobileMenu = () => {
        nav.classList.remove('header__nav--mobile-open');
        burger.classList.remove('header__burger--active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        header.classList.remove('header--nav-open');
    };

    if (burger) {
        burger.addEventListener('click', toggleMobileMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Active Section Tracking on Scroll
    const sections = document.querySelectorAll('section[id]');
    const handleActiveNavOnScroll = () => {
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('nav__link--active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('nav__link--active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', handleActiveNavOnScroll, { passive: true });

    // ==========================================
    // 4. FILTROS DO CARDÁPIO
    // ==========================================
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('menu__filter-btn--active'));
            btn.classList.add('menu__filter-btn--active');

            const filterValue = btn.getAttribute('data-filter');

            pizzaCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 5. SCROLL REVEAL ANIMATION (IntersectionObserver)
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.section-header, .pizza-card, .about__inner, .testimonial-card, .cta__inner'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('reveal--visible'));
    }

    // ==========================================
    // 6. TOAST NOTIFICATIONS
    // ==========================================
    const showToast = (message, iconHtml = '<i class="fa-solid fa-pizza-slice"></i>', duration = 3200) => {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast__icon">${iconHtml}</span> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast--exit');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    };

    // ==========================================
    // 7. MODAL DE PERSONALIZAÇÃO DA PIZZA
    // ==========================================
    let currentModalPizza = null;
    let modalQuantity = 1;

    // Helper para formatar moeda
    const formatCurrency = (val) => {
        return `R$ ${val.toFixed(2).replace('.', ',')}`;
    };

    const updateOptionCardStyles = () => {
        document.querySelectorAll('.option-card').forEach(card => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                card.classList.add('option-card--selected');
            } else {
                card.classList.remove('option-card--selected');
            }
        });
    };

    const calculateModalPrice = () => {
        if (!currentModalPizza) return 0;

        const base = currentModalPizza.basePrice;
        let sizeModifier = 0;
        let crustPrice = 0;

        const checkedSize = document.querySelector('input[name="pizza-size"]:checked');
        if (checkedSize) {
            sizeModifier = parseFloat(checkedSize.getAttribute('data-price-modifier') || 0);
        }

        const checkedCrust = document.querySelector('input[name="pizza-crust"]:checked');
        if (checkedCrust) {
            crustPrice = parseFloat(checkedCrust.getAttribute('data-price') || 0);
        }

        const unitPrice = Math.max(0, base + sizeModifier + crustPrice);
        const totalPrice = unitPrice * modalQuantity;

        if (modalTotalPriceEl) {
            modalTotalPriceEl.textContent = formatCurrency(totalPrice);
        }

        return { unitPrice, totalPrice };
    };

    // Abrir modal com os dados da pizza selecionada
    const openPizzaModal = (pizzaData) => {
        currentModalPizza = pizzaData;
        modalQuantity = 1;
        if (modalQtyValue) modalQtyValue.textContent = '1';

        // Preenche campos
        if (modalPizzaImg) {
            modalPizzaImg.src = pizzaData.image;
            modalPizzaImg.alt = pizzaData.name;
        }
        if (modalPizzaBadge) {
            modalPizzaBadge.textContent = pizzaData.badge || 'Artesanal';
        }
        if (modalPizzaName) {
            modalPizzaName.textContent = pizzaData.name;
        }
        if (modalPizzaDesc) {
            modalPizzaDesc.textContent = pizzaData.desc;
        }
        if (modalNotesInput) {
            modalNotesInput.value = '';
        }

        // Reseta radios para valores padrão
        const defaultSize = document.querySelector('input[name="pizza-size"][value="Grande (8 fatias)"]');
        if (defaultSize) defaultSize.checked = true;

        const defaultCrust = document.querySelector('input[name="pizza-crust"][value="Tradicional (Sem Borda)"]');
        if (defaultCrust) defaultCrust.checked = true;

        updateOptionCardStyles();
        calculateModalPrice();

        // Abre o modal
        pizzaModalBackdrop.classList.add('modal-backdrop--visible');
        pizzaModal.classList.add('pizza-modal--open');
        document.body.style.overflow = 'hidden';
    };

    const closePizzaModal = () => {
        pizzaModalBackdrop.classList.remove('modal-backdrop--visible');
        pizzaModal.classList.remove('pizza-modal--open');
        document.body.style.overflow = '';
        currentModalPizza = null;
    };

    // Ouvintes dos botões "Pedir" dos cards
    document.querySelectorAll('.pizza-card__btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const btn = e.currentTarget;
            const pizzaData = {
                id: btn.getAttribute('data-pizza-id') || 'pizza',
                name: btn.getAttribute('data-pizza-name') || 'Pizza Artesanal',
                basePrice: parseFloat(btn.getAttribute('data-pizza-price')) || 42.90,
                desc: btn.getAttribute('data-pizza-desc') || '',
                image: btn.getAttribute('data-pizza-image') || '',
                badge: btn.getAttribute('data-pizza-badge') || 'Artesanal'
            };
            openPizzaModal(pizzaData);
        });
    });

    if (pizzaModalClose) {
        pizzaModalClose.addEventListener('click', closePizzaModal);
    }
    if (pizzaModalBackdrop) {
        pizzaModalBackdrop.addEventListener('click', closePizzaModal);
    }

    // Mudança de tamanho ou borda
    [...sizeRadioInputs, ...crustRadioInputs].forEach(input => {
        input.addEventListener('change', () => {
            updateOptionCardStyles();
            calculateModalPrice();
        });
    });

    // Quantidade no modal
    if (modalQtyMinus) {
        modalQtyMinus.addEventListener('click', () => {
            if (modalQuantity > 1) {
                modalQuantity--;
                modalQtyValue.textContent = modalQuantity;
                calculateModalPrice();
            }
        });
    }

    if (modalQtyPlus) {
        modalQtyPlus.addEventListener('click', () => {
            if (modalQuantity < 20) {
                modalQuantity++;
                modalQtyValue.textContent = modalQuantity;
                calculateModalPrice();
            }
        });
    }

    // Adicionar pizza ao carrinho a partir do modal
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (!currentModalPizza) return;

            const selectedSize = document.querySelector('input[name="pizza-size"]:checked')?.value || 'Grande (8 fatias)';
            const selectedCrust = document.querySelector('input[name="pizza-crust"]:checked')?.value || 'Tradicional (Sem Borda)';
            const notes = modalNotesInput ? modalNotesInput.value.trim() : '';
            const { unitPrice } = calculateModalPrice();

            // Identificador único para agrupar itens idênticos
            const configId = `${currentModalPizza.id}-${selectedSize}-${selectedCrust}-${notes}`;

            const existingIndex = cart.findIndex(item => item.configId === configId);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += modalQuantity;
            } else {
                cart.push({
                    configId,
                    id: currentModalPizza.id,
                    name: currentModalPizza.name,
                    image: currentModalPizza.image,
                    size: selectedSize,
                    crust: selectedCrust,
                    notes: notes,
                    unitPrice: unitPrice,
                    quantity: modalQuantity
                });
            }

            saveCart();
            renderCart();
            closePizzaModal();

            showToast(`"${currentModalPizza.name}" adicionada ao pedido!`, '<i class="fa-solid fa-circle-check"></i>');

            // Animação no badge do carrinho
            if (cartCountBadge) {
                cartCountBadge.classList.add('cart-trigger-btn__badge--bounce');
                setTimeout(() => cartCountBadge.classList.remove('cart-trigger-btn__badge--bounce'), 400);
            }
        });
    }

    // ==========================================
    // 8. CONTROLE DO CARRINHO (DRAWER)
    // ==========================================
    const openCart = () => {
        cartBackdrop.classList.add('cart-backdrop--visible');
        cartDrawer.classList.add('cart-drawer--open');
        document.body.style.overflow = 'hidden';
        // Esconde botões flutuantes para não atrapalhar a visualização do carrinho
        if (floatingActions) floatingActions.classList.add('floating-actions--hidden');
    };

    const closeCart = () => {
        cartBackdrop.classList.remove('cart-backdrop--visible');
        cartDrawer.classList.remove('cart-drawer--open');
        document.body.style.overflow = '';
        // Restaura os botões flutuantes
        if (floatingActions) floatingActions.classList.remove('floating-actions--hidden');
    };

    if (cartTriggerBtn) cartTriggerBtn.addEventListener('click', openCart);
    if (cartFloatBtn) cartFloatBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
    if (cartEmptyCta) {
        cartEmptyCta.addEventListener('click', () => {
            closeCart();
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Troca de forma de pagamento: Exibe campo de troco se dinheiro
    if (orderPaymentSelect) {
        orderPaymentSelect.addEventListener('change', () => {
            if (orderPaymentSelect.value === 'Dinheiro') {
                orderChangeGroup.style.display = 'flex';
            } else {
                orderChangeGroup.style.display = 'none';
            }
        });
    }

    // Renderizar o Carrinho
    const renderCart = () => {
        const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

        // Atualiza badges
        if (cartCountBadge) cartCountBadge.textContent = totalItemsCount;
        if (cartFloatBadge) cartFloatBadge.textContent = totalItemsCount;
        if (cartDrawerCount) cartDrawerCount.textContent = `(${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'itens'})`;

        // Se vazio
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartItemsList.style.display = 'none';
            cartFooter.style.display = 'none';

            // Barra de frete vazia
            if (shippingBarText) shippingBarText.textContent = `Adicione R$ ${FREE_SHIPPING_THRESHOLD.toFixed(2).replace('.', ',')} para ter frete grátis!`;
            if (shippingBarFill) shippingBarFill.style.width = '0%';
            return;
        }

        // Se possui itens
        cartEmptyState.style.display = 'none';
        cartItemsList.style.display = 'flex';
        cartFooter.style.display = 'flex';

        // Renderiza itens
        cartItemsList.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.unitPrice * item.quantity;
            subtotal += itemTotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item__img">
                <div class="cart-item__details">
                    <div class="cart-item__header">
                        <strong class="cart-item__name">${item.name}</strong>
                        <button class="cart-item__remove" data-index="${index}" aria-label="Remover item">&times;</button>
                    </div>
                    <div class="cart-item__meta">
                        <span>• ${item.size}</span>
                        <span>• ${item.crust}</span>
                        ${item.notes ? `<span>• Obs: <em>${item.notes}</em></span>` : ''}
                    </div>
                    <div class="cart-item__footer">
                        <span class="cart-item__price">${formatCurrency(itemTotal)}</span>
                        <div class="cart-item__qty">
                            <button type="button" class="cart-item__qty-btn btn-qty-minus" data-index="${index}">−</button>
                            <span class="cart-item__qty-num">${item.quantity}</span>
                            <button type="button" class="cart-item__qty-btn btn-qty-plus" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(li);
        });

        // Eventos nos botões da lista do carrinho
        cartItemsList.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const removedName = cart[idx]?.name || 'Item';
                cart.splice(idx, 1);
                saveCart();
                renderCart();
                showToast(`"${removedName}" removida do carrinho.`, '<i class="fa-solid fa-trash"></i>');
            });
        });

        cartItemsList.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
                renderCart();
            });
        });

        cartItemsList.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                if (cart[idx].quantity < 50) {
                    cart[idx].quantity++;
                    saveCart();
                    renderCart();
                }
            });
        });

        // Cálculos de Entrega & Totais
        const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
        const deliveryFee = isFreeShipping ? 0 : DEFAULT_DELIVERY_FEE;
        const total = subtotal + deliveryFee;

        // Atualiza textos do resumo
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);

        if (cartDeliveryFeeEl) {
            if (isFreeShipping) {
                cartDeliveryFeeEl.textContent = 'Grátis 🎉';
                cartDeliveryFeeEl.className = 'shipping-free';
            } else {
                cartDeliveryFeeEl.textContent = formatCurrency(deliveryFee);
                cartDeliveryFeeEl.className = 'shipping-fee-val';
            }
        }

        if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);

        // Barra de progresso de frete grátis
        const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        if (shippingBarFill) shippingBarFill.style.width = `${percentage}%`;

        if (shippingBarText) {
            if (isFreeShipping) {
                shippingBarText.textContent = 'Parabéns! Você ganhou Entrega Grátis! 🛵🎉';
            } else {
                const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
                shippingBarText.textContent = `Faltam ${formatCurrency(remaining)} para Frete Grátis!`;
            }
        }
    };

    // ==========================================
    // 9. CHECKOUT E ENVIO PARA O WHATSAPP
    // ==========================================
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Seu carrinho está vazio!', '<i class="fa-solid fa-triangle-exclamation"></i>');
                return;
            }

            const name = orderNameInput ? orderNameInput.value.trim() : '';
            const address = orderAddressInput ? orderAddressInput.value.trim() : '';
            const neighborhood = orderNeighborhoodInput ? orderNeighborhoodInput.value.trim() : '';
            const payment = orderPaymentSelect ? orderPaymentSelect.value : 'Pix';
            const changeFor = orderChangeInput ? orderChangeInput.value.trim() : '';

            // Validação simples
            if (!name) {
                showToast('Por favor, informe seu Nome para entrega.', '<i class="fa-solid fa-triangle-exclamation"></i>');
                orderNameInput?.focus();
                return;
            }

            if (!address) {
                showToast('Por favor, informe Rua e Número para entrega.', '<i class="fa-solid fa-triangle-exclamation"></i>');
                orderAddressInput?.focus();
                return;
            }

            // Monta o texto do pedido formatado
            let subtotal = 0;
            let itemsText = '';

            cart.forEach(item => {
                const itemTotal = item.unitPrice * item.quantity;
                subtotal += itemTotal;

                itemsText += `\n🍕 *${item.quantity}x ${item.name}*\n`;
                itemsText += `   • Tamanho: ${item.size}\n`;
                itemsText += `   • Borda: ${item.crust}\n`;
                if (item.notes) {
                    itemsText += `   • Observação: _${item.notes}_\n`;
                }
                itemsText += `   • Valor: ${formatCurrency(itemTotal)}\n`;
            });

            const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
            const deliveryFee = isFreeShipping ? 0 : DEFAULT_DELIVERY_FEE;
            const total = subtotal + deliveryFee;

            let paymentText = payment;
            if (payment === 'Dinheiro' && changeFor) {
                paymentText += ` (Troco para ${changeFor})`;
            }

            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;

            let message = `🔥 *NOVO PEDIDO — FORNO & BRASA* 🔥\n`;
            message += `-----------------------------------\n`;
            message += `👤 *Cliente:* ${name}\n`;
            message += `📍 *Endereço:* ${address}\n`;
            if (neighborhood) {
                message += `🏘️ *Bairro:* ${neighborhood}\n`;
            }
            message += `💳 *Pagamento:* ${paymentText}\n`;
            message += `-----------------------------------\n`;
            message += `📋 *ITENS DO PEDIDO:*${itemsText}`;
            message += `-----------------------------------\n`;
            message += `💰 *Subtotal:* ${formatCurrency(subtotal)}\n`;
            message += `🛵 *Entrega:* ${isFreeShipping ? 'Grátis 🎉' : formatCurrency(deliveryFee)}\n`;
            message += `🔥 *TOTAL A PAGAR: ${formatCurrency(total)}*\n`;
            message += `-----------------------------------\n`;
            message += `🕒 _Pedido enviado em ${dateString} às ${timeString}_\n`;
            message += `Obrigado pela preferência!`;

            // Abre o WhatsApp com a mensagem formatada
            const whatsappUrl = `https://wa.me/${PIZZERIA_PHONE}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

            showToast('Pedido preparado! Abrindo WhatsApp...', '<i class="fa-brands fa-whatsapp"></i>', 4000);
        });
    }

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (pizzaModal.classList.contains('pizza-modal--open')) {
                closePizzaModal();
            } else if (cartDrawer.classList.contains('cart-drawer--open')) {
                closeCart();
            } else if (nav.classList.contains('header__nav--mobile-open')) {
                closeMobileMenu();
            }
        }
    });

    // Inicializa o carrinho
    renderCart();
});
