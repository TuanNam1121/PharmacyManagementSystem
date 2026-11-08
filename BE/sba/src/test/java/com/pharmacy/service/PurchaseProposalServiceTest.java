package com.pharmacy.service;

import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.ProductRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseProposalRequestRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.repository.SupplierQuotationRepository;
import com.pharmacy.service.impl.PurchaseProposalServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurchaseProposalServiceTest {

    @Mock
    private PurchaseProposalRepository purchaseProposalRepository;

    @Mock
    private PurchaseProposalRequestRepository purchaseProposalRequestRepository;

    @Mock
    private PurchaseRequestRepository purchaseRequestRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierQuotationRepository supplierQuotationRepository;

    @Mock
    private SupplierQuotationDetailRepository supplierQuotationDetailRepository;

    @InjectMocks
    private PurchaseProposalServiceImpl purchaseProposalService;

    @Test
    @DisplayName("Chốt nhà cung cấp sẽ tính lại tổng tiền đề xuất theo báo giá thực tế")
    void selectSupplier_recalculatesTotalAmountFromQuotation() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(16L)
                .code("PP-20261107-0004")
                .status(PurchaseProposalStatus.DRAFT.getCode())
                // Tạm tính theo giá vốn danh mục lúc tạo đề xuất
                .totalAmount(BigDecimal.valueOf(14_500_000))
                .build();

        Rfq rfq = Rfq.builder()
                .id(1L)
                .purchaseProposal(PurchaseProposal.builder().id(16L).build())
                .build();

        SupplierQuotation quotation = SupplierQuotation.builder()
                .id(50009L)
                .code("QT1794039689967")
                .rfq(rfq)
                .build();

        SupplierQuotationDetail quotationDetail = SupplierQuotationDetail.builder()
                .id(1L)
                .subtotal(BigDecimal.valueOf(43_121_400))
                .build();

        when(purchaseProposalRepository.findById(16L)).thenReturn(Optional.of(proposal));
        when(supplierQuotationRepository.findByRfqId(1L)).thenReturn(Optional.of(quotation));
        when(supplierQuotationDetailRepository.findBySupplierQuotationId(50009L))
                .thenReturn(List.of(quotationDetail));
        when(purchaseProposalRepository.save(any(PurchaseProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseProposalResponse response = purchaseProposalService.selectSupplier(16L, 1L);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(43_121_400), proposal.getTotalAmount());
        assertEquals(PurchaseProposalStatus.PENDING_APPROVAL.getCode(), proposal.getStatus());
        verify(purchaseProposalRepository).save(proposal);
    }
}
