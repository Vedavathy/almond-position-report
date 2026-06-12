# Almond Trading & Pricing Models — Research Guide
*For Hughson Nut — Grower, Handler & Trader | Updated June 2026*

---

## 1. How the California Almond Market Works

California produces approximately 80% of the world's almonds and virtually 100% of U.S. supply. The crop year runs **August through July**. As a handler, you sit between growers (delivering in-hull/in-shell) and buyers (domestic manufacturers, exporters, retail packers). Price discovery happens through a combination of spot sales, forward contracts, and negotiated pool arrangements.

**Key participants:**
- **Growers** — deliver at harvest (Aug–Oct); often receive a portion of payment upfront and remainder after handler sells
- **Handlers/Shellers** — hull, shell, process, and sell; take on price risk
- **Traders/Brokers** — facilitate sales, especially for export
- **Blue Diamond** — cooperative that sets a benchmark price many independents reference
- **Buyers** — domestic food manufacturers, importers, international distributors

---

## 2. The Core Price Drivers

Almond price is set at the intersection of total available supply and total committed demand. These are the variables that move prices the most:

### Supply Side

| Factor | What to Watch |
|--------|--------------|
| **Crop size (Billion lbs.)** | Single biggest driver. A 2.7B lb crop = tight; 3.0B+ = bearish pressure |
| **Bearing acreage** | Currently declining (1st time since 1995). 1.385M acres in 2026 |
| **Yield/acre** | 2026 USDA estimate: 1,940 lbs/acre — watch actual vs. estimate gap |
| **Chill hours** | Insufficient winter chill → poor bloom → lower set |
| **Spring weather** | Rain + cold at bloom = poor bee activity = lower pollination |
| **Water access** | Snowpack, reservoir levels critical for San Joaquin Valley south |
| **Abandoned/stressed orchards** | Hidden supply drain; estimated 2026 bearing acreage includes significant stressed blocks |
| **Carry-out inventory** | Rolling supply from prior year. Normal ~500M lbs; excess = price suppression |

### Demand Side

| Factor | What to Watch |
|--------|--------------|
| **India** | #1 export market (63% of global import value, ~$926M). Buys almost exclusively inshell. Timing of Indian purchases is the biggest near-term price signal. |
| **Western Europe** | #2 market for both shelled and inshell. YTD 2025/26: +3% |
| **China/HK/Vietnam** | Significant market but tariff-sensitive. YTD 2025/26: +3% (after 23% drop in March 2025 due to tariffs) |
| **Middle East/Africa** | Growing market; YTD 2025/26: +6% |
| **U.S. domestic** | Under pressure from snack competition; YTD 2025/26: -14.4% |
| **Australia inshell** | Competes with California for India's inshell demand. 2026 Australian crop impacted by rain = bullish for CA inshell |
| **Tariff environment** | EU floated 25% tariff (Dec 2025); China tariffs active; India tariff ~100% on shelled but much lower on inshell |

### The "Industry Sold Position"
The Almond Board reports what % of total supply is committed (sold or shipped). **80%+ = tight market, prices firm.** Current (April 2026): 80.3% sold vs. 81.8% a year ago. Watching this metric month-to-month predicts whether handlers have pricing power.

---

## 3. Price History & Benchmarks

| Period | Price/lb (Nonpareil equivalent) | Context |
|--------|--------------------------------|---------|
| 2021-2022 peak | ~$3.50–$4.00 | Tight supply, strong demand |
| 2023-2024 trough | ~$1.70–$2.00 | 3B lb oversupply projections |
| 2025 recovery | $2.60–$2.70 | Smaller actual crop than estimated |
| Spring 2026 | ~$3.00+ | Rally on inshell demand + smaller 2026 crop |

**Grower breakeven thresholds (2024 cost structure):**
- Operating costs only: ~$1.73/lb at 2,200 lbs/acre
- Full economic cost (including land, debt service): **$3.80–$4.31/lb**
- "Slightly profitable" threshold for 2026: approximately $3.00+/lb

The gap between operating breakeven and full economic breakeven is why orchards have been removed — growers covering cash costs but not recovering capital.

---

## 4. Pricing Models Used in the Industry

### 4.1 Fundamental Supply/Demand Model
The simplest and most widely used framework by traders and handlers:

```
Estimated Price = f(Total Supply, Total Demand, Carry-out, Industry Sold %)
```

**Total Supply** = Prior carry-out + New crop estimate  
**Total Demand** = Projected domestic + export commitments  
**Carry-out** = Supply − Demand (if >600M lbs = bearish; <400M lbs = bullish)

Price direction can often be predicted simply by tracking whether the industry sold position is running ahead or behind last year's pace.

### 4.2 Crop Estimate-Driven Model
Prices move sharply on crop estimate releases. The key forecasting moments in the calendar are:

| Month | Event | Price Impact |
|-------|-------|-------------|
| May | USDA Subjective Forecast (opening estimate) | High — sets season expectations |
| ~~July~~ | ~~USDA Objective Estimate~~ | **Discontinued Dec 2025** — removes a major uncertainty event |
| September | ABC Position Report #1 (August receipts) | Very high — first real look at actual crop |
| November–December | Handler reports, industry consensus | Moderate — refines estimate |

> **Important for 2026 forward:** The Almond Board voted in December 2025 to discontinue the USDA NASS Objective Estimate. This eliminates the "July surprise" factor that historically caused volatility (as happened in July 2025 when the estimate spooked buyers). The market is now more reliant on private estimates (Terra Nova, etc.) and the September receipts data.

### 4.3 Position Report Momentum Model
Monthly position reports from the Almond Board track cumulative shipments and sales vs. prior year. Traders use YTD variance as a leading indicator:

- **YTD shipments > prior year**: demand absorbing supply → price support
- **YTD shipments < prior year AND industry sold % declining**: bearish signal
- **Uncommitted inventory rising**: handlers holding → price pressure or expecting higher prices

### 4.4 Seasonal/Calendar Model
Prices tend to follow a predictable seasonal arc:

- **June–August**: Uncertainty phase. Pre-harvest speculation. Buyers hesitant.
- **September–November**: Harvest receipts drive price discovery. Usually most active selling window.
- **December–February**: Holiday demand (India Diwali/wedding season, Middle East). Prices often firm.
- **March–May**: Export fulfillment, late-season sales. Buyers look to cover remaining needs.

### 4.5 Export Demand Leading Indicator Model
Since exports = 70–80% of supply, tracking monthly export pace to key markets is a reliable leading price indicator:

- **India monthly shipment data** is the most important single signal. When India buys ahead of pace → prices rise.
- China buying is tariff-sensitive — geopolitical developments can shift this market quickly.
- Watch Australian inshell crop quality/size — a poor Aussie crop pushes India to California.

### 4.6 Quantitative / ML-Based Forecasting
Academic and institutional approaches (relevant for building a systematic model):

**Time Series Models:**
- **ARIMA/VAR** — effective for short-term, low-volatility periods; good for 1–3 month forecasts when market is stable
- Works well when you have clean historical price + shipment data

**Machine Learning Models:**
- **LSTM (Long Short-Term Memory)** — best performance during volatile/nonlinear price episodes; captures momentum and trend breaks better than ARIMA
- **Extreme Learning Machine (ELM) + Genetic Algorithm** — faster to train, good for shorter historical windows
- **CNN-BiLSTM with Attention Mechanism** — most sophisticated; uses Successive Variational Mode Decomposition (SVMD) to decompose price signal into components, then deep learning to forecast each component separately before recombining

**Stochastic Models:**
- **Geometric Brownian Motion (GBM)** — useful for option pricing and risk analysis (not directional forecasting)
- **Monte Carlo simulation** — for modeling price distribution under uncertainty (useful for hedging decisions)

**Practical hybrid approach** for a handler/trader:
> Combine fundamental supply/demand model (inputs: crop estimate, YTD shipments, carry-out) with ARIMA for baseline + LSTM layer for shock capture. Run monthly updates as Position Report data arrives.

---

## 5. Key Variables to Build a Price Prediction Model

If building a quantitative model, these are the input variables ranked by predictive power:

1. **Current crop estimate** (B lbs, updated seasonally)
2. **Prior year carry-out** (M lbs, from July Position Report)
3. **YTD shipments vs. prior year** (% change, monthly)
4. **Industry sold position** (% of total supply committed)
5. **India YTD export pace** (M lbs, monthly)
6. **Uncommitted inventory** (M lbs, from Position Report)
7. **Bearing acreage trend** (directional signal for multi-year outlook)
8. **Tariff rates** on key markets (binary/indexed variable)
9. **Input cost index** (fuel + fertilizer — affects grower willingness to sell at low prices)
10. **Australian crop size** (competing inshell supply for India)

---

## 6. Current Market Snapshot (June 2026)

- **2026 USDA Subjective Estimate**: 2.70 billion lbs (flat to 2025 final of 2.715B)
- **Private estimates**: 2.66–2.69B lbs (slightly below USDA)
- **Bearing acreage**: 1.385M acres (down 1% from 2025, declining for first time since 1995)
- **Industry sold position**: 80.3% of total supply (vs. 81.8% prior year)
- **April 2026 shipments**: 219.9M lbs (down 8.8% for month; down 2.7% YTD)
- **Carry-out forecast**: ~500M lbs (in line with prior year — neutral)
- **Profitability assessment**: **Slightly profitable** (AgWest, June 10, 2026)
- **12-month price outlook**: **Neutral** — smaller crop + normal carry-out supports prices, but rising input costs limit upside

**Near-term price catalysts to watch:**
- May 2026 Position Report (releasing June 11, 2026)
- India buying pace resuming after April pullback (-31%)
- Whether Middle East buyers (low stock) begin to cover aggressively
- 2026 Northern vs. Southern SJV yield differential as harvest approaches

---

## 7. Essential Data Sources for Handlers & Traders

| Source | What it provides | Frequency |
|--------|-----------------|-----------|
| [Almond Board Position Reports](https://www.almonds.org/tools-and-resources/crop-reports/position-reports) | Shipments, sales, carry-out by region | Monthly |
| [USDA NASS Almond Reports](https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Almond/index.php) | Crop estimates, bearing acreage | May (subjective), Sept receipts |
| [RPAC Market News](https://www.rpacalmonds.com/marketnews/) | Handler perspective, price commentary | Monthly |
| [AgWest Farm Credit Almond/Pistachio](https://www.agwestfc.com/education-and-resources/industry-and-economic-insights/industry-insights/almonds-and-pistachios) | Profitability ratings, trade flows, tariff data | Monthly |
| [Blue Diamond Market Reports](https://bdingredients.com/) | Benchmark price signals | Monthly |
| [Terra Nova Trading Crop Estimates](https://www.terranovatradinginc.com/) | Independent crop estimate | Annually (May) |
| [INC Crop Update](https://inc.nutfruit.org/almond-crop-update-outlook/) | Global supply picture | Seasonal |
| [FRED PPI Almonds](https://fred.stlouisfed.org/series/WPU01190102) | Producer price index historical data | Monthly |

---

## 8. Risk Management for Handlers

Since there are no liquid almond futures contracts (unlike corn/wheat), handlers manage price risk through:

**Forward contracting** — sell a portion of expected crop before harvest at a fixed price. Reduces risk but caps upside.

**Basis contracts** — agree on the price relationship to some benchmark (e.g., Blue Diamond pool price or a regional average) rather than fixing absolute price.

**Pool arrangements** — aggregate grower deliveries and sell over the season to average price outcomes; reduces grower risk, gives handler operational flexibility.

**Staggered selling** — sell a portion at harvest, hold remainder through peak demand season (Nov–Jan). Requires storage and working capital.

**Crop insurance (MPCI)** — protects revenue at the grower level; handlers benefit indirectly from grower stability.

**Inventory timing** — holding uncommitted inventory when industry sold % is low and export demand is building is one of the most powerful levers a handler has.

---

*Report compiled June 11, 2026. Sources: Almond Board of California, USDA NASS, RPAC, AgWest Farm Credit, AgNetWest, Blue Diamond, Terra Nova Trading, academic ML price forecasting literature.*
