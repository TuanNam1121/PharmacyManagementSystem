package com.pharmacy.dto.rfq;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.entity.enums.SupplierStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RfqResponseTest {

    private Rfq buildRfq(RfqStatus rfqStatus, Short proposalStatus, SupplierStatus supplierStatus) {
        Supplier supplier = Supplier.builder().id(1L).status(supplierStatus).build();
        PurchaseProposal proposal = PurchaseProposal.builder().id(5L).status(proposalStatus).build();
        return Rfq.builder()
                .id(100L)
                .status(rfqStatus)
                .supplier(supplier)
                .purchaseProposal(proposal)
                .build();
    }

    @Test
    @DisplayName("RFQ đã phản hồi, NCC hoạt động, đề xuất đang chào giá => có thể chọn NCC")
    void supplierSelectable_trueWhenRespondedAndProposalInSourcing() {
        Rfq rfq = buildRfq(RfqStatus.RESPONDED,
                PurchaseProposalStatus.RFQ_SENT.getCode(), SupplierStatus.ACTIVE);

        assertTrue(RfqResponse.fromEntity(rfq).supplierSelectable());
    }

    @Test
    @DisplayName("Đề xuất đã chốt/duyệt NCC => KHÔNG thể chọn lại")
    void supplierSelectable_falseWhenProposalAlreadyDecided() {
        Rfq rfq = buildRfq(RfqStatus.RESPONDED,
                PurchaseProposalStatus.APPROVED.getCode(), SupplierStatus.ACTIVE);

        assertFalse(RfqResponse.fromEntity(rfq).supplierSelectable());
    }

    @Test
    @DisplayName("RFQ chưa phản hồi hoặc NCC ngừng hoạt động => KHÔNG thể chọn NCC")
    void supplierSelectable_falseWhenNotRespondedOrSupplierInactive() {
        Rfq notResponded = buildRfq(RfqStatus.SENT,
                PurchaseProposalStatus.RFQ_SENT.getCode(), SupplierStatus.ACTIVE);
        Rfq inactiveSupplier = buildRfq(RfqStatus.RESPONDED,
                PurchaseProposalStatus.RFQ_SENT.getCode(), SupplierStatus.INACTIVE);

        assertFalse(RfqResponse.fromEntity(notResponded).supplierSelectable());
        assertFalse(RfqResponse.fromEntity(inactiveSupplier).supplierSelectable());
    }
}
