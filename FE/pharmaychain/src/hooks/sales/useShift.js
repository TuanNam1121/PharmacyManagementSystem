import { useState, useEffect, useCallback } from 'react';
import { getCurrentShift, getCurrentShiftSummary, openShift, closeShift } from '../../api/shiftApi';

export function useShift() {
    const [currentShift, setCurrentShift] = useState(null);
    const [shiftSummary, setShiftSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [openModalVisible, setOpenModalVisible] = useState(false);
    const [closeModalVisible, setCloseModalVisible] = useState(false);

    const refreshShift = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const shift = await getCurrentShift();
            setCurrentShift(shift || null);
            return shift;
        } catch (err) {
            console.error('Error fetching current shift:', err);
            setError(err.message || 'Không thể tải thông tin ca làm việc');
            setCurrentShift(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        try {
            const summary = await getCurrentShiftSummary();
            setShiftSummary(summary);
            return summary;
        } catch (err) {
            console.error('Error fetching shift summary:', err);
            return null;
        }
    }, []);

    const handleOpenShift = async ({ storeId, openingCash, note }) => {
        setSubmitting(true);
        setError(null);
        try {
            const newShift = await openShift({
                storeId: Number(storeId),
                openingCash: Number(openingCash) || 0,
                note: note || '',
            });
            setCurrentShift(newShift);
            setOpenModalVisible(false);
            return newShift;
        } catch (err) {
            setError(err.message || 'Không thể mở ca làm việc');
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseShift = async ({ shiftId, closingCash, closingCashActual, note }) => {
        setSubmitting(true);
        setError(null);
        try {
            const resolvedShiftId = shiftId || currentShift?.shiftId || currentShift?.id || shiftSummary?.shiftId || shiftSummary?.id;
            const cashVal = Number(closingCashActual ?? closingCash) || 0;
            const closedShift = await closeShift({
                shiftId: resolvedShiftId,
                closingCashActual: cashVal,
                closingCash: cashVal,
                note: note || '',
            });
            setCurrentShift(null);
            setCloseModalVisible(false);
            return closedShift;
        } catch (err) {
            setError(err.message || 'Không thể chốt ca làm việc');
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        refreshShift();
    }, [refreshShift]);

    return {
        currentShift,
        shiftSummary,
        loading,
        submitting,
        error,
        setError,
        openModalVisible,
        setOpenModalVisible,
        closeModalVisible,
        setCloseModalVisible,
        refreshShift,
        fetchSummary,
        handleOpenShift,
        handleCloseShift,
    };
}

export default useShift;

