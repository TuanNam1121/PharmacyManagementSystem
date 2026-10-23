package com.pharmacy.service;

import com.pharmacy.dto.report.ProfitReportResponse;
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
public class ProfitExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public byte[] exportToExcel(ProfitReportResponse report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Pre-compile cell styles
            DataFormat dataFormat = workbook.createDataFormat();

            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle subTitleStyle = createSubTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle cardLabelStyle = createCardLabelStyle(workbook);
            CellStyle cardValueStyle = createCardValueStyle(workbook, IndexedColors.DARK_BLUE.getIndex());
            CellStyle cardProfitStyle = createCardValueStyle(workbook, IndexedColors.GREEN.getIndex());

            CellStyle currencyStyle = createBorderedStyle(workbook);
            currencyStyle.setDataFormat(dataFormat.getFormat("#,##0 \"₫\""));
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);

            CellStyle currencyBoldStyle = createBorderedStyle(workbook);
            currencyBoldStyle.setDataFormat(dataFormat.getFormat("#,##0 \"₫\""));
            currencyBoldStyle.setAlignment(HorizontalAlignment.RIGHT);
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            currencyBoldStyle.setFont(boldFont);

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

            // 1. Build Sheets
            buildDashboardSheet(workbook, report, titleStyle, subTitleStyle, headerStyle, cardLabelStyle,
                    cardValueStyle, cardProfitStyle, currencyStyle, currencyBoldStyle, percentStyle, textStyle,
                    numberStyle);

            buildProductProfitSheet(workbook, report, titleStyle, subTitleStyle, headerStyle, textStyle, numberStyle,
                    currencyStyle, percentStyle);

            buildDailyTrendsSheet(workbook, report, titleStyle, subTitleStyle, headerStyle, dateStyle, numberStyle,
                    currencyStyle, percentStyle);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SHEET 1: EXECUTIVE DASHBOARD WITH STORE COMPARISON & COLUMN CHART
    // ──────────────────────────────────────────────────────────────────────────
    private void buildDashboardSheet(XSSFWorkbook workbook, ProfitReportResponse report,
            CellStyle titleStyle, CellStyle subTitleStyle, CellStyle headerStyle,
            CellStyle cardLabelStyle, CellStyle cardValueStyle, CellStyle cardProfitStyle,
            CellStyle currencyStyle, CellStyle currencyBoldStyle, CellStyle percentStyle,
            CellStyle textStyle, CellStyle numberStyle) {

        XSSFSheet sheet = workbook.createSheet("Executive Dashboard");
        sheet.setDisplayGridlines(true);

        // Header Title
        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(1);
        titleCell.setCellValue("PHARMACY CHAIN MANAGEMENT - EXECUTIVE PROFIT REPORT");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 9));

        // Subtitle / Scope
        Row subRow = sheet.createRow(2);
        Cell subCell = subRow.createCell(1);
        String scopeText = String.format("Reporting Period: %s to %s   |   Scope: %s   |   Generated: %s by %s",
                report.getStartDate().format(DATE_FORMATTER),
                report.getEndDate().format(DATE_FORMATTER),
                report.getStoreName(),
                report.getGeneratedAt() != null ? report.getGeneratedAt().format(TIME_FORMATTER) : "N/A",
                report.getGeneratedBy());
        subCell.setCellValue(scopeText);
        subCell.setCellStyle(subTitleStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 1, 9));

        // ── 4 KPI METRIC CARDS (Rows 4-6) ──
        // Card 1: Total Revenue
        createKpiCard(sheet, 4, 1, 2, "TOTAL GROSS REVENUE", formatCurrency(report.getTotalRevenue()), cardLabelStyle,
                cardValueStyle);
        // Card 2: Total COGS
        createKpiCard(sheet, 4, 3, 4, "TOTAL COGS (COST)", formatCurrency(report.getTotalCost()), cardLabelStyle,
                cardValueStyle);
        // Card 3: Net Gross Profit
        createKpiCard(sheet, 4, 5, 6, "NET GROSS PROFIT", formatCurrency(report.getGrossProfit()), cardLabelStyle,
                cardProfitStyle);
        // Card 4: Profit Margin
        createKpiCard(sheet, 4, 7, 8, "GROSS MARGIN %",
                (report.getGrossMarginPercentage() != null ? report.getGrossMarginPercentage() : BigDecimal.ZERO) + "%",
                cardLabelStyle, cardValueStyle);

        // ── STORE COMPARISON TABLE (Starts at Row 8) ──
        Row secRow = sheet.createRow(8);
        Cell secCell = secRow.createCell(1);
        secCell.setCellValue("STORE BRANCH PERFORMANCE COMPARISON");
        Font secFont = workbook.createFont();
        secFont.setBold(true);
        secFont.setFontHeightInPoints((short) 12);
        CellStyle secStyle = workbook.createCellStyle();
        secStyle.setFont(secFont);
        secCell.setCellStyle(secStyle);

        Row tblHeader = sheet.createRow(9);
        String[] headers = { "Store Code", "Store Branch Name", "Paid Invoices", "Gross Revenue (₫)", "Total Cost (₫)",
                "Gross Profit (₫)", "Margin (%)" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i + 1);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<ProfitReportResponse.StoreProfitDto> stores = report.getStoreBreakdown();
        int currentRow = 10;
        int firstStoreRow = 10;

        if (stores != null && !stores.isEmpty()) {
            for (ProfitReportResponse.StoreProfitDto s : stores) {
                Row r = sheet.createRow(currentRow);
                Cell c1 = r.createCell(1);
                c1.setCellValue(s.getStoreCode());
                c1.setCellStyle(textStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(s.getStoreName());
                c2.setCellStyle(textStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(s.getInvoiceCount());
                c3.setCellStyle(numberStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(s.getRevenue().doubleValue());
                c4.setCellStyle(currencyStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(s.getCost().doubleValue());
                c5.setCellStyle(currencyStyle);
                Cell c6 = r.createCell(6);
                c6.setCellValue(s.getGrossProfit().doubleValue());
                c6.setCellStyle(currencyBoldStyle);
                Cell c7 = r.createCell(7);
                c7.setCellValue(s.getMarginPercentage().doubleValue() / 100.0);
                c7.setCellStyle(percentStyle);
                currentRow++;
            }
        } else {
            Row r = sheet.createRow(currentRow);
            Cell c = r.createCell(1);
            c.setCellValue("No store breakdown data available for this period.");
            sheet.addMergedRegion(new CellRangeAddress(currentRow, currentRow, 1, 7));
            currentRow++;
        }

        int lastStoreRow = currentRow - 1;

        // ── EMBED COLUMN CHART: REVENUE VS COST VS PROFIT BY STORE ──
        if (stores != null && !stores.isEmpty()) {
            int chartStartRow = currentRow + 2;
            XSSFDrawing drawing = sheet.createDrawingPatriarch();
            XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 1, chartStartRow, 9, chartStartRow + 16);
            XSSFChart chart = drawing.createChart(anchor);
            chart.setTitleText("Store Branch Financial Comparison (Revenue vs Cost vs Profit)");
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
            XDDFNumericalDataSource<Double> revenues = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 4, 4));
            XDDFNumericalDataSource<Double> costs = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 5, 5));
            XDDFNumericalDataSource<Double> profits = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstStoreRow, lastStoreRow, 6, 6));

            XDDFBarChartData.Series sRev = (XDDFBarChartData.Series) barData.addSeries(storeNames, revenues);
            sRev.setTitle("Revenue", null);

            XDDFBarChartData.Series sCost = (XDDFBarChartData.Series) barData.addSeries(storeNames, costs);
            sCost.setTitle("COGS (Cost)", null);

            XDDFBarChartData.Series sProf = (XDDFBarChartData.Series) barData.addSeries(storeNames, profits);
            sProf.setTitle("Gross Profit", null);

            chart.plot(barData);
        }

        // Auto-fit columns
        for (int i = 1; i <= 8; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SHEET 2: PRODUCT PROFITABILITY BREAKDOWN
    // ──────────────────────────────────────────────────────────────────────────
    private void buildProductProfitSheet(XSSFWorkbook workbook, ProfitReportResponse report,
            CellStyle titleStyle, CellStyle subTitleStyle, CellStyle headerStyle,
            CellStyle textStyle, CellStyle numberStyle, CellStyle currencyStyle, CellStyle percentStyle) {

        XSSFSheet sheet = workbook.createSheet("Product Profitability");
        sheet.setDisplayGridlines(true);

        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("MEDICINE & PRODUCT PROFITABILITY BREAKDOWN");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 7));

        Row tblHeader = sheet.createRow(3);
        String[] headers = { "#", "Product Name", "Barcode", "Unit", "Qty Sold", "Gross Revenue (₫)",
                "Cost of Goods (₫)", "Gross Profit (₫)", "Margin (%)" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<ProfitReportResponse.ProductProfitDto> products = report.getTopProducts();
        int currentRow = 4;

        if (products != null && !products.isEmpty()) {
            int rank = 1;
            for (ProfitReportResponse.ProductProfitDto p : products) {
                Row r = sheet.createRow(currentRow);
                Cell c0 = r.createCell(0);
                c0.setCellValue(rank++);
                c0.setCellStyle(numberStyle);
                Cell c1 = r.createCell(1);
                c1.setCellValue(p.getProductName());
                c1.setCellStyle(textStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(p.getBarcode() != null ? p.getBarcode() : "—");
                c2.setCellStyle(textStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(p.getUnit());
                c3.setCellStyle(textStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(p.getQuantitySold());
                c4.setCellStyle(numberStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(p.getRevenue().doubleValue());
                c5.setCellStyle(currencyStyle);
                Cell c6 = r.createCell(6);
                c6.setCellValue(p.getCost().doubleValue());
                c6.setCellStyle(currencyStyle);
                Cell c7 = r.createCell(7);
                c7.setCellValue(p.getGrossProfit().doubleValue());
                c7.setCellStyle(currencyStyle);
                Cell c8 = r.createCell(8);
                c8.setCellValue(p.getMarginPercentage().doubleValue() / 100.0);
                c8.setCellStyle(percentStyle);
                currentRow++;
            }
        }

        for (int i = 0; i <= 8; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SHEET 3: DAILY TRENDS & LINE CHART
    // ──────────────────────────────────────────────────────────────────────────
    private void buildDailyTrendsSheet(XSSFWorkbook workbook, ProfitReportResponse report,
            CellStyle titleStyle, CellStyle subTitleStyle, CellStyle headerStyle,
            CellStyle dateStyle, CellStyle numberStyle, CellStyle currencyStyle, CellStyle percentStyle) {

        XSSFSheet sheet = workbook.createSheet("Daily Trends");
        sheet.setDisplayGridlines(true);

        Row titleRow = sheet.createRow(1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DAILY REVENUE & PROFIT TIMELINE");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

        Row tblHeader = sheet.createRow(3);
        String[] headers = { "Date", "Paid Invoices", "Gross Revenue (₫)", "Cost (₫)", "Gross Profit (₫)",
                "Margin (%)" };
        for (int i = 0; i < headers.length; i++) {
            Cell c = tblHeader.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<ProfitReportResponse.DailyProfitTrendDto> trends = report.getDailyTrends();
        int currentRow = 4;
        int firstDateRow = 4;

        if (trends != null && !trends.isEmpty()) {
            for (ProfitReportResponse.DailyProfitTrendDto t : trends) {
                Row r = sheet.createRow(currentRow);
                Cell c0 = r.createCell(0);
                c0.setCellValue(t.getDate().format(DATE_FORMATTER));
                c0.setCellStyle(dateStyle);
                Cell c1 = r.createCell(1);
                c1.setCellValue(t.getInvoiceCount());
                c1.setCellStyle(numberStyle);
                Cell c2 = r.createCell(2);
                c2.setCellValue(t.getRevenue().doubleValue());
                c2.setCellStyle(currencyStyle);
                Cell c3 = r.createCell(3);
                c3.setCellValue(t.getCost().doubleValue());
                c3.setCellStyle(currencyStyle);
                Cell c4 = r.createCell(4);
                c4.setCellValue(t.getGrossProfit().doubleValue());
                c4.setCellStyle(currencyStyle);
                Cell c5 = r.createCell(5);
                c5.setCellValue(t.getMarginPercentage().doubleValue() / 100.0);
                c5.setCellStyle(percentStyle);
                currentRow++;
            }
        }

        int lastDateRow = currentRow - 1;

        // ── EMBED LINE CHART: DAILY REVENUE & PROFIT OVER TIME ──
        if (trends != null && trends.size() >= 2) {
            int chartStartRow = currentRow + 2;
            XSSFDrawing drawing = sheet.createDrawingPatriarch();
            XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 0, chartStartRow, 8, chartStartRow + 16);
            XSSFChart chart = drawing.createChart(anchor);
            chart.setTitleText("Daily Revenue vs Gross Profit Trend");
            chart.setTitleOverlay(false);

            XDDFChartLegend legend = chart.getOrAddLegend();
            legend.setPosition(LegendPosition.TOP_RIGHT);

            XDDFCategoryAxis bottomAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
            bottomAxis.setTitle("Business Date");

            XDDFValueAxis leftAxis = chart.createValueAxis(AxisPosition.LEFT);
            leftAxis.setTitle("VND (₫)");
            leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);

            XDDFLineChartData lineData = (XDDFLineChartData) chart.createData(ChartTypes.LINE, bottomAxis, leftAxis);

            XDDFDataSource<String> dates = XDDFDataSourcesFactory.fromStringCellRange(sheet,
                    new CellRangeAddress(firstDateRow, lastDateRow, 0, 0));
            XDDFNumericalDataSource<Double> revenues = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstDateRow, lastDateRow, 2, 2));
            XDDFNumericalDataSource<Double> profits = XDDFDataSourcesFactory.fromNumericCellRange(sheet,
                    new CellRangeAddress(firstDateRow, lastDateRow, 4, 4));

            XDDFLineChartData.Series sRev = (XDDFLineChartData.Series) lineData.addSeries(dates, revenues);
            sRev.setTitle("Revenue", null);
            sRev.setSmooth(true);

            XDDFLineChartData.Series sProf = (XDDFLineChartData.Series) lineData.addSeries(dates, profits);
            sProf.setTitle("Gross Profit", null);
            sProf.setSmooth(true);

            chart.plot(lineData);
        }

        for (int i = 0; i <= 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPER STYLES & KPI CARDS
    // ──────────────────────────────────────────────────────────────────────────
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
        style.setAlignment(HorizontalAlignment.LEFT);
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
        style.setAlignment(HorizontalAlignment.LEFT);
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
        style.setVerticalAlignment(VerticalAlignment.CENTER);
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
        style.setFillForegroundColor(IndexedColors.WHITE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
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
