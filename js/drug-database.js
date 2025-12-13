/**
 * VetCalc - UK Veterinary Drug Database
 * Version 1.0.0
 *
 * IMPORTANT: All dosages should be verified against current product datasheets.
 * This database is for reference only and professional judgement must be applied.
 *
 * Dosage sources: BSAVA Small Animal Formulary, VMD product literature
 */

const APP_VERSION = '2.7.0';

const DRUG_DATABASE = {
    // Drug categories with Lucide icons
    categories: [
        {
            id: 'pain_relief',
            name: 'Pain Relief',
            // Lucide: pill
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>'
        },
        {
            id: 'antibiotics',
            name: 'Antibiotics',
            // Lucide: shield-plus
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>'
        },
        {
            id: 'sedation',
            name: 'Sedation',
            // Lucide: moon
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
        },
        {
            id: 'anaesthesia',
            name: 'Anaesthesia',
            // Lucide: syringe
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>'
        },
        {
            id: 'emergency',
            name: 'Emergency',
            // Lucide: heart-pulse
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>'
        },
        {
            id: 'gi',
            name: 'GI',
            // Lucide: salad (digestive)
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/></svg>'
        }
    ],

    // Species-specific weight presets (kg)
    weightPresets: {
        dog: [5, 10, 15, 20, 25, 30, 35, 40],
        cat: [2, 3, 4, 5, 6, 7, 8],
        rabbit: [1, 1.5, 2, 2.5, 3, 4, 5],
        guinea_pig: [0.5, 0.7, 0.9, 1.0, 1.2],
        hamster: [0.03, 0.04, 0.05, 0.1, 0.15],
        ferret: [0.5, 0.7, 1.0, 1.5, 2.0],
        rat: [0.2, 0.3, 0.4, 0.5, 0.6]
    },

    // Species display names
    speciesNames: {
        dog: 'Dog',
        cat: 'Cat',
        rabbit: 'Rabbit',
        guinea_pig: 'Guinea Pig',
        hamster: 'Hamster',
        ferret: 'Ferret',
        rat: 'Rat'
    },

    /**
     * Drug definitions
     * Each drug contains:
     * - name: Drug name
     * - category: Category ID
     * - concentration: Drug concentration with unit
     * - concentrationValue: Numeric concentration (mg/ml or %)
     * - concentrationUnit: Unit (mg/ml, %, etc.)
     * - species: Object with species-specific dosing
     *   - dose: Dose in mg/kg (or range as [min, max])
     *   - route: Administration route
     *   - frequency: Dosing frequency
     *   - notes: Important notes
     *   - calculationType: 'volume' for ml output, 'mass' for mg output
     */
    drugs: [
        // ============================================
        // PAIN RELIEF / NSAIDs
        // ============================================
        {
            id: 'meloxicam_oral',
            name: 'Meloxicam (Metacam) Oral',
            category: 'pain_relief',
            concentration: '1.5 mg/ml',
            concentrationValue: 1.5,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.1,
                    loadingDose: 0.2,
                    route: 'PO',
                    frequency: 'Once daily',
                    notes: [
                        'Loading dose: 0.2 mg/kg on day 1',
                        'Maintenance: 0.1 mg/kg once daily',
                        'Give with food',
                        'Avoid in renal/hepatic disease'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.05,
                    loadingDose: 0.1,
                    route: 'PO',
                    frequency: 'Once daily',
                    notes: [
                        'Loading dose: 0.1 mg/kg on day 1',
                        'Maintenance: 0.05 mg/kg once daily',
                        'Use cat-specific 0.5mg/ml formulation preferred',
                        'Maximum 5 days unless chronic pain protocol',
                        'Ensure adequate hydration'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'meloxicam_cat',
            name: 'Meloxicam (Metacam) Cat Oral',
            category: 'pain_relief',
            concentration: '0.5 mg/ml',
            concentrationValue: 0.5,
            concentrationUnit: 'mg/ml',
            species: {
                cat: {
                    dose: 0.05,
                    loadingDose: 0.1,
                    route: 'PO',
                    frequency: 'Once daily',
                    notes: [
                        'Loading dose: 0.1 mg/kg on day 1',
                        'Maintenance: 0.05 mg/kg once daily',
                        'Cat-specific formulation',
                        'Ensure adequate hydration'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'meloxicam_inj',
            name: 'Meloxicam (Metacam) Injectable',
            category: 'pain_relief',
            concentration: '5 mg/ml',
            concentrationValue: 5,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.2,
                    route: 'SC/IV',
                    frequency: 'Single dose',
                    notes: [
                        'Initial injection only',
                        'Follow with oral maintenance',
                        'IV: give slowly'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.3,
                    route: 'SC',
                    frequency: 'Single dose',
                    notes: [
                        'Single perioperative dose only',
                        'Do not repeat injection in cats',
                        'Follow with oral if needed'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.3,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Can be used for longer periods in rabbits',
                        'Monitor appetite and faecal output'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 0.5,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Higher dose required in guinea pigs',
                        'Monitor for GI stasis'
                    ],
                    calculationType: 'volume'
                },
                hamster: {
                    dose: 0.2,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Use for post-operative analgesia',
                        'Monitor for GI stasis'
                    ],
                    calculationType: 'volume'
                },
                ferret: {
                    dose: 0.2,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Effective NSAID for ferrets',
                        'Monitor for GI side effects'
                    ],
                    calculationType: 'volume'
                },
                rat: {
                    dose: 1,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Higher dose in rats',
                        'Good post-operative analgesia'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'carprofen',
            name: 'Carprofen (Rimadyl) Injectable',
            category: 'pain_relief',
            concentration: '50 mg/ml',
            concentrationValue: 50,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 4,
                    route: 'SC/IV',
                    frequency: 'Once daily or divided BID',
                    notes: [
                        'Can divide into 2mg/kg BID',
                        'IV: give slowly',
                        'Perioperative analgesia'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 4,
                    route: 'SC/IV',
                    frequency: 'Single dose',
                    notes: [
                        'Single perioperative dose only',
                        'Not licensed for repeat dosing in cats UK'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'carprofen_oral',
            name: 'Carprofen (Rimadyl) Tablets',
            category: 'pain_relief',
            concentration: 'Tablets: 20mg, 50mg, 100mg',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: 4,
                    route: 'PO',
                    frequency: 'Once daily or divided BID',
                    notes: [
                        'Can give as 2mg/kg twice daily',
                        'Give with food',
                        'Available as 20mg, 50mg, 100mg tablets'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'buprenorphine',
            name: 'Buprenorphine (Vetergesic)',
            category: 'pain_relief',
            concentration: '0.3 mg/ml',
            concentrationValue: 0.3,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.02,
                    route: 'IV/IM/SC',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'Partial mu-opioid agonist',
                        'Good visceral analgesia',
                        'Can give buccal/sublingual',
                        'Ceiling effect - higher doses do not increase analgesia'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.02,
                    route: 'IV/IM/OTM',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'Excellent option for cats',
                        'OTM (oral transmucosal) very effective',
                        'Longer duration in cats (up to 12h)',
                        'Good for moderate pain'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.05,
                    route: 'SC/IV',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'Higher dose required in rabbits',
                        'Essential for post-operative analgesia',
                        'Monitor GI motility'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 0.05,
                    route: 'SC',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'Important for surgical pain',
                        'Monitor appetite closely'
                    ],
                    calculationType: 'volume'
                },
                rat: {
                    dose: 0.05,
                    route: 'SC',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'Standard opioid for rat analgesia'
                    ],
                    calculationType: 'volume'
                },
                ferret: {
                    dose: 0.03,
                    route: 'SC/IM',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'Good post-operative option'
                    ],
                    calculationType: 'volume'
                },
                hamster: {
                    dose: 0.05,
                    route: 'SC',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'Essential for post-operative pain',
                        'Monitor for respiratory depression'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'methadone',
            name: 'Methadone (Comfortan)',
            category: 'pain_relief',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.3,
                    route: 'IV/IM/SC',
                    frequency: 'Every 4 hours',
                    notes: [
                        'Full mu-agonist opioid',
                        'Excellent premedication',
                        'NMDA antagonist activity',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.3,
                    route: 'IV/IM',
                    frequency: 'Every 4-6 hours',
                    notes: [
                        'Excellent premedication for cats',
                        'May cause euphoria/dysphoria',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'tramadol',
            name: 'Tramadol',
            category: 'pain_relief',
            concentration: 'Capsules: 50mg',
            concentrationValue: null,
            concentrationUnit: 'capsule',
            species: {
                dog: {
                    dose: [2, 5],
                    route: 'PO',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'Weak opioid + monoaminergic action',
                        'Variable efficacy in dogs',
                        'Useful adjunct to NSAIDs',
                        'Available as 50mg capsules'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: [2, 4],
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'More effective in cats than dogs',
                        'Bitter taste - may need compounding',
                        'Can cause sedation'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'gabapentin',
            name: 'Gabapentin',
            category: 'pain_relief',
            concentration: 'Capsules: 100mg, 300mg',
            concentrationValue: null,
            concentrationUnit: 'capsule',
            species: {
                dog: {
                    dose: [5, 10],
                    route: 'PO',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'Neuropathic pain adjunct',
                        'Start low, titrate up',
                        'Useful for chronic pain',
                        'May cause sedation initially'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: [5, 10],
                    route: 'PO',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'Excellent for chronic/neuropathic pain',
                        'Also useful as anxiolytic pre-visit',
                        'Single 50-100mg dose pre-vet visit for anxious cats',
                        'Sedation common initially'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'paracetamol_dog',
            name: 'Paracetamol (Pardale-V)',
            category: 'pain_relief',
            concentration: 'Tablets: 400mg paracetamol + 9mg codeine',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: 10,
                    route: 'PO',
                    frequency: 'Every 8 hours',
                    notes: [
                        'DOGS ONLY - TOXIC TO CATS',
                        '10mg/kg paracetamol component',
                        'Pardale-V = 400mg paracetamol + 9mg codeine',
                        'Maximum 5 days treatment',
                        'Do not exceed 3 doses per 24 hours'
                    ],
                    calculationType: 'mass'
                }
            }
        },

        // ============================================
        // ANTIBIOTICS
        // ============================================
        {
            id: 'amoxicillin_clav',
            name: 'Amoxicillin/Clavulanate (Synulox)',
            category: 'antibiotics',
            concentration: '50 mg/ml (40mg amox + 10mg clav)',
            concentrationValue: 50,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 12.5,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Broad spectrum',
                        'Good first-line antibiotic',
                        'Injection can be repeated for up to 5 days'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 12.5,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Broad spectrum',
                        'Good first-line antibiotic',
                        'Injection can be repeated for up to 5 days'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 12.5,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Caution: can disrupt GI flora',
                        'Monitor for dysbiosis',
                        'Consider alternatives if oral antibiotic needed'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'amoxicillin_clav_oral',
            name: 'Amoxicillin/Clavulanate Tablets',
            category: 'antibiotics',
            concentration: 'Tablets: 50mg, 250mg, 500mg',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: 12.5,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Give with food',
                        'Complete full course',
                        'Available as 50mg, 250mg, 500mg tablets'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: 12.5,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Palatable tablets available',
                        'Complete full course'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'metronidazole',
            name: 'Metronidazole',
            category: 'antibiotics',
            concentration: 'Tablets: 200mg, 400mg',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: [10, 15],
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Anaerobic bacteria and protozoa',
                        'Good for GI infections',
                        'Can cause neurological signs at high doses',
                        'Bitter taste'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: [10, 15],
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Very bitter - difficult to administer',
                        'Consider compounded formulation',
                        'Useful for giardia'
                    ],
                    calculationType: 'mass'
                },
                rabbit: {
                    dose: 20,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Safe for rabbits',
                        'Useful for anaerobic infections'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'enrofloxacin',
            name: 'Enrofloxacin (Baytril)',
            category: 'antibiotics',
            concentration: '25 mg/ml',
            concentrationValue: 25,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 5,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Fluoroquinolone - reserve antibiotic',
                        'Avoid in young growing animals',
                        'Good tissue penetration'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 5,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Risk of retinal toxicity in cats',
                        'Do not exceed 5mg/kg',
                        'Avoid rapid IV administration'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 10,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Higher dose in rabbits',
                        'Good for respiratory infections',
                        'Safe long-term use'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 10,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Commonly used in guinea pigs',
                        'Good for respiratory infections'
                    ],
                    calculationType: 'volume'
                },
                rat: {
                    dose: 10,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Useful for respiratory disease'
                    ],
                    calculationType: 'volume'
                },
                hamster: {
                    dose: 10,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Good for respiratory and skin infections',
                        'Dilute for accurate dosing in small patients'
                    ],
                    calculationType: 'volume'
                },
                ferret: {
                    dose: 5,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Commonly used antibiotic in ferrets',
                        'Good tissue penetration'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'marbofloxacin',
            name: 'Marbofloxacin (Marbocyl)',
            category: 'antibiotics',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 2,
                    route: 'SC/IV/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Fluoroquinolone',
                        'Good urinary tract penetration',
                        'Avoid in young animals'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 2,
                    route: 'SC/PO',
                    frequency: 'Once daily',
                    notes: [
                        'Preferred fluoroquinolone for cats',
                        'Lower retinal toxicity risk than enrofloxacin'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'cefalexin',
            name: 'Cefalexin (Ceporex)',
            category: 'antibiotics',
            concentration: 'Tablets: 75mg, 250mg, 500mg',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: [15, 30],
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'First generation cephalosporin',
                        'Good for skin infections',
                        'Bactericidal'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: [15, 30],
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Good for skin infections',
                        'Palatable tablets available'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'doxycycline',
            name: 'Doxycycline',
            category: 'antibiotics',
            concentration: 'Tablets/Capsules: 20mg, 50mg, 100mg',
            concentrationValue: null,
            concentrationUnit: 'tablet',
            species: {
                dog: {
                    dose: 5,
                    route: 'PO',
                    frequency: 'Every 12 hours (or 10mg/kg once daily)',
                    notes: [
                        'Good for respiratory, tick-borne diseases',
                        'Give with food to reduce GI upset',
                        'Avoid in young animals (teeth staining)'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: 5,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Risk of oesophageal stricture - give with water/food',
                        'Good for respiratory infections',
                        'Follow with water bolus'
                    ],
                    calculationType: 'mass'
                },
                rabbit: {
                    dose: 5,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Safe for rabbits',
                        'Good for respiratory infections'
                    ],
                    calculationType: 'mass'
                },
                rat: {
                    dose: 5,
                    route: 'PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Commonly used for respiratory infections',
                        'Can add to water (though less reliable dosing)'
                    ],
                    calculationType: 'mass'
                }
            }
        },

        // ============================================
        // SEDATION
        // ============================================
        {
            id: 'medetomidine',
            name: 'Medetomidine (Domitor)',
            category: 'sedation',
            concentration: '1 mg/ml',
            concentrationValue: 1,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: [0.01, 0.04],
                    route: 'IV/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Alpha-2 agonist',
                        'Reverse with atipamezole',
                        'Causes bradycardia and vasoconstriction',
                        'Reduce dose in combination protocols'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: [0.02, 0.08],
                    route: 'IM',
                    frequency: 'Single dose',
                    notes: [
                        'Higher doses for deeper sedation',
                        'Reverse with atipamezole',
                        'Causes vomiting in cats - may be useful pre-GA'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.25,
                    route: 'SC/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Combine with ketamine for surgical anaesthesia',
                        'Always reverse with atipamezole'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'dexmedetomidine',
            name: 'Dexmedetomidine (Dexdomitor)',
            category: 'sedation',
            concentration: '0.5 mg/ml',
            concentrationValue: 0.5,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: [0.005, 0.02],
                    route: 'IV/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Active enantiomer of medetomidine',
                        'Half the dose of medetomidine',
                        'Reverse with atipamezole (half dose)'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: [0.01, 0.04],
                    route: 'IM',
                    frequency: 'Single dose',
                    notes: [
                        'Half the dose of medetomidine',
                        'Good sedation in healthy cats',
                        'Reverse with atipamezole'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'atipamezole',
            name: 'Atipamezole (Antisedan)',
            category: 'sedation',
            concentration: '5 mg/ml',
            concentrationValue: 5,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.2,
                    route: 'IM',
                    frequency: 'Single dose',
                    notes: [
                        'Alpha-2 antagonist (reversal)',
                        'Give same volume as medetomidine used',
                        'Half volume if reversing dexmedetomidine',
                        'Can give IV in emergency (slowly)'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.2,
                    route: 'IM',
                    frequency: 'Single dose',
                    notes: [
                        'Give same volume as medetomidine',
                        'Wait for effect (5-10 mins IM)'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 1,
                    route: 'SC/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Essential reversal in rabbits',
                        'Give same volume as medetomidine'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'acepromazine',
            name: 'Acepromazine (ACP)',
            category: 'sedation',
            concentration: '2 mg/ml',
            concentrationValue: 2,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: [0.01, 0.05],
                    route: 'IV/IM/SC',
                    frequency: 'Single dose',
                    notes: [
                        'Phenothiazine - no reversal',
                        'Causes hypotension',
                        'No analgesic properties',
                        'Useful premed when combined with opioid',
                        'Avoid in boxers, epileptics'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: [0.05, 0.1],
                    route: 'IM/SC',
                    frequency: 'Single dose',
                    notes: [
                        'Useful premed in healthy cats',
                        'No reversal available',
                        'Causes hypotension'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'butorphanol',
            name: 'Butorphanol (Torbugesic)',
            category: 'sedation',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.2,
                    route: 'IV/IM/SC',
                    frequency: 'Every 2-4 hours',
                    notes: [
                        'Partial agonist/antagonist opioid',
                        'Sedative properties',
                        'Short duration of action',
                        'Good for visceral pain'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.2,
                    route: 'IV/IM/SC',
                    frequency: 'Every 2-4 hours',
                    notes: [
                        'Useful premed in cats',
                        'Short acting',
                        'Good sedative component'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.5,
                    route: 'SC/IM',
                    frequency: 'Every 4 hours',
                    notes: [
                        'Useful premed',
                        'Can use post-operatively'
                    ],
                    calculationType: 'volume'
                }
            }
        },

        // ============================================
        // ANAESTHESIA
        // ============================================
        {
            id: 'ketamine',
            name: 'Ketamine',
            category: 'anaesthesia',
            concentration: '100 mg/ml',
            concentrationValue: 100,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 5,
                    route: 'IV',
                    frequency: 'To effect',
                    notes: [
                        'Dissociative anaesthetic',
                        'Use with sedative/muscle relaxant',
                        'NMDA antagonist - good co-analgesic',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 5,
                    route: 'IV/IM',
                    frequency: 'To effect',
                    notes: [
                        'Combine with medetomidine or midazolam',
                        'Preserves laryngeal reflexes',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 15,
                    route: 'IM/IV',
                    frequency: 'Single dose',
                    notes: [
                        'Always combine with medetomidine',
                        'Rabbit ketamine/medetomidine IM protocol common',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 40,
                    route: 'IM',
                    frequency: 'Single dose',
                    notes: [
                        'Combine with medetomidine or xylazine',
                        'High dose required',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                rat: {
                    dose: 75,
                    route: 'IP/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Combine with medetomidine or xylazine',
                        'IP injection common in rodents',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                },
                hamster: {
                    dose: 100,
                    route: 'IP',
                    frequency: 'Single dose',
                    notes: [
                        'High dose required',
                        'Combine with medetomidine',
                        'CD Schedule 2 controlled drug'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'alfaxalone',
            name: 'Alfaxalone (Alfaxan)',
            category: 'anaesthesia',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 2,
                    route: 'IV',
                    frequency: 'To effect',
                    notes: [
                        'Give to effect over 60 seconds',
                        'Reduce dose by 40-50% if premedicated',
                        'Good induction agent',
                        'Rapid metabolism'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 5,
                    route: 'IV/IM',
                    frequency: 'To effect',
                    notes: [
                        'Can give IM for fractious cats',
                        'IV: give to effect',
                        'Reduce if premedicated',
                        'Very useful in cats'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 3,
                    route: 'IV',
                    frequency: 'To effect',
                    notes: [
                        'Give slowly IV',
                        'Useful induction agent',
                        'Can top up for short procedures'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 10,
                    route: 'IM/IP',
                    frequency: 'Single dose',
                    notes: [
                        'Useful alternative to ketamine'
                    ],
                    calculationType: 'volume'
                },
                ferret: {
                    dose: 5,
                    route: 'IV/IM',
                    frequency: 'To effect',
                    notes: [
                        'Good induction agent for ferrets'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'propofol',
            name: 'Propofol (Rapinovet)',
            category: 'anaesthesia',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 4,
                    route: 'IV',
                    frequency: 'To effect',
                    notes: [
                        'Give slowly to effect',
                        'Reduce dose if premedicated',
                        'Apnoea common - be prepared to intubate',
                        'Short duration - TIVA possible'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 6,
                    route: 'IV',
                    frequency: 'To effect',
                    notes: [
                        'Give slowly IV',
                        'NOT for repeated dosing/infusion in cats',
                        'Single use only (Heinz body anaemia risk)'
                    ],
                    calculationType: 'volume'
                }
            }
        },

        // ============================================
        // EMERGENCY
        // ============================================
        {
            id: 'adrenaline',
            name: 'Adrenaline (Epinephrine)',
            category: 'emergency',
            concentration: '1 mg/ml (1:1000)',
            concentrationValue: 1,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.01,
                    route: 'IV/IT',
                    frequency: 'Every 3-5 minutes during CPR',
                    notes: [
                        'Cardiac arrest/CPR',
                        'Anaphylaxis: 0.01 mg/kg IM',
                        'Low dose: 0.01 mg/kg',
                        'High dose: 0.1 mg/kg (rarely used)',
                        'IT dose: dilute and give 2x IV dose'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.01,
                    route: 'IV/IT',
                    frequency: 'Every 3-5 minutes during CPR',
                    notes: [
                        'Cardiac arrest/anaphylaxis',
                        'Same protocol as dogs'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.01,
                    route: 'IV/IT',
                    frequency: 'During CPR',
                    notes: [
                        'Cardiac arrest',
                        'Difficult to achieve ROSC in rabbits'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'atropine',
            name: 'Atropine',
            category: 'emergency',
            concentration: '0.6 mg/ml',
            concentrationValue: 0.6,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.04,
                    route: 'IV/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Anticholinergic',
                        'Bradycardia treatment',
                        'CPR: 0.04 mg/kg IV',
                        'May need to repeat'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.04,
                    route: 'IV/IM',
                    frequency: 'Single dose',
                    notes: [
                        'Bradycardia treatment',
                        'Premed in some protocols'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.05,
                    route: 'IV/SC',
                    frequency: 'Single dose',
                    notes: [
                        'Note: 50% of rabbits have atropinase',
                        'May not be effective - try glycopyrrolate'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'dexamethasone',
            name: 'Dexamethasone',
            category: 'emergency',
            concentration: '2 mg/ml',
            concentrationValue: 2,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: [0.1, 0.5],
                    route: 'IV/IM',
                    frequency: 'Once daily',
                    notes: [
                        'Anti-inflammatory: 0.1-0.2 mg/kg',
                        'Shock/emergency: 0.5-1 mg/kg',
                        'Long-acting corticosteroid',
                        'Avoid in diabetics'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: [0.1, 0.5],
                    route: 'IV/IM',
                    frequency: 'Once daily',
                    notes: [
                        'Anti-inflammatory use',
                        'Higher doses for emergencies'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.2,
                    route: 'IV/IM/SC',
                    frequency: 'Once daily',
                    notes: [
                        'Use with caution',
                        'Can cause immunosuppression'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'furosemide',
            name: 'Furosemide (Frusedale)',
            category: 'emergency',
            concentration: '50 mg/ml',
            concentrationValue: 50,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: [2, 4],
                    route: 'IV/IM',
                    frequency: 'Every 6-12 hours',
                    notes: [
                        'Loop diuretic',
                        'Pulmonary oedema: 2-4 mg/kg',
                        'Can give up to 4mg/kg IV initially',
                        'Monitor hydration and electrolytes'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: [1, 2],
                    route: 'IV/IM',
                    frequency: 'Every 6-12 hours',
                    notes: [
                        'Cats more sensitive - use lower doses',
                        'Essential for CHF/pulmonary oedema',
                        'Monitor for dehydration'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'naloxone',
            name: 'Naloxone',
            category: 'emergency',
            concentration: '0.4 mg/ml',
            concentrationValue: 0.4,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.04,
                    route: 'IV/IM/SC',
                    frequency: 'Can repeat every 2-3 minutes',
                    notes: [
                        'Opioid antagonist',
                        'Reverses all opioids',
                        'Short duration - may need repeat',
                        'Dilute and titrate if partial reversal needed'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.04,
                    route: 'IV/IM/SC',
                    frequency: 'Can repeat every 2-3 minutes',
                    notes: [
                        'Full opioid reversal',
                        'Will reverse analgesia'
                    ],
                    calculationType: 'volume'
                }
            }
        },

        // ============================================
        // GI MEDICATIONS
        // ============================================
        {
            id: 'metoclopramide',
            name: 'Metoclopramide (Emeprid)',
            category: 'gi',
            concentration: '5 mg/ml',
            concentrationValue: 5,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 0.5,
                    route: 'IV/IM/SC',
                    frequency: 'Every 8 hours',
                    notes: [
                        'Prokinetic and antiemetic',
                        'Can give as CRI: 1-2 mg/kg/day',
                        'Avoid in GI obstruction'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 0.5,
                    route: 'IV/SC',
                    frequency: 'Every 8 hours',
                    notes: [
                        'Prokinetic properties',
                        'Less effective antiemetic in cats',
                        'Consider maropitant for vomiting'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 0.5,
                    route: 'SC',
                    frequency: 'Every 6-8 hours',
                    notes: [
                        'GI stasis treatment',
                        'Important prokinetic in rabbits'
                    ],
                    calculationType: 'volume'
                },
                guinea_pig: {
                    dose: 0.5,
                    route: 'SC',
                    frequency: 'Every 8 hours',
                    notes: [
                        'GI stasis support'
                    ],
                    calculationType: 'volume'
                },
                hamster: {
                    dose: 0.5,
                    route: 'SC',
                    frequency: 'Every 8 hours',
                    notes: [
                        'GI stasis support',
                        'Important for post-operative recovery'
                    ],
                    calculationType: 'volume'
                },
                rat: {
                    dose: 0.5,
                    route: 'SC',
                    frequency: 'Every 8 hours',
                    notes: [
                        'Prokinetic for GI stasis'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'maropitant',
            name: 'Maropitant (Cerenia)',
            category: 'gi',
            concentration: '10 mg/ml',
            concentrationValue: 10,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 1,
                    route: 'SC/IV',
                    frequency: 'Once daily',
                    notes: [
                        'NK1 receptor antagonist',
                        'Excellent antiemetic',
                        'May sting on SC injection',
                        'Can give for up to 5 consecutive days'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 1,
                    route: 'SC/IV',
                    frequency: 'Once daily',
                    notes: [
                        'Very effective antiemetic in cats',
                        'First line for vomiting',
                        'Safe and well tolerated'
                    ],
                    calculationType: 'volume'
                },
                ferret: {
                    dose: 1,
                    route: 'SC',
                    frequency: 'Once daily',
                    notes: [
                        'Useful for nausea/vomiting'
                    ],
                    calculationType: 'volume'
                }
            }
        },
        {
            id: 'omeprazole',
            name: 'Omeprazole',
            category: 'gi',
            concentration: 'Capsules: 10mg, 20mg',
            concentrationValue: null,
            concentrationUnit: 'capsule',
            species: {
                dog: {
                    dose: 1,
                    route: 'PO',
                    frequency: 'Once daily (give before food)',
                    notes: [
                        'Proton pump inhibitor',
                        'Gastric ulcers/acid reflux',
                        'Give 30 mins before food',
                        'Do not crush enteric coated tablets'
                    ],
                    calculationType: 'mass'
                },
                cat: {
                    dose: 1,
                    route: 'PO',
                    frequency: 'Once daily',
                    notes: [
                        'Gastric protection',
                        'Give before food'
                    ],
                    calculationType: 'mass'
                },
                ferret: {
                    dose: 1,
                    route: 'PO',
                    frequency: 'Once daily',
                    notes: [
                        'Useful for GI ulceration',
                        'Helicobacter treatment adjunct'
                    ],
                    calculationType: 'mass'
                }
            }
        },
        {
            id: 'ranitidine',
            name: 'Ranitidine (Zantac)',
            category: 'gi',
            concentration: '25 mg/ml injection',
            concentrationValue: 25,
            concentrationUnit: 'mg/ml',
            species: {
                dog: {
                    dose: 2,
                    route: 'IV/SC/PO',
                    frequency: 'Every 8-12 hours',
                    notes: [
                        'H2 receptor antagonist',
                        'Prokinetic properties',
                        'Less potent than omeprazole'
                    ],
                    calculationType: 'volume'
                },
                cat: {
                    dose: 2,
                    route: 'IV/SC/PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Useful gastric protectant',
                        'Also has prokinetic effect'
                    ],
                    calculationType: 'volume'
                },
                rabbit: {
                    dose: 5,
                    route: 'SC/PO',
                    frequency: 'Every 12 hours',
                    notes: [
                        'Gastric support',
                        'Prokinetic in rabbits'
                    ],
                    calculationType: 'volume'
                }
            }
        }
    ]
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DRUG_DATABASE;
}
