package com.pharmacy.service;

import com.pharmacy.dto.purchaseproposal.CreatePurchaseProposalRequest;
import com.pharmacy.dto.purchaseproposal.PurchaseProposalResponse;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.entity.enums.RfqStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseProposalRequestRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.RfqRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    private SupplierQuotationRepository supplierQuotationRepository;

    @Mock
    private SupplierQuotationDetailRepository supplierQuotationDetailRepository;

    @Mock
    private RfqRepository rfqRepository;

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
        when(rfqRepository.findByPurchaseProposalId(16L)).thenReturn(List.of(rfq));
        when(purchaseProposalRepository.save(any(PurchaseProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseProposalResponse response = purchaseProposalService.selectSupplier(16L, 1L);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(43_121_400), proposal.getTotalAmount());
        assertEquals(PurchaseProposalStatus.QUOTATION_SELECTED.getCode(), proposal.getStatus());
        assertEquals(RfqStatus.SELECTED, rfq.getStatus());
        verify(purchaseProposalRepository).save(proposal);
    }

    @Test
    @DisplayName("Chốt nhà cung cấp: RFQ được chọn -> Đã chọn, các RFQ còn hiệu lực -> Từ chối, RFQ hết hạn/đã xử lý giữ nguyên")
    void selectSupplier_rejectsCompetingRfqsButKeepsExpiredAndResolved() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(21L)
                .code("PP-20261109-0021")
                .status(PurchaseProposalStatus.RFQ_SENT.getCode())
                .totalAmount(BigDecimal.ZERO)
                .build();

        PurchaseProposal sameProposal = PurchaseProposal.builder().id(21L).build();

        Rfq chosen = Rfq.builder().id(101L).purchaseProposal(sameProposal)
                .status(RfqStatus.RESPONDED).build();
        Rfq responded = Rfq.builder().id(102L).purchaseProposal(sameProposal)
                .status(RfqStatus.RESPONDED).build();
        Rfq sentActive = Rfq.builder().id(103L).purchaseProposal(sameProposal)
                .status(RfqStatus.SENT)
                .expiredAt(java.time.LocalDateTime.now().plusDays(2))
                .build();
        Rfq sentExpired = Rfq.builder().id(104L).purchaseProposal(sameProposal)
                .status(RfqStatus.SENT)
                .expiredAt(java.time.LocalDateTime.now().minusDays(1))
                .build();
        Rfq expired = Rfq.builder().id(105L).purchaseProposal(sameProposal)
                .status(RfqStatus.EXPIRED).build();
        Rfq alreadyRejected = Rfq.builder().id(106L).purchaseProposal(sameProposal)
                .status(RfqStatus.REJECTED).build();

        SupplierQuotation quotation = SupplierQuotation.builder()
                .id(60001L)
                .code("QT1794039699999")
                .rfq(chosen)
                .build();

        when(purchaseProposalRepository.findById(21L)).thenReturn(Optional.of(proposal));
        when(supplierQuotationRepository.findByRfqId(101L)).thenReturn(Optional.of(quotation));
        when(supplierQuotationDetailRepository.findBySupplierQuotationId(60001L))
                .thenReturn(List.of(SupplierQuotationDetail.builder()
                        .id(1L).subtotal(BigDecimal.valueOf(1_000_000)).build()));
        when(rfqRepository.findByPurchaseProposalId(21L)).thenReturn(List.of(
                chosen, responded, sentActive, sentExpired, expired, alreadyRejected));
        when(purchaseProposalRepository.save(any(PurchaseProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        purchaseProposalService.selectSupplier(21L, 101L);

        assertEquals(RfqStatus.SELECTED, chosen.getStatus());
        assertEquals(RfqStatus.REJECTED, responded.getStatus());
        assertEquals(RfqStatus.REJECTED, sentActive.getStatus());
        // RFQ đang ở trạng thái gửi nhưng đã quá hạn phản hồi được giữ nguyên, không bị từ chối
        assertEquals(RfqStatus.SENT, sentExpired.getStatus());
        // RFQ đã quá hạn phản hồi được giữ nguyên (coi như hết hạn), không bị từ chối
        assertEquals(RfqStatus.EXPIRED, expired.getStatus());
        assertEquals(RfqStatus.REJECTED, alreadyRejected.getStatus());
        assertEquals(PurchaseProposalStatus.QUOTATION_SELECTED.getCode(), proposal.getStatus());
    }

    @Test
    @DisplayName("Chi tiết đề xuất hiển thị nhà cung cấp đã chọn kèm đơn giá và thành tiền từng mặt hàng")
    void getPurchaseProposalDetail_includesSelectedSupplierAndPricing() {
        Product product = new Product();
        product.setId(10L);
        product.setBarcode("SP001");
        product.setName("Paracetamol 500mg");
        product.setUnit("Hộp");

        Supplier supplier = Supplier.builder().id(7L).name("Dược Hậu Giang").build();

        SupplierQuotation quotation = SupplierQuotation.builder()
                .id(50009L)
                .code("QT1794039689967")
                .rfq(Rfq.builder().id(1L).build())
                .supplier(supplier)
                .build();

        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(16L)
                .code("PP-20261107-0004")
                .status(PurchaseProposalStatus.QUOTATION_SELECTED.getCode())
                .supplierQuotation(quotation)
                .totalAmount(BigDecimal.valueOf(1_100_000))
                .details(List.of(PurchaseProposalDetail.builder()
                        .id(1L)
                        .product(product)
                        .quantity(10)
                        .build()))
                .build();

        SupplierQuotationDetail quotedDetail = SupplierQuotationDetail.builder()
                .id(1L)
                .product(product)
                .quantity(10)
                .unitPrice(BigDecimal.valueOf(100_000))
                .taxRate(BigDecimal.valueOf(10))
                .subtotal(BigDecimal.valueOf(1_100_000))
                .build();

        when(purchaseProposalRepository.findByIdWithRelations(16L)).thenReturn(Optional.of(proposal));
        when(supplierQuotationDetailRepository.findBySupplierQuotationIdWithProduct(50009L))
                .thenReturn(List.of(quotedDetail));

        PurchaseProposalResponse response = purchaseProposalService.getPurchaseProposalDetail(16L);

        assertNotNull(response);
        assertEquals("Dược Hậu Giang", response.getSupplierName());
        assertEquals("QT1794039689967", response.getSupplierQuotationCode());
        assertEquals(50009L, response.getSupplierQuotationId());
        assertEquals(BigDecimal.valueOf(1_100_000), response.getTotalAmount());
        assertEquals(1, response.getItems().size());
        assertEquals(BigDecimal.valueOf(100_000), response.getItems().get(0).getUnitPrice());
        assertEquals(BigDecimal.valueOf(10), response.getItems().get(0).getTaxRate());
        assertEquals(BigDecimal.valueOf(1_100_000), response.getItems().get(0).getSubtotal());
    }

    @Test
    @DisplayName("Chi tiết đề xuất chưa chọn nhà cung cấp không trả về đơn giá mặt hàng")
    void getPurchaseProposalDetail_withoutQuotationKeepsItemsUnpriced() {
        Product product = new Product();
        product.setId(10L);
        product.setBarcode("SP001");
        product.setName("Paracetamol 500mg");
        product.setUnit("Hộp");

        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(20L)
                .code("PP-20261109-0020")
                .status(PurchaseProposalStatus.DRAFT.getCode())
                .totalAmount(BigDecimal.valueOf(500_000))
                .details(List.of(PurchaseProposalDetail.builder()
                        .id(1L)
                        .product(product)
                        .quantity(10)
                        .build()))
                .build();

        when(purchaseProposalRepository.findByIdWithRelations(20L)).thenReturn(Optional.of(proposal));

        PurchaseProposalResponse response = purchaseProposalService.getPurchaseProposalDetail(20L);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(500_000), response.getTotalAmount());
        assertEquals(1, response.getItems().size());
        assertEquals(null, response.getItems().get(0).getUnitPrice());
        assertEquals(null, response.getItems().get(0).getSubtotal());
    }

    @Test
    @DisplayName("Tạo đề xuất mua hàng không có yêu cầu kho sẽ báo lỗi")
    void createPurchaseProposal_withoutPurchaseRequests_throws() {
        CreatePurchaseProposalRequest request = CreatePurchaseProposalRequest.builder()
                .purchaseRequestIds(List.of())
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> purchaseProposalService.createPurchaseProposal(request));

        assertEquals("Vui lòng chọn ít nhất một yêu cầu mua hàng từ kho.", ex.getMessage());
    }
}
