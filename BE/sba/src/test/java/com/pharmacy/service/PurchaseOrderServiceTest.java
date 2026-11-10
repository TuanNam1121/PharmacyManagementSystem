package com.pharmacy.service;

import com.pharmacy.dto.procurement.PurchaseOrderActionRequest;
import com.pharmacy.dto.procurement.PurchaseOrderResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.Product;
import com.pharmacy.entity.PurchaseProposal;
import com.pharmacy.entity.PurchaseProposalDetail;
import com.pharmacy.entity.SupplierQuotation;
import com.pharmacy.entity.SupplierQuotationDetail;
import com.pharmacy.entity.enums.PurchaseProposalStatus;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.PurchaseProposalRepository;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.SupplierQuotationDetailRepository;
import com.pharmacy.service.impl.PurchaseOrderServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseProposalRepository purchaseProposalRepository;

    @Mock
    private SupplierQuotationDetailRepository quotationDetailRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PurchaseRequestRepository purchaseRequestRepository;

    @InjectMocks
    private PurchaseOrderServiceImpl purchaseOrderService;

    private Product buildProduct(Long id, String name, String unit, BigDecimal costPrice) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setUnit(unit);
        product.setCostPrice(costPrice);
        return product;
    }

    @Test
    @DisplayName("Tổng tiền PO khớp tổng báo giá khi đề xuất đã chốt nhà cung cấp")
    void getPurchaseOrderDetail_withQuotation_totalEqualsQuotationSubtotals() {
        SupplierQuotation quotation = SupplierQuotation.builder()
                .id(50009L)
                .code("QT1794039689967")
                .build();

        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(16L)
                .code("PP-20261107-0004")
                .status((short) 1)
                // Giá trị cũ đang lưu: tạm tính theo giá vốn danh mục (gây hiển thị sai)
                .totalAmount(BigDecimal.valueOf(14_500_000))
                .supplierQuotation(quotation)
                .build();

        SupplierQuotationDetail quotationDetail = SupplierQuotationDetail.builder()
                .id(1L)
                .product(buildProduct(40066L, "Enterogermina", "Hộp 20 ống", BigDecimal.valueOf(145_000)))
                .quantity(100)
                .unitPrice(BigDecimal.valueOf(431_214))
                .taxRate(BigDecimal.ZERO)
                .subtotal(BigDecimal.valueOf(43_121_400))
                .build();

        when(purchaseProposalRepository.findByIdWithDetails(16L)).thenReturn(Optional.of(proposal));
        when(quotationDetailRepository.findBySupplierQuotationIdWithProduct(50009L))
                .thenReturn(List.of(quotationDetail));

        PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderDetail(16L);

        assertNotNull(response);
        // Tổng phải theo báo giá, không phải giá vốn
        assertEquals(BigDecimal.valueOf(43_121_400), response.getTotalAmount());
        assertEquals(1, response.getItems().size());
        assertEquals(BigDecimal.valueOf(43_121_400), response.getItems().get(0).getSubtotal());
    }

    @Test
    @DisplayName("Tổng tiền PO dùng nhánh dự phòng khi đề xuất chưa có báo giá")
    void getPurchaseOrderDetail_withoutQuotation_usesProposalDetailsFallback() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(14L)
                .code("PP-20261107-0002")
                .status((short) 0)
                .totalAmount(BigDecimal.ZERO)
                .build();

        proposal.setDetails(List.of(PurchaseProposalDetail.builder()
                .id(7L)
                .product(buildProduct(40069L, "Omega-3 Fish Oil", "Hộp 10 vỉ x 10 viên", BigDecimal.valueOf(165_000)))
                .quantity(100)
                .build()));

        when(purchaseProposalRepository.findByIdWithDetails(14L)).thenReturn(Optional.of(proposal));

        PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderDetail(14L);

        assertNotNull(response);
        // Nhánh dự phòng: giá vốn hiện tại x số lượng, và tổng phải khớp dòng hàng
        assertEquals(BigDecimal.valueOf(16_500_000), response.getTotalAmount());
        assertEquals(BigDecimal.valueOf(16_500_000), response.getItems().get(0).getSubtotal());
    }

    @Test
    @DisplayName("Danh sách PO suy tổng tiền từ báo giá / giá vốn, không dùng total_amount lưu sẵn")
    void getPurchaseOrders_derivesTotalInsteadOfStoredSnapshot() {
        SupplierQuotation quotation = SupplierQuotation.builder()
                .id(50012L)
                .code("QT1794111111111")
                .build();

        PurchaseProposal withQuotation = PurchaseProposal.builder()
                .id(19L)
                .code("PP-20261108-0001")
                .status((short) 1)
                // Snapshot cũ đang sai, không được dùng để hiển thị
                .totalAmount(BigDecimal.valueOf(12_200_000))
                .supplierQuotation(quotation)
                .build();

        PurchaseProposal withoutQuotation = PurchaseProposal.builder()
                .id(14L)
                .code("PP-20261107-0002")
                .status((short) 0)
                .totalAmount(BigDecimal.ZERO)
                .build();

        PurchaseProposalDetail proposalDetail = PurchaseProposalDetail.builder()
                .id(7L)
                .purchaseProposal(withoutQuotation)
                .product(buildProduct(40069L, "Omega-3 Fish Oil", "Hộp 10 vỉ x 10 viên", BigDecimal.valueOf(165_000)))
                .quantity(100)
                .build();
        withoutQuotation.setDetails(List.of(proposalDetail));

        when(purchaseProposalRepository.findWithFilters(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(withQuotation, withoutQuotation)));
        when(quotationDetailRepository.sumSubtotalByQuotationIds(List.of(50012L)))
                .thenReturn(List.<Object[]>of(new Object[] { 50012L, new BigDecimal("30750.00") }));
        when(purchaseProposalRepository.findDetailsWithProductByProposalIds(List.of(14L)))
                .thenReturn(List.of(proposalDetail));

        Page<PurchaseOrderResponse> page = purchaseOrderService.getPurchaseOrders(
                PageRequest.of(0, 10), null, null);

        assertEquals(2, page.getContent().size());
        // Đơn có báo giá -> tổng theo báo giá thực tế (không phải 12.200.000)
        assertEquals(new BigDecimal("30750.00"), page.getContent().get(0).getTotalAmount());
        // Đơn chưa có báo giá -> tạm tính theo giá vốn
        assertEquals(BigDecimal.valueOf(16_500_000), page.getContent().get(1).getTotalAmount());
    }

    @Test
    @DisplayName("Phê duyệt PO ở trạng thái nháp chuyển sang Đã phê duyệt (3)")
    void approvePurchaseOrder_draft_setsStatusToApproved() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(20L)
                .code("PP-20261110-0001")
                .status(PurchaseProposalStatus.DRAFT.getCode())
                .totalAmount(BigDecimal.ZERO)
                .build();

        Account gm = new Account();
        gm.setUsername("gm");

        when(purchaseProposalRepository.findByIdWithDetails(20L)).thenReturn(Optional.of(proposal));
        when(accountRepository.findByUsername("gm")).thenReturn(Optional.of(gm));

        PurchaseOrderActionRequest request = PurchaseOrderActionRequest.builder()
                .actionByUsername("gm")
                .reason("Đồng ý phát hành PO")
                .build();

        PurchaseOrderResponse response = purchaseOrderService.approvePurchaseOrder(20L, request, "127.0.0.1");

        // Regression: approve phải đặt APPROVED (3), không phải QUOTATION_SELECTED (2)
        assertEquals(PurchaseProposalStatus.APPROVED.getCode(), proposal.getStatus());
        assertEquals(PurchaseProposalStatus.APPROVED.getCode(), response.getStatus());
        verify(purchaseProposalRepository).save(proposal);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Phê duyệt PO đang chờ phê duyệt (2) chuyển sang Đã phê duyệt (3)")
    void approvePurchaseOrder_quotationSelected_setsStatusToApproved() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(22L)
                .code("PP-20261110-0003")
                .status(PurchaseProposalStatus.QUOTATION_SELECTED.getCode())
                .totalAmount(BigDecimal.ZERO)
                .build();

        Account gm = new Account();
        gm.setUsername("gm");

        when(purchaseProposalRepository.findByIdWithDetails(22L)).thenReturn(Optional.of(proposal));
        when(accountRepository.findByUsername("gm")).thenReturn(Optional.of(gm));

        PurchaseOrderActionRequest request = PurchaseOrderActionRequest.builder()
                .actionByUsername("gm")
                .reason("")
                .build();

        PurchaseOrderResponse response = purchaseOrderService.approvePurchaseOrder(22L, request, "127.0.0.1");

        assertEquals(PurchaseProposalStatus.APPROVED.getCode(), proposal.getStatus());
        assertEquals(PurchaseProposalStatus.APPROVED.getCode(), response.getStatus());
    }

    @Test
    @DisplayName("Từ chối PO ở trạng thái nháp chuyển sang Đã từ chối (4) và lưu lý do")
    void rejectPurchaseOrder_draft_setsStatusToRejected() {
        PurchaseProposal proposal = PurchaseProposal.builder()
                .id(21L)
                .code("PP-20261110-0002")
                .status(PurchaseProposalStatus.DRAFT.getCode())
                .totalAmount(BigDecimal.ZERO)
                .build();

        Account gm = new Account();
        gm.setUsername("gm");

        when(purchaseProposalRepository.findByIdWithDetails(21L)).thenReturn(Optional.of(proposal));
        when(accountRepository.findByUsername("gm")).thenReturn(Optional.of(gm));

        PurchaseOrderActionRequest request = PurchaseOrderActionRequest.builder()
                .actionByUsername("gm")
                .reason("Giá báo vượt ngân sách")
                .build();

        PurchaseOrderResponse response = purchaseOrderService.rejectPurchaseOrder(21L, request, "127.0.0.1");

        assertEquals(PurchaseProposalStatus.REJECTED.getCode(), proposal.getStatus());
        assertEquals("Giá báo vượt ngân sách", proposal.getRejectReason());
        assertEquals(PurchaseProposalStatus.REJECTED.getCode(), response.getStatus());
        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
