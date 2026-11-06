package com.pharmacy.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.warehouse.PurchaseRequestResponse;
import com.pharmacy.dto.warehouse.PurchaseRequestResponse.PurchaseRequestItemDto;
import com.pharmacy.entity.PurchaseRequest;
import com.pharmacy.repository.PurchaseRequestRepository;
import com.pharmacy.repository.PurchaseRequestDetailRepository;
import com.pharmacy.service.PurchaseRequestService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseRequestServiceImpl implements PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;

    @Override
    public Page<PurchaseRequestResponse> getPurchaseRequests(Pageable pageable, String search, Short status) {
        return purchaseRequestRepository.findAllWithFilters(search, status, pageable)
                .map(PurchaseRequestResponse::fromEntity);
    }

    @Override
    public Page<PurchaseRequestResponse> getPurchaseRequestsByStatuses(Pageable pageable, List<Short> statuses) {
        return purchaseRequestRepository.findAllByStatusIn(statuses, pageable)
                .map(PurchaseRequestResponse::fromEntity);
    }

    @Override
    public PurchaseRequestResponse getPurchaseRequestDetail(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Invalid request to view purchase request details");
        }

        PurchaseRequest pr = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase request not found with ID: " + id));

        PurchaseRequestResponse resp = PurchaseRequestResponse.fromEntity(pr);

        List<PurchaseRequestItemDto> items = PurchaseRequestItemDto.toItemDtoList(
                purchaseRequestDetailRepository.findByPurchaseRequestIdWithProduct(id));

        resp.setItems(items);
        resp.setItemCount(items.size());
        return resp;
    }
}
