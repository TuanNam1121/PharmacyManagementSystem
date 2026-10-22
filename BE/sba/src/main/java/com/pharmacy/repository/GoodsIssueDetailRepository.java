package com.pharmacy.repository;

import com.pharmacy.entity.GoodsIssueDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GoodsIssueDetailRepository extends JpaRepository<GoodsIssueDetail, Long> {

    @Query("""
            SELECT d FROM GoodsIssueDetail d
            JOIN FETCH d.product p
            JOIN FETCH d.batch b
            WHERE d.goodsIssue.id = :goodsIssueId
            """)
    List<GoodsIssueDetail> findByGoodsIssueIdWithProductAndBatch(@Param("goodsIssueId") Long goodsIssueId);
}
