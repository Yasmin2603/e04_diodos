// Conteúdo textual e dados digitalizados de datasheets (valores típicos aproximados).

export const PIN = {
  key: 'pin',
  nome: 'Diodo PIN',
  autor: {
    texto: 'Jun-ichi Nishizawa, da Universidade de Tohoku (Japão), em 1950. Ele também propôs o fotodiodo PIN no mesmo ano.',
  },
  funcionamento: [
    ['Estrutura', 'Uma região intrínseca (I), larga e sem dopagem, fica entre as regiões P e N.'],
    ['Polarização direta', 'Elétrons e lacunas são injetados na região I. Isso modula a condutividade, e o diodo passa a se comportar como um resistor controlado por corrente. Em RF: R ≈ W² / [(μn+μp)·I_F·τ].'],
    ['Polarização reversa', 'A partir de alguns volts (tensão de punch-through), a região I fica totalmente depletada. O diodo vira uma capacitância pequena e quase constante, que em RF funciona como circuito aberto.'],
    ['Em RF', 'Para f ≥ 10/(2πτ) (uma década acima de 1/(2πτ)), sendo τ o tempo de vida dos portadores, a carga armazenada não acompanha o sinal: o diodo não retifica e se comporta como uma resistência linear, controlada pela corrente DC.'],
  ],
  vantagens: ['Alta tensão de ruptura', 'Baixa capacitância em reverso', 'Controla sinais de RF de alta potência com baixa corrente DC', 'Linear e com baixa distorção em RF'],
  desvantagens: ['Comutação mais lenta (τ alto)', 'Precisa de corrente DC de polarização (consumo)', 'Queda direta maior', 'Não serve para retificação rápida em baixa tensão'],
  caracteristicas: [
    ['Tensão de ruptura V_BR', '50 V a >1 kV'],
    ['Capacitância', '0,1–1 pF'],
    ['R_S', '~1–20 Ω'],
    ['Tempo de vida τ', '~10 ns a 5 µs'],
    ['Faixa de frequência', 'MHz a dezenas de GHz'],
  ],
  custo: [
    { item: 'Sinal pequeno SMD', min: 0.05, max: 1, brl: 'R$ 0,50–6' },
    { item: 'PIN de alta potência RF', min: 10, max: 500, brl: 'R$ 50–2.500' },
  ],
  aplicacoes: [
    ['RadioTower', 'Chaves de RF', 'Comutação TX/RX em celulares, rádios e radares'],
    ['SlidersHorizontal', 'Atenuadores / AGC', 'Atenuadores variáveis e controle automático de ganho'],
    ['Satellite', 'Deslocadores de fase', 'Antenas phased array'],
    ['Shield', 'Limitadores', 'Proteção de receptores de radar'],
    ['Zap', 'Retificadores de potência', 'A estrutura P-I-N é a base dos diodos retificadores de alta tensão (outra família, não os PIN de RF)'],
    ['Magnet', 'Ressonância magnética', 'Dessintonia de bobinas em MRI'],
  ],
};

export const FOTO = {
  key: 'foto',
  nome: 'Fotodiodo',
  autor: {
    texto: 'Russell Ohl (Bell Labs, 1940) descobriu o efeito fotovoltaico na junção PN de silício, base do fotodiodo. Jun-ichi Nishizawa inventou o fotodiodo PIN (1950) e o fotodiodo avalanche, APD (1952).',
  },
  funcionamento: [
    ['Absorção', 'Um fóton com energia maior que o gap (E_g) é absorvido e gera um par elétron-lacuna — principalmente na região de depleção (a região I, no PIN), mas também a até um comprimento de difusão dela.'],
    ['Separação', 'O campo elétrico da junção separa o par, produzindo uma fotocorrente proporcional à luz incidente.'],
    ['Modo fotovoltaico (0 V)', 'Sem polarização, a corrente de escuro é idealmente nula e o ruído é mínimo, porém a capacitância é maior e a resposta, mais lenta.'],
    ['Modo fotocondutivo (reverso)', 'Mais rápido (menor capacitância) e mais linear, mas com maior corrente de escuro.'],
    ['Equação', 'I = I_S·(e^(V/nV_T) − 1) − I_ph'],
  ],
  vantagens: ['Resposta muito rápida (ns ou ps)', 'Excelente linearidade', 'Baixo ruído, barato e compacto', 'Longa vida útil'],
  desvantagens: ['Sinal fraco (nA–µA), exige amplificador de transimpedância', 'Corrente de escuro aumenta com a temperatura', 'Resposta limitada a uma faixa espectral', 'Sem ganho interno, exceto no APD'],
  caracteristicas: [
    ['Responsividade', '~0,5–0,65 A/W (Si, ~900 nm)'],
    ['Faixa espectral', 'Si 400–1100 nm · InGaAs 900–1700 nm'],
    ['Corrente de escuro', 'pA–nA'],
    ['Capacitância', 'pF a centenas de pF (cresce com a área, cai com V_R)'],
    ['Tempo de subida', 'ns (ps nos PIN rápidos)'],
    ['NEP', '~10⁻¹⁴ W/√Hz (Si) · área ex.: 7,5 mm² no BPW34'],
  ],
  custo: [
    { item: 'Si comum (BPW34)', min: 0.5, max: 1.5, brl: 'R$ 3–10' },
    { item: 'InGaAs p/ fibra óptica', min: 10, max: 150, brl: 'R$ 50–750' },
    { item: 'APD', min: 20, max: 500, brl: 'R$ 100–2.500' },
  ],
  aplicacoes: [
    ['Cable', 'Fibra óptica', 'Receptores telecom com PIN InGaAs em 1310/1550 nm'],
    ['Tv', 'Controle remoto IR', 'Receptores infravermelhos'],
    ['Flame', 'Detectores de fumaça', 'Espalhamento óptico'],
    ['HeartPulse', 'Oxímetros de pulso', 'Absorção vermelho/IR'],
    ['ScanLine', 'Tomografia e raio-X', 'Com cintilador'],
    ['Barcode', 'Código de barras', 'Leitores ópticos'],
    ['Cog', 'Encoders ópticos', 'Posição e velocidade'],
    ['Car', 'LiDAR', 'Medição de distância por tempo de voo'],
    ['Construction', 'Cortinas de luz', 'Segurança de máquinas'],
    ['Lightbulb', 'Fotômetros', 'Medidores de luz'],
  ],
};

// ---- Datasheets digitalizados (curvas típicas, 25 °C) ----
// x/y em pares [x, y]
export const DS_PIN = {
  'BAP64-02 (Nexperia)': {
    info: 'V_R máx 175 V · I_F máx 100 mA · τ_L ≈ 1,55 µs · r_D típ. 20 Ω @ 0,5 mA · 2 Ω @ 10 mA · 0,7 Ω @ 100 mA (100 MHz) · C_d ≈ 0,48 pF @ 0 V · 0,23 pF @ 20 V',
    rs: [[0.01, 350], [0.03, 140], [0.1, 60], [0.3, 30], [0.5, 20], [1, 10], [3, 4.2], [10, 2], [30, 1.1], [100, 0.7]],
    ct: [[0, 0.48], [1, 0.35], [2, 0.31], [5, 0.27], [10, 0.25], [20, 0.23], [50, 0.22], [100, 0.21]],
    ifvf: [[0.6, 0.01], [0.65, 0.05], [0.7, 0.25], [0.75, 1.2], [0.8, 4.5], [0.85, 12], [0.9, 28], [0.95, 55], [1.0, 90]],
  },
  'HSMP-3810 (Broadcom)': {
    info: 'V_BR ≥ 100 V · τ ≈ 1500 ns · C_T ≈ 0,27 pF típ. (≤ 0,35) @ 50 V · R_T ≤ 3 Ω @ 100 mA',
    rs: [[0.01, 1500], [0.03, 600], [0.1, 200], [0.3, 80], [1, 30], [3, 12], [10, 6], [30, 4], [100, 3]],
    ct: [[0, 0.5], [2, 0.4], [5, 0.34], [10, 0.31], [20, 0.29], [30, 0.28], [50, 0.27]],
    ifvf: [[0.55, 0.01], [0.62, 0.1], [0.7, 0.8], [0.78, 5], [0.85, 18], [0.92, 45], [1.0, 90]],
  },
  'SMP1302 (Skyworks)': {
    info: 'V_R 200 V · τ ≈ 700 ns (@ 10 mA) · C_T ≤ 0,3 pF @ 30 V · R_S ≤ 3 Ω @ 10 mA · ≤ 1,5 Ω @ 100 mA',
    rs: [[0.01, 250], [0.03, 100], [0.1, 45], [0.3, 18], [1, 8], [3, 4.5], [10, 2.75], [30, 1.8], [100, 1.3]],
    ct: [[0, 0.5], [1, 0.42], [3, 0.36], [5, 0.33], [10, 0.31], [20, 0.29], [30, 0.28]],
    ifvf: [[0.6, 0.01], [0.66, 0.1], [0.72, 0.8], [0.78, 4], [0.84, 13], [0.9, 32], [0.97, 70], [1.0, 90]],
  },
};

export const DS_FOTO = {
  'BPW34 (Vishay)': {
    info: 'Área 7,5 mm² · λ_p 900 nm · I_ro ≈ 2 nA @ 10 V · C_D ≈ 70 pF @ 0 V · t_r ≈ 100 ns · φ = ±65°',
    espectral: [[400, 0.2], [500, 0.4], [600, 0.58], [700, 0.75], [800, 0.9], [900, 1], [950, 0.95], [1000, 0.7], [1050, 0.35], [1100, 0.08]],
    iph: [[0.01, 0.5], [0.1, 5], [1, 50], [10, 500], [100, 5000]], // mW/cm² → µA
    escuroT: [[20, 1.5], [40, 7], [60, 30], [80, 130], [100, 500]],   // °C → nA
    ct: [[0, 70], [1, 40], [3, 25], [5, 20], [10, 15], [20, 12], [32, 10]],
    polar: [1, 0.99, 0.96, 0.91, 0.84, 0.74, 0.6, 0.42, 0.2, 0], // 0..90° passo 10°
  },
  'SFH 203 (Osram)': {
    info: 'Área 1 mm² · λ_p 850 nm · S ≈ 0,62 A/W · I_R ≈ 1 nA @ 20 V · C ≈ 11 pF @ 0 V · t_r ≈ 5 ns · φ = ±75°',
    espectral: [[400, 0.1], [500, 0.3], [600, 0.5], [700, 0.72], [800, 0.95], [850, 1], [900, 0.95], [1000, 0.5], [1100, 0.05]],
    iph: [[0.01, 0.062], [0.1, 0.62], [1, 6.2], [10, 62], [100, 620]],
    escuroT: [[20, 0.7], [40, 3.5], [60, 15], [80, 65], [100, 260]],
    ct: [[0, 11], [1, 7.5], [2, 6], [5, 4.5], [10, 3.5], [20, 3]],
    polar: [1, 0.995, 0.98, 0.95, 0.9, 0.82, 0.7, 0.55, 0.35, 0],
  },
  'S1223-01 (Hamamatsu)': {
    info: 'Área 3,6 × 3,6 mm (13 mm²) · λ_p 960 nm · faixa 320–1100 nm · C_t ≈ 20 pF @ 20 V · f_c ≈ 20 MHz (o S1223, 2,4 × 2,8 mm, chega a 30 MHz)',
    espectral: [[320, 0.1], [400, 0.3], [500, 0.45], [600, 0.6], [700, 0.72], [800, 0.85], [900, 0.95], [960, 1], [1000, 0.9], [1050, 0.55], [1100, 0.15]],
    iph: [[0.01, 0.78], [0.1, 7.8], [1, 78], [10, 780], [100, 7800]],
    escuroT: [[20, 0.08], [40, 0.4], [60, 1.8], [80, 8], [100, 32]],
    ct: [[0, 70], [1, 50], [2, 42], [5, 32], [10, 25], [20, 20]],
    polar: [1, 0.99, 0.965, 0.92, 0.86, 0.77, 0.63, 0.46, 0.24, 0],
  },
};
