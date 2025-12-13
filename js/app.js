/**
 * VetCalc - UK Veterinary Drug Calculator
 * Main Application Logic
 */

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
    new VetCalcApp();
});

class VetCalcApp {
    constructor() {
        this.selectedSpecies = null;
        this.selectedDrug = null;
        this.weight = null; // Always stored in kg internally
        this.weightUnit = 'kg'; // 'kg' or 'g'
        this.activeCategory = 'pain_relief'; // Start with pain relief
        this.weightManuallySet = false; // Track if user has manually updated weight

        // Species that typically use grams
        this.smallAnimals = ['hamster', 'rat', 'guinea_pig'];

        // Average weights for each species (in kg)
        this.averageWeights = {
            dog: 15,
            cat: 4,
            rabbit: 2,
            guinea_pig: 0.9,
            hamster: 0.04,
            ferret: 1,
            rat: 0.4
        };

        this.setup();
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

        // Set splash version
        const splashVersionEl = document.getElementById('splash-version');
        if (splashVersionEl) {
            splashVersionEl.textContent = 'v' + APP_VERSION;
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

        // Hide category and drugs sections initially
        this.updateSectionVisibility();
    }

    updateSectionVisibility() {
        const weightSection = document.getElementById('weight-section');
        const categorySection = document.getElementById('category-section');
        const drugsSection = document.getElementById('drugs-section');

        // Show weight section if species is selected
        if (this.selectedSpecies) {
            weightSection.classList.add('visible');
        } else {
            weightSection.classList.remove('visible');
        }

        // Show category and drugs only if species selected AND weight manually updated
        const shouldShowDrugs = this.selectedSpecies && this.weight && this.weightManuallySet;

        if (shouldShowDrugs) {
            categorySection.classList.add('visible');
            drugsSection.classList.add('visible');
        } else {
            categorySection.classList.remove('visible');
            drugsSection.classList.remove('visible');
        }
    }

    animateValue(element, newValue) {
        const oldValue = element.textContent;
        if (oldValue !== newValue) {
            element.classList.remove('slide-up');
            // Force reflow to restart animation
            void element.offsetWidth;
            element.textContent = newValue;
            element.classList.add('slide-up');
            setTimeout(() => element.classList.remove('slide-up'), 250);
        }
    }

    updateSelectionInfo() {
        const infoBar = document.getElementById('selection-info');
        const spacer = document.getElementById('selection-info-spacer');
        const speciesDisplay = document.getElementById('selected-species-display');
        const weightDisplay = document.getElementById('selected-weight-display');
        const drugDisplay = document.getElementById('selected-drug-display');
        const speciesColumn = document.getElementById('species-column');
        const weightColumn = document.getElementById('weight-column');
        const drugColumn = document.getElementById('drug-column');

        // Show/hide the entire info bar and spacer based on species selection
        if (this.selectedSpecies) {
            infoBar.classList.add('visible');
            spacer.classList.add('visible');
        } else {
            infoBar.classList.remove('visible');
            spacer.classList.remove('visible');
        }

        // Update species display with animation
        if (this.selectedSpecies) {
            const newValue = DRUG_DATABASE.speciesNames[this.selectedSpecies];
            this.animateValue(speciesDisplay, newValue);
            speciesDisplay.classList.remove('not-set');
        } else {
            this.animateValue(speciesDisplay, '—');
            speciesDisplay.classList.add('not-set');
        }

        // Determine visibility states
        const weightVisible = this.weightManuallySet && this.weight;
        const drugVisible = this.selectedDrug;

        // Show/hide weight column - only show when weight has been manually set
        if (weightVisible) {
            weightColumn.classList.remove('hidden');
            let newValue;
            if (this.weightUnit === 'g') {
                newValue = `${(this.weight * 1000).toFixed(0)}g`;
            } else {
                newValue = `${this.weight.toFixed(1)}kg`;
            }
            this.animateValue(weightDisplay, newValue);
            weightDisplay.classList.remove('not-set');
        } else {
            weightColumn.classList.add('hidden');
        }

        // Show/hide drug column - only show when a drug is selected
        if (drugVisible) {
            drugColumn.classList.remove('hidden');
            this.animateValue(drugDisplay, this.selectedDrug.name);
            drugDisplay.classList.remove('not-set');
        } else {
            drugColumn.classList.add('hidden');
        }

        // Update border visibility - remove right border from last visible column
        speciesColumn.classList.toggle('no-border', !weightVisible && !drugVisible);
        weightColumn.classList.toggle('no-border', !drugVisible);
    }

    setupSpeciesSelection() {
        const speciesGrid = document.getElementById('species-grid');
        const buttons = speciesGrid.querySelectorAll('.species-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const isFirstSelection = !this.selectedSpecies;

                // Remove active from all
                buttons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                this.selectedSpecies = btn.dataset.species;
                this.weightManuallySet = false; // Reset - user needs to confirm/update weight
                this.selectedDrug = null; // Clear selected drug when changing species

                // Auto-switch to grams for small animals
                if (this.smallAnimals.includes(this.selectedSpecies)) {
                    this.setWeightUnit('g');
                } else {
                    this.setWeightUnit('kg');
                }

                // Auto-set average weight for this species
                const avgWeight = this.averageWeights[this.selectedSpecies];
                if (avgWeight) {
                    this.weight = avgWeight;
                    const input = document.getElementById('weight-input');
                    if (this.weightUnit === 'g') {
                        input.value = (avgWeight * 1000).toFixed(0);
                    } else {
                        input.value = avgWeight.toFixed(1);
                    }
                }

                this.updateWeightPresets();
                this.updateSelectionInfo();
                this.renderDrugList();
                this.updateCalculation();

                // Update visibility - weight stays visible, categories/drugs animate out
                if (isFirstSelection) {
                    // First selection - animate everything in
                    this.updateSectionVisibility();
                } else {
                    // Changing species - categories/drugs will animate out (weightManuallySet is false)
                    // Weight stays visible
                    this.updateSectionVisibility();
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Ensure visibility is correct after state changes
                    });
                });
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
            input.step = '0.1';
            input.placeholder = '0.0';
        }

        // Convert displayed value if we have a weight
        if (this.weight !== null) {
            if (unit === 'g') {
                input.value = (this.weight * 1000).toFixed(0);
            } else {
                input.value = this.weight.toFixed(1);
            }
        }

        // Update presets display
        this.updateWeightPresets();
    }

    setupWeightAdjustButtons() {
        const minusBtn = document.getElementById('weight-minus');
        const plusBtn = document.getElementById('weight-plus');
        const input = document.getElementById('weight-input');

        let holdInterval = null;
        let holdTimeout = null;

        // Get increment based on unit
        const getIncrement = () => {
            if (this.weightUnit === 'g') {
                return 1; // 1g increments for small animals
            } else {
                return 0.1; // 0.1kg increments for larger animals
            }
        };

        // Decrease weight
        const decreaseWeight = () => {
            const currentVal = parseFloat(input.value) || 0;
            const increment = getIncrement();
            const newVal = Math.max(0, currentVal - increment);

            if (this.weightUnit === 'g') {
                input.value = newVal.toFixed(0);
                this.weight = newVal / 1000;
            } else {
                input.value = newVal.toFixed(1);
                this.weight = newVal;
            }

            this.weightManuallySet = true; // User manually changed weight

            if (this.weight > 0) {
                this.updateSectionVisibility();
                this.updateSelectionInfo();
                this.renderDrugList();
                this.updateCalculation();
            } else {
                this.weight = null;
                this.updateSectionVisibility();
                this.updateSelectionInfo();
                this.renderDrugList();
                this.hideResult();
            }
        };

        // Increase weight
        const increaseWeight = () => {
            const currentVal = parseFloat(input.value) || 0;
            const increment = getIncrement();
            const newVal = currentVal + increment;

            if (this.weightUnit === 'g') {
                input.value = newVal.toFixed(0);
                this.weight = newVal / 1000;
            } else {
                input.value = newVal.toFixed(1);
                this.weight = newVal;
            }

            this.weightManuallySet = true; // User manually changed weight
            this.updateSectionVisibility();
            this.updateSelectionInfo();
            this.renderDrugList();
            this.updateCalculation();
        };

        // Stop hold repeat
        const stopHold = () => {
            if (holdTimeout) {
                clearTimeout(holdTimeout);
                holdTimeout = null;
            }
            if (holdInterval) {
                clearInterval(holdInterval);
                holdInterval = null;
            }
        };

        // Start hold repeat for a function
        const startHold = (actionFn) => {
            stopHold();
            actionFn(); // Execute immediately
            // Start repeating after initial delay
            holdTimeout = setTimeout(() => {
                holdInterval = setInterval(actionFn, 100); // Repeat every 100ms
            }, 400); // Initial delay before repeating
        };

        // Minus button - touch and hold
        minusBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startHold(decreaseWeight);
        });
        minusBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold(decreaseWeight);
        });
        minusBtn.addEventListener('mouseup', stopHold);
        minusBtn.addEventListener('mouseleave', stopHold);
        minusBtn.addEventListener('touchend', stopHold);
        minusBtn.addEventListener('touchcancel', stopHold);

        // Plus button - touch and hold
        plusBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startHold(increaseWeight);
        });
        plusBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold(increaseWeight);
        });
        plusBtn.addEventListener('mouseup', stopHold);
        plusBtn.addEventListener('mouseleave', stopHold);
        plusBtn.addEventListener('touchend', stopHold);
        plusBtn.addEventListener('touchcancel', stopHold);
    }

    setupWeightInput() {
        const weightInput = document.getElementById('weight-input');

        weightInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.weightManuallySet = true; // User manually changed weight
            if (!isNaN(value) && value > 0) {
                // Convert to kg if input is in grams
                if (this.weightUnit === 'g') {
                    this.weight = value / 1000;
                } else {
                    this.weight = value;
                }
                this.updateSectionVisibility();
                this.updateSelectionInfo();
                this.renderDrugList();
                this.updateCalculation();
            } else {
                this.weight = null;
                this.updateSectionVisibility();
                this.updateSelectionInfo();
                this.renderDrugList();
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
                btn.textContent = `${weightKg.toFixed(1)}kg`;
            }

            btn.addEventListener('click', () => {
                const input = document.getElementById('weight-input');
                if (this.weightUnit === 'g') {
                    input.value = (weightKg * 1000).toFixed(0);
                } else {
                    input.value = weightKg.toFixed(1);
                }
                this.weight = weightKg;
                this.weightManuallySet = true; // User manually selected weight
                this.updateSectionVisibility();
                this.updateSelectionInfo();
                this.renderDrugList();
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
            btn.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
            `;
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

        // Don't render if species and weight aren't selected (section is hidden anyway)
        if (!this.selectedSpecies || !this.weight) {
            return;
        }

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
                <li>
                    <div class="no-drugs">
                        <p>No drugs found${this.selectedSpecies ? ' for ' + DRUG_DATABASE.speciesNames[this.selectedSpecies] : ''}.</p>
                        <p style="font-size: 12px; opacity: 0.7;">Try selecting a different species or category.</p>
                    </div>
                </li>
            `;
            return;
        }

        drugs.forEach(drug => {
            const category = DRUG_DATABASE.categories.find(c => c.id === drug.category);
            const isActive = this.selectedDrug && this.selectedDrug.id === drug.id;

            const li = document.createElement('li');
            li.className = isActive ? 'active-drug' : '';
            li.innerHTML = `
                <a href="#" class="item-link item-content">
                    <div class="item-inner">
                        <div class="item-title-row">
                            <div class="item-title">${drug.name}</div>
                            <div class="item-after">
                                <span class="badge">${category ? category.name : drug.category}</span>
                            </div>
                        </div>
                        <div class="item-subtitle">${drug.concentration}</div>
                    </div>
                </a>
            `;

            li.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active from all
                container.querySelectorAll('li').forEach(i => i.classList.remove('active-drug'));
                li.classList.add('active-drug');
                this.selectedDrug = drug;
                this.updateSelectionInfo();
                this.updateCalculation(true); // Scroll to result when selecting a drug
            });

            container.appendChild(li);
        });
    }

    updateCalculation(shouldScroll = false) {
        if (!this.selectedSpecies || !this.selectedDrug || !this.weight) {
            this.hideResult();
            return;
        }

        const speciesData = this.selectedDrug.species[this.selectedSpecies];
        if (!speciesData) {
            this.hideResult();
            return;
        }

        this.showResult(speciesData, shouldScroll);
    }

    showResult(speciesData, shouldScroll = false) {
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

        // Scroll to result only when explicitly requested (e.g., when selecting a drug)
        if (shouldScroll) {
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
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
            <div class="calc-step" style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 8px; padding-top: 12px;">
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
                <div class="calc-step" style="background: rgba(255, 149, 0, 0.25); margin: 8px -16px -16px; padding: 12px 16px; border-radius: 0 0 12px 12px;">
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
