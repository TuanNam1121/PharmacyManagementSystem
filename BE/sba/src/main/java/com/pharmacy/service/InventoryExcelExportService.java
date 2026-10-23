package com.pharmacy.service;

import com.pharmacy.dto.report.InventoryReportResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InventoryExcelExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public byte[] exportToExcel(InventoryReportResponse report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            DataFormat dataFormat = workbook.createDataFormat();

            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle subTitleStyle = createSubTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle cardLabelStyle = createCardLabelStyle(workbook);
            CellStyle cardCostStyle = createCardValueStyle(workbook, IndexedColors.DARK_BLUE.getIndex());
            CellStyle cardProfitStyle = createCardValueStyle(workbook, IndexedColors.GREEN.getIndex());

            CellStyle currencyStyle = createBorderedStyle(workbook);
            currencyStyle.setDataFormat(dataFormat.getFormat("#,##0 \"₫\""));
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);

            CellStyle currencyBoldStyle = createBorderedStyle(workbook);
            currencyBoldStyle.setDataFormat(dataFormat.getFormat("#,##0 \"₫\""));
            currencyBoldStyle.setAlignment(HorizontalAlignment.RIGHT);
            Font bFont = workbook.createFont();
            bFont.setBold(true);
            currencyBoldStyle.setFont(bFont);

            CellStyle percentStyle = createBorderedStyle(workbook);
            percentStyle.setDataFormat(dataFormat.getFormat("0.0\"%\""));
            percentStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle textStyle = createBorderedStyle(workbook);
            textStyle.setAlignment(HorizontalAlignment.LEFT);

            CellStyle numberStyle = createBorderedStyle(workbook);
            numberStyle.setDataFormat(dataFormat.getFormat("#,##0"));
            numberStyle.setAlignment(HorizontalAlignment.RIGHT);

            CellStyle dateStyle = createBorderedStyle(workbook);
            dateStyle.setAlignment(HorizontalAlignment.CENTER);

            // Sheet 1: Dashboard Valuation & Store Comparison
            buildValuationDashboardSheet(workbook, report, titleStyle, subTitleStyle, headerStyle,
                    cardLabelStyle, cardCostStyle, cardProfitStyle, currencyStyle, currencyBoldStyle, percentStyle,
                    textStyle, numberStyle);

            // Sheet 2: Stock Levels & Valuation by Batch
            buildStockItemsSheet(workbook, report, titleStyle, headerStyle, textStyle, numberStyle, currencyStyle,
                    dateStyle);

            // Sheet 3: Stock Movement History
            buildStockMovementsSheet(workbook, report, titleStyle, headerStyle, textStyle, numberStyle, dateStyle);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Inventory Excel report: " + e.getMessage(), e);
        }
    }

    private void buildValuationDashboardSheet(XSSFWorkbook workbook, InventoryReportResponse report,
            CellStyle titleStyle, CellStyle subTitleStyle, CellStyle headerStyle,
            CellStyle cardLabelStyle, CellStyle cardCostStyle, CellStyle cardProfitStyle,
            CellStyle currencyStyle, CellStyle currencyBoldStyle, CellStyle percentStyle,
            CellStyle textStyle, CellStyle numberStyle) {

        XSSFSheet sheet = workbook.createSheet("Executive Valuation");
        sheet.setDisplayGridlines(true);

        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(1);
        titleCell.setCellValue("EXECUTIVE INVENTORY VALUATION & STOCK STATUS REPORT");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 8));

        Row subRow = sheet.createRow(2);
        Cell subCell = subRow.createCell(1);
        String subText = String.format("Scope: %s   |   Status Filter: %s   |   Generated: %s by %s",
                report.getStoreName(), report.getFilterStatus(),
                report.getGeneratedAt() != null ? report.getGeneratedAt().format(TIME_FMT) : "N/A",
                report.getGeneratedBy());
        subCell.setCellValue(subText);
        subCell.setCellStyle(subTitleStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 1, 8));

        // 4 KPI Cards
        createKpiCard(sheet, 4, 1, 2, "INVENTORY VALUATION (COST)", formatCurrency(report.getTotalValuationCost()),
                cardLabelStyle, cardCostStyle);
        createKpiCard(sheet, 4, 3, 4, "POTENTIAL RETAIL VALUE", formatCurrency(report.getTotalValuationRetail()),
                cardLabelStyle, cardCostStyle);
        createKpiCard(sheet, 4, 5, 6, "POTENTIAL GROSS PROFIT", formatCurrency(report.getPotentialProfit()),
                cardLabelStyle, cardProfitStyle);
        createKpiCard(sheet, 4, 7, 8, "TOTAL STOCK UNITS", String.format("%,d Units", report.getTotalUnitsInStock()),
                cardLabelStyle, cardCostStyle);

        // Store comparison section
        Row secRow = sheet.createRow(8);
        Cell secCell = secRow.createCell(1);
        secCell.setCellValue("INVENTORY VALUATION BY STORE BRANCH");
        Font secFont = workbook.createFont();
        secFont.setBold(true);
        secFont.setFontHeightInPoints((short) 12);
        CellStyle secStyle = workbook.createCellStyle();
        secStyle.setFont(secFont);
        secCell.setCellStyle(secStyle);

        Row tblHeader = sheet.createRow(9);
        String[] headers = { "Store Code", "Store Branch Name", "Active SKUs", "Total Units", "Valuation at Cost (₫)",
                "Retail Value (₫)", "Potential Profit (₫)", "Margin (%)" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i + 1);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<InventoryReportResponse.StoreValuationDto> stores = report.getStoreBreakdown();
        int currentRow = 10;
        int firstStoreRow = 10;

        if (stores != null && !stores.isEmpty()) {
            for (InventoryReportResponse.StoreValuationDto s : stores) {
                Row r = sheet.createRow(currentRow);
                Cell c1 = r.createCell(1);
                c1.setCellValue(s.getStoreCode());
                c1.setCellStyle(textStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(s.getStoreName());
                c2.setCellStyle(textStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(s.getTotalSkus());
                c3.setCellStyle(numberStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(s.getTotalUnits());
                c4.setCellStyle(numberStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(s.getValuationCost().doubleValue());
                c5.setCellStyle(currencyStyle);
                Cell c6 = r.createCell(6);
                c6.setCellValue(s.getValuationRetail().doubleValue());
                c6.setCellStyle(currencyStyle);
                Cell c7 = r.createCell(7);
                c7.setCellValue(s.getPotentialProfit().doubleValue());
                c7.setCellStyle(currencyBoldStyle);
                Cell c8 = r.createCell(8);
                c8.setCellValue(s.getPotentialMarginPercentage().doubleValue() / 100.0);
                c8.setCellStyle(percentStyle);
                currentRow++;
            }
        }

        int lastStoreRow = currentRow - 1;

        // Embedded Column Chart: Cost vs Retail Value by Branch
        if (stores != null && !stores.isEmpty()) {
            int chartStartRow = currentRow + 2;
            XSSFDrawing drawing = sheet.createDrawingPatriarch();
            XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 1, chartStartRow, 9, chartStartRow + 16);
            XSSFChart chart = drawing.createChart(anchor);
            chart.setTitleText("Store Branch Inventory Valuation (Cost vs Retail Value)");
            chart.setTitleOverlay(false);

            XDDFChartLegend legend = chart.getOrAddLegend();
            legend.setPosition(LegendPosition.TOP_RIGHT);

            XDDFCategoryAxis bottomAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
            bottomAxis.setTitle("Store Branches");

            XDDFValueAxis leftAxis = chart.createValueAxis(AxisPosition.LEFT);
            leftAxis.setTitle("VND (₫)");
            leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);

            XDDFBarChartData barData = (XDDFBarChartData) chart.createData(ChartTypes.BAR, bottomAxis, leftAxis);
            barData.setBarDirection(BarDirection.COL);

            XDDFDataSource<String> storeNames = XDDFDataSourcesFactory.fromStringCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 2, 2));
            XDDFNumericalDataSource<Double> costs = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 5, 5));
            XDDFNumericalDataSource<Double> retails = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 6, 6));

            XDDFBarChartData.Series sCost = (XDDFBarChartData.Series) barData.addSeries(storeNames, costs);
            sCost.setTitle("Valuation (Cost)", null);

            XDDFBarChartData.Series sRetail = (XDDFBarChartData.Series) barData.addSeries(storeNames, retails);
            sRetail.setTitle("Retail Value", null);

            chart.plot(barData);
        }

        for (int i = 1; i <= 8; i++)
            sheet.autoSizeColumn(i);
    }

    private void buildStockItemsSheet(XSSFWorkbook workbook, InventoryReportResponse report,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle textStyle,
            CellStyle numberStyle, CellStyle currencyStyle, CellStyle dateStyle) {

        XSSFSheet sheet = workbook.createSheet("Stock Levels & Valuation");
        sheet.setDisplayGridlines(true);

        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("CURRENT STOCK LEVELS, BATCH DETAILS & VALUATION");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 9));

        Row tblHeader = sheet.createRow(3);
        String[] headers = { "#", "Product / Medicine", "Barcode", "Batch No", "Expiry Date", "Branch", "Quantity",
                "Min Qty", "Cost Price (₫)", "Valuation Cost (₫)" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<InventoryReportResponse.InventoryItemDto> items = report.getItems();
        int currentRow = 4;
        if (items != null && !items.isEmpty()) {
            int rank = 1;
            for (InventoryReportResponse.InventoryItemDto item : items) {
                Row r = sheet.createRow(currentRow);
                Cell c0 = r.createCell(0);
                c0.setCellValue(rank++);
                c0.setCellStyle(numberStyle);
                Cell c1 = r.createCell(1);
                c1.setCellValue(item.getProductName());
                c1.setCellStyle(textStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(item.getBarcode() != null ? item.getBarcode() : "—");
                c2.setCellStyle(textStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(item.getBatchNumber());
                c3.setCellStyle(textStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(item.getExpiryDate() != null ? item.getExpiryDate().format(DATE_FMT) : "—");
                c4.setCellStyle(dateStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(item.getStoreName());
                c5.setCellStyle(textStyle);
                Cell c6 = r.createCell(6);
                c6.setCellValue(item.getQuantity());
                c6.setCellStyle(numberStyle);
                Cell c7 = r.createCell(7);
                c7.setCellValue(item.getMinQuantity() != null ? item.getMinQuantity() : 0);
                c7.setCellStyle(numberStyle);
                Cell c8 = r.createCell(8);
                c8.setCellValue(item.getCostPrice().doubleValue());
                c8.setCellStyle(currencyStyle);
                Cell c9 = r.createCell(9);
                c9.setCellValue(item.getValuationCost().doubleValue());
                c9.setCellStyle(currencyStyle);
                currentRow++;
            }
        }
        for (int i = 0; i <= 9; i++)
            sheet.autoSizeColumn(i);
    }

    private void buildStockMovementsSheet(XSSFWorkbook workbook, InventoryReportResponse report,
            CellStyle titleStyle, CellStyle headerStyle, CellStyle textStyle,
            CellStyle numberStyle, CellStyle dateStyle) {

        XSSFSheet sheet = workbook.createSheet("Stock Movements Log");
        sheet.setDisplayGridlines(true);

        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("STOCK MOVEMENTS & AUDIT TRAIL");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 7));

        Row tblHeader = sheet.createRow(3);
        String[] headers = { "Date & Time", "Branch", "Product Name", "Batch No", "Movement Type", "Qty Change",
                "Ending Stock", "Reference" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<InventoryReportResponse.StockMovementReportDto> movements = report.getMovements();
        int currentRow = 4;
        if (movements != null && !movements.isEmpty()) {
            for (InventoryReportResponse.StockMovementReportDto m : movements) {
                Row r = sheet.createRow(currentRow);
                Cell c0 = r.createCell(0);
                c0.setCellValue(m.getCreatedAt().format(TIME_FMT));
                c0.setCellStyle(dateStyle);
                Cell c1 = r.createCell(1);
                c1.setCellValue(m.getStoreName());
                c1.setCellStyle(textStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(m.getProductName());
                c2.setCellStyle(textStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(m.getBatchNumber());
                c3.setCellStyle(textStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(m.getMovementTypeName());
                c4.setCellStyle(textStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(m.getQuantityChange());
                c5.setCellStyle(numberStyle);
                Cell c6 = r.createCell(6);
                c6.setCellValue(m.getQuantityAfter());
                c6.setCellStyle(numberStyle);
                Cell c7 = r.createCell(7);
                c7.setCellValue(String.format("%s #%s", m.getReferenceType(), m.getReferenceId()));
                c7.setCellStyle(textStyle);
                currentRow++;
            }
        }
        for (int i = 0; i <= 7; i++)
            sheet.autoSizeColumn(i);
    }

    private void createKpiCard(XSSFSheet sheet, int startRow, int startCol, int endCol,
            String label, String value, CellStyle labelStyle, CellStyle valueStyle) {
        Row r1 = sheet.getRow(startRow) != null ? sheet.getRow(startRow) : sheet.createRow(startRow);
        Cell c1 = r1.createCell(startCol);
        c1.setCellValue(label);
        c1.setCellStyle(labelStyle);
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, startCol, endCol));

        Row r2 = sheet.getRow(startRow + 1) != null ? sheet.getRow(startRow + 1) : sheet.createRow(startRow + 1);
        Cell c2 = r2.createCell(startCol);
        c2.setCellValue(value);
        c2.setCellStyle(valueStyle);
        sheet.addMergedRegion(new CellRangeAddress(startRow + 1, startRow + 1, startCol, endCol));
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null)
            return "0 ₫";
        return String.format("%,d ₫", amount.longValue());
    }

    private CellStyle createTitleStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 14);
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createSubTitleStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setItalic(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        return style;
    }

    private CellStyle createHeaderStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createCardLabelStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 9);
        font.setBold(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createCardValueStyle(XSSFWorkbook wb, short fontColor) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 14);
        font.setBold(true);
        font.setColor(fontColor);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createBorderedStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
