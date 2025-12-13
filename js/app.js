/**
 * VetCalc - UK Veterinary Drug Calculator
 * Main Application Logic
 */

class VetCalcApp {
    constructor() {
        this.selectedSpecies = null;
        this.selectedDrug = null;
        this.weight = null; // Always stored in kg internally
        this.weightUnit = 'kg'; // 'kg' or 'g'
        this.activeCategory = 'pain_relief'; // Start with pain relief

        // Species that typically use grams
        this.smallAnimals = ['hamster', 'rat', 'guinea_pig', 'ferret'];

        this.init();
    }

    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Hide splash screen after a short delay
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
            }
        }, 1500);

        // Set version
        const versionEl = document.getElementById('app-version');
        if (versionEl) {
            versionEl.textContent = APP_VERSION;
        }

        // Setup event listeners
        this.setupSpeciesSelection();
        this.setupWeightInput();
        this.setupWeightAdjustButtons();
        this.setupDrugSearch();
        this.setupCategories();

        // Initialize drug list with pain relief category
        this.renderDrugList();

        // Hide result section initially
        document.getElementById('result-section').style.display = 'none';
    }

    setupSpeciesSelection() {
        const speciesGrid = document.getElementById('species-grid');
        const buttons = speciesGrid.querySelectorAll('.species-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                buttons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                this.selectedSpecies = btn.dataset.species;

                // Auto-switch to grams for small animals
                if (this.smallAnimals.includes(this.selectedSpecies)) {
                    this.setWeightUnit('g');
                } else {
                    this.setWeightUnit('kg');
                }

                this.updateWeightPresets();
                this.renderDrugList();
                this.updateCalculation();
            });
        });
    }

    setWeightUnit(unit) {
        this.weightUnit = unit;

        // Update label
        document.getElementById('weight-unit-label').textContent = unit;

        // Update input step and placeholder
        const input = document.getElementById('weight-input');
        if (unit === 'g') {
            input.step = '1';
            input.placeholder = '0';
        } else {
            input.step = '0.01';
            input.placeholder = '0.00';
        }

        // Convert displayed value if we have a weight
        if (this.weight !== null) {
            if (unit === 'g') {
                input.value = (this.weight * 1000).toFixed(0);
            } else {
                input.value = this.weight.toFixed(2);
            }
        }

        // Update presets display
        this.updateWeightPresets();
    }

    setupWeightAdjustButtons() {
        const minusBtn = document.getElementById('weight-minus');
        const plusBtn = document.getElementById('weight-plus');
        const input = document.getElementById('weight-input');

        // Get increment based on unit and current value
        const getIncrement = () => {
            if (this.weightUnit === 'g') {
                const currentVal = parseFloat(input.value) || 0;
                if (currentVal < 100) return 5;
                if (currentVal < 500) return 10;
                return 50;
            } else {
                const currentVal = parseFloat(input.value) || 0;
                if (currentVal < 1) return 0.1;
                if (currentVal < 10) return 0.5;
                return 1;
            }
        };

        minusBtn.addEventListener('click', () => {
            const currentVal = parseFloat(input.value) || 0;
            const increment = getIncrement();
            const newVal = Math.max(0, currentVal - increment);

            if (this.weightUnit === 'g') {
                input.value = newVal.toFixed(0);
                this.weight = newVal / 1000;
            } else {
                input.value = newVal.toFixed(2);
                this.weight = newVal;
            }

            if (this.weight > 0) {
                this.updateCalculation();
            } else {
                this.weight = null;
                this.hideResult();
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentVal = parseFloat(input.value) || 0;
            const increment = getIncrement();
            const newVal = currentVal + increment;

            if (this.weightUnit === 'g') {
                input.value = newVal.toFixed(0);
                this.weight = newVal / 1000;
            } else {
                input.value = newVal.toFixed(2);
                this.weight = newVal;
            }

            this.updateCalculation();
        });
    }

    setupWeightInput() {
        const weightInput = document.getElementById('weight-input');

        weightInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value) && value > 0) {
                // Convert to kg if input is in grams
                if (this.weightUnit === 'g') {
                    this.weight = value / 1000;
                } else {
                    this.weight = value;
                }
                this.updateCalculation();
            } else {
                this.weight = null;
                this.hideResult();
            }
        });

        // Handle keyboard done button on mobile
        weightInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                weightInput.blur();
            }
        });
    }

    updateWeightPresets() {
        const container = document.getElementById('weight-presets');
        container.innerHTML = '';

        if (!this.selectedSpecies) return;

        const presets = DRUG_DATABASE.weightPresets[this.selectedSpecies] || [];

        presets.forEach(weightKg => {
            const btn = document.createElement('button');
            btn.className = 'weight-preset-btn';

            // Display in current unit
            if (this.weightUnit === 'g') {
                const grams = weightKg * 1000;
                btn.textContent = `${grams.toFixed(0)}g`;
            } else {
                btn.textContent = `${weightKg.toFixed(2)}kg`;
            }

            btn.addEventListener('click', () => {
                const input = document.getElementById('weight-input');
                if (this.weightUnit === 'g') {
                    input.value = (weightKg * 1000).toFixed(0);
                } else {
                    input.value = weightKg.toFixed(2);
                }
                this.weight = weightKg;
                this.updateCalculation();
            });
            container.appendChild(btn);
        });
    }

    setupDrugSearch() {
        const searchInput = document.getElementById('drug-search');

        searchInput.addEventListener('input', (e) => {
            this.renderDrugList(e.target.value);
        });
    }

    setupCategories() {
        const container = document.getElementById('drug-categories');
        container.innerHTML = '';

        DRUG_DATABASE.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            if (category.id === this.activeCategory) {
                btn.classList.add('active');
            }
            btn.textContent = `${category.icon} ${category.name}`;
            btn.dataset.category = category.id;

            btn.addEventListener('click', () => {
                // Remove active from all
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCategory = category.id;
                this.renderDrugList();
            });

            container.appendChild(btn);
        });
    }

    renderDrugList(searchQuery = '') {
        const container = document.getElementById('drug-list');
        container.innerHTML = '';

        let drugs = DRUG_DATABASE.drugs;

        // Filter by category
        if (this.activeCategory) {
            drugs = drugs.filter(d => d.category === this.activeCategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            drugs = DRUG_DATABASE.drugs.filter(d =>
                d.name.toLowerCase().includes(query) ||
                d.category.toLowerCase().includes(query)
            );
        }

        // Filter by species if selected
        if (this.selectedSpecies) {
            drugs = drugs.filter(d => d.species[this.selectedSpecies]);
        }

        if (drugs.length === 0) {
            container.innerHTML = `
                <div class="no-drugs">
                    <p>No drugs found${this.selectedSpecies ? ' for ' + DRUG_DATABASE.speciesNames[this.selectedSpecies] : ''}.</p>
                    <p style="font-size: 0.85rem; opacity: 0.7;">Try selecting a different species or category.</p>
                </div>
            `;
            return;
        }

        drugs.forEach(drug => {
            const item = document.createElement('div');
            item.className = 'drug-item';
            if (this.selectedDrug && this.selectedDrug.id === drug.id) {
                item.classList.add('active');
            }

            const category = DRUG_DATABASE.categories.find(c => c.id === drug.category);

            item.innerHTML = `
                <div class="drug-info">
                    <div class="drug-name">${drug.name}</div>
                    <div class="drug-concentration">${drug.concentration}</div>
                </div>
                <span class="drug-category-badge">${category ? category.name : drug.category}</span>
            `;

            item.addEventListener('click', () => {
                // Remove active from all
                container.querySelectorAll('.drug-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.selectedDrug = drug;
                this.updateCalculation();
            });

            container.appendChild(item);
        });
    }

    updateCalculation() {
        if (!this.selectedSpecies || !this.selectedDrug || !this.weight) {
            this.hideResult();
            return;
        }

        const speciesData = this.selectedDrug.species[this.selectedSpecies];
        if (!speciesData) {
            this.hideResult();
            return;
        }

        this.showResult(speciesData);
    }

    showResult(speciesData) {
        const resultSection = document.getElementById('result-section');
        resultSection.style.display = 'block';

        // Update header
        document.getElementById('result-drug-name').textContent = this.selectedDrug.name;
        document.getElementById('result-species').textContent =
            DRUG_DATABASE.speciesNames[this.selectedSpecies];

        // Calculate dose
        const dose = Array.isArray(speciesData.dose)
            ? speciesData.dose // range
            : speciesData.dose; // single value

        const calculation = this.calculateDose(dose, speciesData);

        // Display result
        const resultDose = document.getElementById('result-dose');
        if (calculation.isRange) {
            resultDose.innerHTML = `
                <span class="dose-value">${calculation.minResult} - ${calculation.maxResult}</span>
                <span class="dose-unit">${calculation.unit}</span>
            `;
        } else {
            resultDose.innerHTML = `
                <span class="dose-value">${calculation.result}</span>
                <span class="dose-unit">${calculation.unit}</span>
            `;
        }

        // Display calculation breakdown
        this.renderCalculationBreakdown(dose, speciesData, calculation);

        // Display notes
        this.renderNotes(speciesData);

        // Scroll to result
        setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    calculateDose(dose, speciesData) {
        const weight = this.weight; // Always in kg
        const concentration = this.selectedDrug.concentrationValue;
        const calculationType = speciesData.calculationType;

        if (Array.isArray(dose)) {
            // Dose range
            const minDose = dose[0];
            const maxDose = dose[1];

            if (calculationType === 'volume' && concentration) {
                const minVolume = (minDose * weight) / concentration;
                const maxVolume = (maxDose * weight) / concentration;

                return {
                    isRange: true,
                    minDose: minDose,
                    maxDose: maxDose,
                    minResult: minVolume.toFixed(2),
                    maxResult: maxVolume.toFixed(2),
                    unit: 'ml',
                    minTotalMg: minDose * weight,
                    maxTotalMg: maxDose * weight
                };
            } else {
                // Mass calculation (tablets)
                return {
                    isRange: true,
                    minDose: minDose,
                    maxDose: maxDose,
                    minResult: (minDose * weight).toFixed(2),
                    maxResult: (maxDose * weight).toFixed(2),
                    unit: 'mg total',
                    minTotalMg: minDose * weight,
                    maxTotalMg: maxDose * weight
                };
            }
        } else {
            // Single dose value
            const totalMg = dose * weight;

            if (calculationType === 'volume' && concentration) {
                const volume = totalMg / concentration;
                return {
                    isRange: false,
                    dose: dose,
                    result: volume.toFixed(2),
                    unit: 'ml',
                    totalMg: totalMg
                };
            } else {
                return {
                    isRange: false,
                    dose: dose,
                    result: totalMg.toFixed(2),
                    unit: 'mg total',
                    totalMg: totalMg
                };
            }
        }
    }

    formatWeight() {
        // Format weight for display in calculation breakdown
        if (this.weightUnit === 'g') {
            return `${(this.weight * 1000).toFixed(0)}g (${this.weight.toFixed(2)} kg)`;
        }
        return `${this.weight.toFixed(2)} kg`;
    }

    renderCalculationBreakdown(dose, speciesData, calculation) {
        const container = document.getElementById('calculation-steps');
        const concentration = this.selectedDrug.concentrationValue;
        const concentrationUnit = this.selectedDrug.concentrationUnit;

        let html = '';

        if (calculation.isRange) {
            html += `
                <div class="calc-step">
                    <span class="calc-label">Patient weight:</span>
                    <span class="calc-value">${this.formatWeight()}</span>
                </div>
                <div class="calc-step">
                    <span class="calc-label">Dose range:</span>
                    <span class="calc-value">${calculation.minDose} - ${calculation.maxDose} mg/kg</span>
                </div>
            `;

            if (calculation.unit === 'ml') {
                html += `
                    <div class="calc-step">
                        <span class="calc-label">Concentration:</span>
                        <span class="calc-value">${concentration} ${concentrationUnit}</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Min dose calculation:</span>
                        <span class="calc-value">(${calculation.minDose} × ${this.weight.toFixed(2)}) ÷ ${concentration}</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Min total mg:</span>
                        <span class="calc-value">${calculation.minTotalMg.toFixed(2)} mg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Min volume:</span>
                        <span class="calc-value">${calculation.minResult} ml</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Max dose calculation:</span>
                        <span class="calc-value">(${calculation.maxDose} × ${this.weight.toFixed(2)}) ÷ ${concentration}</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Max total mg:</span>
                        <span class="calc-value">${calculation.maxTotalMg.toFixed(2)} mg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Max volume:</span>
                        <span class="calc-value">${calculation.maxResult} ml</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="calc-step">
                        <span class="calc-label">Min calculation:</span>
                        <span class="calc-value">${calculation.minDose} mg/kg × ${this.weight.toFixed(2)} kg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Min total dose:</span>
                        <span class="calc-value">${calculation.minResult} mg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Max calculation:</span>
                        <span class="calc-value">${calculation.maxDose} mg/kg × ${this.weight.toFixed(2)} kg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Max total dose:</span>
                        <span class="calc-value">${calculation.maxResult} mg</span>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="calc-step">
                    <span class="calc-label">Patient weight:</span>
                    <span class="calc-value">${this.formatWeight()}</span>
                </div>
                <div class="calc-step">
                    <span class="calc-label">Dose rate:</span>
                    <span class="calc-value">${calculation.dose} mg/kg</span>
                </div>
            `;

            if (calculation.unit === 'ml') {
                html += `
                    <div class="calc-step">
                        <span class="calc-label">Concentration:</span>
                        <span class="calc-value">${concentration} ${concentrationUnit}</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Total mg required:</span>
                        <span class="calc-value">${calculation.dose} × ${this.weight.toFixed(2)} = ${calculation.totalMg.toFixed(2)} mg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Volume calculation:</span>
                        <span class="calc-value">${calculation.totalMg.toFixed(2)} ÷ ${concentration} = ${calculation.result} ml</span>
                    </div>
                `;
            } else {
                html += `
                    <div class="calc-step">
                        <span class="calc-label">Calculation:</span>
                        <span class="calc-value">${calculation.dose} mg/kg × ${this.weight.toFixed(2)} kg</span>
                    </div>
                    <div class="calc-step">
                        <span class="calc-label">Total dose:</span>
                        <span class="calc-value">${calculation.result} mg</span>
                    </div>
                `;
            }
        }

        // Add route and frequency
        html += `
            <div class="calc-step" style="border-top: 2px solid rgba(255,255,255,0.3); margin-top: 0.5rem; padding-top: 0.75rem;">
                <span class="calc-label">Route:</span>
                <span class="calc-value">${speciesData.route}</span>
            </div>
            <div class="calc-step">
                <span class="calc-label">Frequency:</span>
                <span class="calc-value">${speciesData.frequency}</span>
            </div>
        `;

        // Add loading dose if applicable
        if (speciesData.loadingDose) {
            const loadingMg = speciesData.loadingDose * this.weight;
            let loadingDisplay;

            if (calculation.unit === 'ml' && concentration) {
                const loadingMl = loadingMg / concentration;
                loadingDisplay = `${loadingMl.toFixed(2)} ml (${loadingMg.toFixed(2)} mg)`;
            } else {
                loadingDisplay = `${loadingMg.toFixed(2)} mg`;
            }

            html += `
                <div class="calc-step" style="background: rgba(244, 162, 97, 0.3); margin: 0.5rem -0.5rem; padding: 0.75rem;">
                    <span class="calc-label">Loading dose (day 1):</span>
                    <span class="calc-value">${loadingDisplay}</span>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    renderNotes(speciesData) {
        const container = document.getElementById('result-notes');

        if (!speciesData.notes || speciesData.notes.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        let html = '<strong>Important Notes:</strong><ul>';
        speciesData.notes.forEach(note => {
            html += `<li>${note}</li>`;
        });
        html += '</ul>';

        container.innerHTML = html;
    }

    hideResult() {
        const resultSection = document.getElementById('result-section');
        resultSection.style.display = 'none';
    }
}

// Initialize app
const app = new VetCalcApp();
