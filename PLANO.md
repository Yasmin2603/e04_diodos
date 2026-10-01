# Infográfico Interativo — Diodo PIN & Fotodiodo

## Objetivo
Site em **Vite (vanilla JS) + Chart.js** que apresenta, em formato de infográfico interativo, exatamente o conteúdo levantado sobre os dois dispositivos, com gráficos manipuláveis e curvas baseadas em datasheets reais.

## Estrutura da página
1. **Hero** – título, alternador de dispositivo (PIN ⇄ Fotodiodo), linha do tempo (Ohl 1940 → Nishizawa PIN 1950 → APD 1952).
2. **Cada dispositivo** (mesmas seções numeradas do conteúdo original):
   | # | Seção | Elemento interativo |
   |---|-------|---------------------|
   | 1 | Quem desenvolveu | Cartão com timeline |
   | 2 | Como funciona | Diagrama P‑I‑N / junção animado + seletor de polarização/modo e equações |
   | 3 | Gráficos representativos | Curvas modeladas com sliders (I_F, V_R, irradiância, τ) |
   | 4 | Vantagens / Desvantagens | Tabela em duas colunas |
   | 6 | Gráficos do datasheet | Seletor de componente + seletor de gráfico (dados digitalizados) |
   | 7 | Características principais | Cartões de "KPI" |
   | 8 | Custo | Barras de faixa de preço (escala log, US$ ⇄ R$) |
   | 9 | Aplicações | Grade de ícones com descrição no hover |

## Gráficos interativos
### Diodo PIN
- **I×V** (modelo Shockley, n≈2, queda ~0,7–1 V) — ruptura alta marcada.
- **R_RF × I_F** log-log: R = W²/[(μn+μp)·I_F·τ]; sliders de W e τ; cursor mostra R no I_F escolhido.
- **C × V_R**: capacitância cai e satura quando a região I é totalmente depletada.
- **Frequência de corte** f = 1/(2πτ) calculada ao vivo.

### Fotodiodo
- **Família I×V**: I = Is(e^(V/nVT) − 1) − Iph, slider de irradiância; quadrantes 3 (fotodetector) e 4 (célula solar) destacados.
- **Corrente de escuro × temperatura** (≈ dobra a cada 10 °C).
- Alternador de modo fotovoltaico / fotocondutivo.

## Dados de datasheet (digitalizados, valores típicos)
- PIN: **BAP64** (Nexperia), **HSMP-3810** (Broadcom), **SMP1302** (Skyworks) → Rs×I_F, C_T×V_R, I_F×V_F.
- Fotodiodo: **BPW34** (Vishay), **SFH 203** (Osram), **S1223** (Hamamatsu) → sensibilidade espectral, I_ph×irradiância, I_escuro×V_R, C×V_R, diagrama polar.
> Pontos aproximados a partir das curvas típicas; confirmar sempre no PDF oficial.

## Stack / arquivos
```
index.html
src/main.js      # renderização + gráficos
src/data.js      # conteúdo textual e dados de datasheet
src/style.css
```
Comandos: `npm install` → `npm run dev`.
