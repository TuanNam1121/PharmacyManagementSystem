import { useState, useMemo, useCallback } from 'react';

export function usePosCart() {
    const [cartItems, setCartItems] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [prescriptionCode, setPrescriptionCode] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [heldOrders, setHeldOrders] = useState([]);

    // Allergy warnings
    const [allergyAlert, setAllergyAlert] = useState(null);

    // Modals & Drawers
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [lastCompletedInvoice, setLastCompletedInvoice] = useState(null);

    // Check allergy
    const checkCustomerAllergy = useCallback((productIngredient, targetCustomer) => {
        if (!targetCustomer?.allergies || !productIngredient) return null;
        const allergies = targetCustomer.allergies.toLowerCase().split(/[,;]+/);
        const ingredient = productIngredient.toLowerCase();
        for (const a of allergies) {
            const trimmed = a.trim();
            if (trimmed && (ingredient.includes(trimmed) || trimmed.includes(ingredient))) {
                return trimmed;
            }
        }
        return null;
    }, []);

    // Add item to cart (with FEFO batch selection)
    const addToCart = useCallback((item) => {
        // item: { productId, productName, batchId, batchNumber, expiryDate, unit, sellingPrice, quantity: 1, availableQuantity, activeIngredient }
        setCartItems((prev) => {
            const existingIndex = prev.findIndex(
                (p) => p.productId === item.productId && p.batchId === item.batchId
            );

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                const newQty = existing.quantity + 1;
                if (existing.availableQuantity && newQty > existing.availableQuantity) {
                    alert(`Không thể thêm vượt quá tồn kho khả dụng (${existing.availableQuantity} ${existing.unit || 'đơn vị'})!`);
                    return prev;
                }
                const updated = [...prev];
                updated[existingIndex] = {
                    ...existing,
                    quantity: newQty,
                    lineTotal: newQty * existing.unitPrice,
                };
                return updated;
            } else {
                const price = Number(item.sellingPrice) || 0;
                const newItem = {
                    productId: item.productId,
                    productName: item.productName || item.name,
                    productCode: item.productCode || item.barcode || `PRD-${item.productId}`,
                    batchId: item.batchId,
                    batchNumber: item.batchNumber || 'N/A',
                    expiryDate: item.expiryDate || null,
                    unit: item.unit || 'Hộp',
                    unitPrice: price,
                    quantity: 1,
                    availableQuantity: item.availableQuantity || item.quantity || 999,
                    activeIngredient: item.activeIngredient || '',
                    lineTotal: price,
                    dosageInstruction: '',
                };

                // Check allergy
                if (customer && newItem.activeIngredient) {
                    const matchedAllergy = checkCustomerAllergy(newItem.activeIngredient, customer);
                    if (matchedAllergy) {
                        setAllergyAlert({
                            customerName: customer.fullName,
                            allergy: matchedAllergy,
                            productName: newItem.productName,
                        });
                    }
                }

                return [newItem, ...prev];
            }
        });
    }, [customer, checkCustomerAllergy]);

    // Update quantity
    const updateQuantity = useCallback((productId, batchId, quantity) => {
        const qty = Math.max(1, Number(quantity) || 1);
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.productId === productId && item.batchId === batchId) {
                    if (item.availableQuantity && qty > item.availableQuantity) {
                        alert(`Số lượng không được vượt quá tồn kho khả dụng (${item.availableQuantity})!`);
                        return item;
                    }
                    return {
                        ...item,
                        quantity: qty,
                        lineTotal: qty * item.unitPrice,
                    };
                }
                return item;
            })
        );
    }, []);

    // Update dosage instruction
    const updateDosage = useCallback((productId, batchId, dosageInstruction) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.productId === productId && item.batchId === batchId) {
                    return { ...item, dosageInstruction };
                }
                return item;
            })
        );
    }, []);

    // Remove item
    const removeFromCart = useCallback((productId, batchId) => {
        setCartItems((prev) =>
            prev.filter((item) => !(item.productId === productId && item.batchId === batchId))
        );
    }, []);

    // Clear cart
    const clearCart = useCallback(() => {
        setCartItems([]);
        setCustomer(null);
        setDiscountAmount(0);
        setPrescriptionCode('');
        setOrderNote('');
        setAllergyAlert(null);
    }, []);

    // Hold order (F8)
    const holdCurrentOrder = useCallback(() => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng đang trống, không thể lưu tạm!');
            return;
        }
        const orderSnap = {
            id: Date.now(),
            savedAt: new Date(),
            cartItems,
            customer,
            discountAmount,
            prescriptionCode,
            orderNote,
        };
        setHeldOrders((prev) => [orderSnap, ...prev]);
        clearCart();
    }, [cartItems, customer, discountAmount, prescriptionCode, orderNote, clearCart]);

    // Resume held order
    const resumeHeldOrder = useCallback((heldId) => {
        const order = heldOrders.find((o) => o.id === heldId);
        if (!order) return;
        setCartItems(order.cartItems);
        setCustomer(order.customer);
        setDiscountAmount(order.discountAmount);
        setPrescriptionCode(order.prescriptionCode);
        setOrderNote(order.orderNote);
        setHeldOrders((prev) => prev.filter((o) => o.id !== heldId));
    }, [heldOrders]);

    // Set selected customer with allergy check
    const selectCustomer = useCallback((cust) => {
        setCustomer(cust);
        if (cust) {
            // Check allergy for existing cart items
            for (const item of cartItems) {
                if (item.activeIngredient) {
                    const matched = checkCustomerAllergy(item.activeIngredient, cust);
                    if (matched) {
                        setAllergyAlert({
                            customerName: cust.fullName,
                            allergy: matched,
                            productName: item.productName,
                        });
                        break;
                    }
                }
            }
        } else {
            setAllergyAlert(null);
        }
    }, [cartItems, checkCustomerAllergy]);

    // Financial calculations
    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
    }, [cartItems]);

    const netAmount = useMemo(() => {
        const net = subtotal - (Number(discountAmount) || 0);
        return Math.max(0, net);
    }, [subtotal, discountAmount]);

    const estimatedPoints = useMemo(() => {
        return Math.floor(netAmount / 100000);
    }, [netAmount]);

    return {
        cartItems,
        customer,
        discountAmount,
        setDiscountAmount,
        prescriptionCode,
        setPrescriptionCode,
        orderNote,
        setOrderNote,
        heldOrders,
        allergyAlert,
        setAllergyAlert,
        paymentModalOpen,
        setPaymentModalOpen,
        customerModalOpen,
        setCustomerModalOpen,
        historyDrawerOpen,
        setHistoryDrawerOpen,
        returnModalOpen,
        setReturnModalOpen,
        lastCompletedInvoice,
        setLastCompletedInvoice,
        addToCart,
        updateQuantity,
        updateDosage,
        removeFromCart,
        clearCart,
        holdCurrentOrder,
        resumeHeldOrder,
        selectCustomer,
        subtotal,
        netAmount,
        estimatedPoints,
    };
}

export default usePosCart;
