(function () {
    "use strict";

    const MODES = [
        { name: "Ionian", intervals: [0, 2, 4, 5, 7, 9, 11] },
        { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
        { name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
        { name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11] },
        { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] },
        { name: "Aeolian", intervals: [0, 2, 3, 5, 7, 8, 10] },
        { name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10] },
        { name: "Harmonic minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
        { name: "Melodic minor", intervals: [0, 2, 3, 5, 7, 9, 11] }
    ];

    const CHORD_TYPES = {
        major: { label: "major", family: "major", triad: [0, 4, 7], full: [0, 4, 7] },
        minor: { label: "minor", family: "minor", triad: [0, 3, 7], full: [0, 3, 7] },
        dim: { label: "diminished", family: "dim", triad: [0, 3, 6], full: [0, 3, 6] },
        aug: { label: "augmented", family: "aug", triad: [0, 4, 8], full: [0, 4, 8] },
        sus2: { label: "sus2", family: "sus", triad: [0, 2, 7], full: [0, 2, 7] },
        sus4: { label: "sus4", family: "sus", triad: [0, 5, 7], full: [0, 5, 7] },
        power: { label: "power chord", family: "power", triad: [0, 7], full: [0, 7] },
        six: { label: "sixth", family: "major", triad: [4, 7, 9], full: [0, 4, 7, 9] },
        minor6: { label: "minor sixth", family: "minor", triad: [3, 7, 9], full: [0, 3, 7, 9] },
        seven: { label: "dominant seventh", family: "major", triad: [4, 7, 10], full: [0, 4, 7, 10] },
        maj7: { label: "major seventh", family: "major", triad: [4, 7, 11], full: [0, 4, 7, 11] },
        min7: { label: "minor seventh", family: "minor", triad: [3, 7, 10], full: [0, 3, 7, 10] },
        minMaj7: { label: "minor-major seventh", family: "minor", triad: [3, 7, 11], full: [0, 3, 7, 11] },
        dim7: { label: "diminished seventh", family: "dim", triad: [3, 6, 9], full: [0, 3, 6, 9] },
        halfDim7: { label: "half-diminished", family: "dim", triad: [3, 6, 10], full: [0, 3, 6, 10] },
        sevenSus4: { label: "seventh sus4", family: "sus", triad: [5, 7, 10], full: [0, 5, 7, 10] },
        add9: { label: "add nine", family: "major", triad: [0, 4, 2], full: [0, 2, 4, 7] },
        minAdd9: { label: "minor add nine", family: "minor", triad: [0, 3, 2], full: [0, 2, 3, 7] },
        nine: { label: "dominant ninth", family: "major", triad: [4, 10, 2], full: [0, 2, 4, 7, 10] },
        maj9: { label: "major ninth", family: "major", triad: [4, 11, 2], full: [0, 2, 4, 7, 11] },
        min9: { label: "minor ninth", family: "minor", triad: [3, 10, 2], full: [0, 2, 3, 7, 10] },
        eleven: { label: "eleventh", family: "major", triad: [4, 10, 5], full: [0, 2, 4, 5, 7, 10] },
        min11: { label: "minor eleventh", family: "minor", triad: [3, 10, 5], full: [0, 2, 3, 5, 7, 10] },
        thirteen: { label: "thirteenth (essential tones)", family: "major", triad: [4, 10, 9], full: [0, 2, 4, 9, 10] },
        min13: { label: "minor thirteenth (essential tones)", family: "minor", triad: [3, 10, 9], full: [0, 2, 3, 9, 10] }
    };

    const NOTE_TO_PC = {
        C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4,
        Fb: 4, "E#": 5, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
        Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "B#": 0
    };
    const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const INTERVAL_LABELS = ["1", "♭2", "2", "♭3", "3", "4", "♭5", "5", "♭6", "6", "♭7", "7"];
    const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
    const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
    const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
    const MINOR_PENTATONIC = [0, 3, 5, 7, 10];
    const ROUTE_COLORS = [
        "#f3c861", "#77d6b3", "#b99cff", "#ff8a70", "#72c7ff", "#f58fbd",
        "#b8df69", "#ffb45f", "#90a7ff", "#d39ae8", "#64d8d0", "#ff7f96"
    ];
    const MAJOR_FAMILIES = ["major", "minor", "minor", "major", "major", "minor", "dim"];
    const MINOR_FAMILIES = ["minor", "dim", "major", "minor", "minor", "major", "major"];
    const TUNING = [
        { name: "E", pc: 4, midi: 40 },
        { name: "A", pc: 9, midi: 45 },
        { name: "D", pc: 2, midi: 50 },
        { name: "G", pc: 7, midi: 55 },
        { name: "B", pc: 11, midi: 59 },
        { name: "e", pc: 4, midi: 64 }
    ];

    const KEYS = [
        { name: "C major", tonic: 0, mode: "major" },
        { name: "Db major", tonic: 1, mode: "major" },
        { name: "D major", tonic: 2, mode: "major" },
        { name: "Eb major", tonic: 3, mode: "major" },
        { name: "E major", tonic: 4, mode: "major" },
        { name: "F major", tonic: 5, mode: "major" },
        { name: "F# major", tonic: 6, mode: "major" },
        { name: "G major", tonic: 7, mode: "major" },
        { name: "Ab major", tonic: 8, mode: "major" },
        { name: "A major", tonic: 9, mode: "major" },
        { name: "Bb major", tonic: 10, mode: "major" },
        { name: "B major", tonic: 11, mode: "major" },
        { name: "C minor", tonic: 0, mode: "minor" },
        { name: "C# minor", tonic: 1, mode: "minor" },
        { name: "D minor", tonic: 2, mode: "minor" },
        { name: "Eb minor", tonic: 3, mode: "minor" },
        { name: "E minor", tonic: 4, mode: "minor" },
        { name: "F minor", tonic: 5, mode: "minor" },
        { name: "F# minor", tonic: 6, mode: "minor" },
        { name: "G minor", tonic: 7, mode: "minor" },
        { name: "G# minor", tonic: 8, mode: "minor" },
        { name: "A minor", tonic: 9, mode: "minor" },
        { name: "Bb minor", tonic: 10, mode: "minor" },
        { name: "B minor", tonic: 11, mode: "minor" }
    ];

    const state = {
        chords: [],
        keyMatches: [],
        key: null,
        choices: [],
        kinds: [],
        currentIndex: 0,
        inspectedIndex: 0,
        scaleView: "full",
        rankMode: "fingers",
        showAllVoicings: false
    };

    function mod(value, divisor = 12) {
        return ((value % divisor) + divisor) % divisor;
    }

    function normalizeAccidental(value) {
        return value.replace(/♯/g, "#").replace(/♭/g, "b");
    }

    function normalizeNote(letter, accidental = "") {
        return letter.toUpperCase() + normalizeAccidental(accidental);
    }

    function parseQuality(rawQuality) {
        const original = normalizeAccidental(rawQuality.trim()).replace(/[()]/g, "");
        const value = original.toLowerCase().replace(/major/g, "maj").replace(/minor/g, "min").replace(/\s+/g, "");

        if (["", "maj"].includes(value)) return "major";
        if (["m", "min", "-"].includes(value)) return "minor";
        if (["dim", "o", "°"].includes(value)) return "dim";
        if (["aug", "+"].includes(value)) return "aug";
        if (value === "sus2") return "sus2";
        if (["sus", "sus4"].includes(value)) return "sus4";
        if (value === "5") return "power";
        if (value === "6") return "six";
        if (["m6", "min6"].includes(value)) return "minor6";
        if (value === "7") return "seven";
        if (["maj7", "ma7", "δ7"].includes(value) || original === "M7") return "maj7";
        if (["m7", "min7", "-7"].includes(value)) return "min7";
        if (["mmaj7", "minmaj7", "m(maj7)"].includes(value)) return "minMaj7";
        if (["dim7", "o7", "°7"].includes(value)) return "dim7";
        if (["m7b5", "min7b5", "ø", "ø7"].includes(value)) return "halfDim7";
        if (["7sus", "7sus4"].includes(value)) return "sevenSus4";
        if (value === "add9") return "add9";
        if (["madd9", "minadd9"].includes(value)) return "minAdd9";
        if (value === "9") return "nine";
        if (["maj9", "ma9"].includes(value) || original === "M9") return "maj9";
        if (["m9", "min9"].includes(value)) return "min9";
        if (value === "11") return "eleven";
        if (["m11", "min11"].includes(value)) return "min11";
        if (value === "13") return "thirteen";
        if (["m13", "min13"].includes(value)) return "min13";
        return null;
    }

    function parseChord(token) {
        const cleaned = normalizeAccidental(token.trim()).replace(/[;,]+$/g, "");
        const match = cleaned.match(/^([A-Ga-g])([#b]?)([^/]*?)(?:\/([A-Ga-g])([#b]?))?$/);
        if (!match) {
            throw new Error(`I couldn't read “${token}”. Try a chord like C#m7, Bb, or D/F#.`);
        }

        const rootName = normalizeNote(match[1], match[2]);
        const root = NOTE_TO_PC[rootName];
        const typeKey = parseQuality(match[3]);
        if (!typeKey) {
            throw new Error(`I don't know the “${match[3]}” quality in ${token} yet.`);
        }

        const bassName = match[4] ? normalizeNote(match[4], match[5]) : null;
        return {
            raw: cleaned,
            root,
            rootName,
            bass: bassName ? NOTE_TO_PC[bassName] : null,
            bassName,
            typeKey,
            type: CHORD_TYPES[typeKey]
        };
    }

    function tokenizeProgression(input) {
        return input
            .replace(/[|,]+/g, " ")
            .replace(/[–—]+/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }

    function chordPitchClasses(chord, kind = "full") {
        const intervals = chord.type[kind] || chord.type.full;
        const pcs = intervals.map(interval => mod(chord.root + interval));
        if (chord.bass !== null && !pcs.includes(chord.bass) && pcs.length < 6) {
            pcs.push(chord.bass);
        }
        return [...new Set(pcs)];
    }

    function keyPitchClasses(key) {
        const intervals = key.mode === "major" ? MAJOR_INTERVALS : MINOR_INTERVALS;
        return intervals.map(interval => mod(key.tonic + interval));
    }

    function fitKeys(chords) {
        const allNotes = [...new Set(chords.flatMap(chord => chordPitchClasses(chord, "full")))];

        return KEYS.map(key => {
            const scale = keyPitchClasses(key);
            const missingNotes = allNotes.filter(pc => !scale.includes(pc));
            const intervals = key.mode === "major" ? MAJOR_INTERVALS : MINOR_INTERVALS;
            const families = key.mode === "major" ? MAJOR_FAMILIES : MINOR_FAMILIES;
            let qualityPenalty = 0;
            let tonicWeight = 0;

            chords.forEach((chord, index) => {
                const rootInterval = mod(chord.root - key.tonic);
                const degree = intervals.indexOf(rootInterval);
                if (degree < 0) {
                    qualityPenalty += 3;
                } else if (!["sus", "power", "aug"].includes(chord.type.family) && families[degree] !== chord.type.family) {
                    qualityPenalty += 1;
                }
                if (chord.root === key.tonic) {
                    tonicWeight += index === 0 ? 2.5 : 1;
                }
            });

            return {
                ...key,
                scale,
                missingNotes,
                missing: missingNotes.length,
                qualityPenalty,
                tonicWeight,
                score: missingNotes.length * 100 + qualityPenalty * 4 - tonicWeight
            };
        }).sort((a, b) => a.score - b.score || a.missing - b.missing || b.tonicWeight - a.tonicWeight);
    }

    function prefersFlats(key = state.key) {
        return Boolean(key && key.name.includes("b"));
    }

    function noteName(pc, flat = prefersFlats()) {
        return (flat ? FLAT_NOTES : SHARP_NOTES)[mod(pc)];
    }

    function intervalLabel(fromPc, toPc) {
        return INTERVAL_LABELS[mod(toPc - fromPc)];
    }

    function chordIntervalLabel(chord, pitchClass) {
        const interval = mod(pitchClass - chord.root);
        if (interval === 0) return "root";
        const extensionLabels = {
            add9: { 2: "9" }, minAdd9: { 2: "9" },
            nine: { 2: "9" }, maj9: { 2: "9" }, min9: { 2: "9" },
            eleven: { 2: "9", 5: "11" }, min11: { 2: "9", 5: "11" },
            thirteen: { 2: "9", 9: "13" }, min13: { 2: "9", 9: "13" }
        };
        return extensionLabels[chord.typeKey]?.[interval] || intervalLabel(chord.root, pitchClass);
    }

    function voicingPosition(frets) {
        const positive = frets.filter(fret => fret > 0);
        if (!positive.length) return 0;
        return positive.reduce((sum, fret) => sum + fret, 0) / positive.length;
    }

    function describePosition(voicing) {
        const sounded = voicing.frets.filter(fret => fret >= 0);
        const positive = sounded.filter(fret => fret > 0);
        if (sounded.includes(0) && (!positive.length || Math.max(...positive) <= 4)) return "Open position";
        const center = Math.round(voicingPosition(voicing.frets));
        return `Around fret ${Math.max(1, center)}`;
    }

    function generateVoicings(chord, kind = "triad") {
        const targetPcs = chordPitchClasses(chord, kind);
        const activeNeeded = targetPcs.length;
        const results = [];
        const seen = new Set();

        for (let windowStart = 0; windowStart <= 12; windowStart += 1) {
            const windowEnd = Math.min(15, windowStart + 4);
            const options = TUNING.map(string => {
                const frets = [];
                for (let fret = windowStart; fret <= windowEnd; fret += 1) {
                    if (targetPcs.includes(mod(string.pc + fret))) frets.push(fret);
                }
                return [-1, ...frets];
            });

            const frets = new Array(6).fill(-1);
            const walk = (stringIndex, activeCount) => {
                if (activeCount > activeNeeded || activeCount + (6 - stringIndex) < activeNeeded) return;
                if (stringIndex === 6) {
                    if (activeCount !== activeNeeded) return;

                    const sounded = frets
                        .map((fret, index) => fret >= 0 ? { index, fret, pc: mod(TUNING[index].pc + fret) } : null)
                        .filter(Boolean);
                    const soundingPcs = sounded.map(note => note.pc);
                    if (new Set(soundingPcs).size !== targetPcs.length) return;
                    if (!targetPcs.every(pc => soundingPcs.includes(pc))) return;
                    if (chord.bass !== null && sounded[0].pc !== chord.bass) return;

                    const positive = frets.filter(fret => fret > 0);
                    const span = positive.length ? Math.max(...positive) - Math.min(...positive) : 0;
                    if (span > 4) return;

                    const firstString = sounded[0].index;
                    const lastString = sounded[sounded.length - 1].index;
                    const internalGaps = frets.slice(firstString, lastString + 1).filter(fret => fret < 0).length;
                    if (internalGaps > 2) return;

                    const key = frets.join(",");
                    if (seen.has(key)) return;
                    seen.add(key);

                    const openCount = frets.filter(fret => fret === 0).length;
                    const mutedCount = frets.filter(fret => fret < 0).length;
                    const lowestIsRoot = sounded[0].pc === chord.root;
                    const center = voicingPosition(frets);
                    const playability = span * 2.6 + internalGaps * 3.5 + mutedCount * 0.22 + center * 0.09 - openCount * 0.55 - (lowestIsRoot ? 0.7 : 0);
                    const pitches = sounded.map(note => TUNING[note.index].midi + note.fret);

                    results.push({
                        frets: [...frets],
                        pitches,
                        pcs: soundingPcs,
                        playability,
                        span,
                        center,
                        lowestIsRoot
                    });
                    return;
                }

                options[stringIndex].forEach(fret => {
                    frets[stringIndex] = fret;
                    walk(stringIndex + 1, activeCount + (fret >= 0 ? 1 : 0));
                });
            };

            walk(0, 0);
        }

        return results.sort((a, b) => a.playability - b.playability);
    }

    function assignmentCost(previousPitches, nextPitches) {
        const smaller = previousPitches.length <= nextPitches.length ? previousPitches : nextPitches;
        const larger = previousPitches.length <= nextPitches.length ? nextPitches : previousPitches;
        let best = Infinity;

        function assign(index, used, total) {
            if (total >= best) return;
            if (index === smaller.length) {
                best = total;
                return;
            }
            larger.forEach((pitch, targetIndex) => {
                if (used.has(targetIndex)) return;
                used.add(targetIndex);
                assign(index + 1, used, total + Math.abs(smaller[index] - pitch));
                used.delete(targetIndex);
            });
        }

        assign(0, new Set(), 0);
        return smaller.length ? best / smaller.length : 0;
    }

    function fingerPositions(voicing) {
        return voicing.frets
            .map((fret, stringIndex) => fret > 0 ? { fret, stringIndex } : null)
            .filter(Boolean);
    }

    function fingerTravel(previous, next) {
        const previousPositions = fingerPositions(previous);
        const nextPositions = fingerPositions(next);
        if (!previousPositions.length && !nextPositions.length) return 0;

        const smaller = previousPositions.length <= nextPositions.length ? previousPositions : nextPositions;
        const larger = previousPositions.length <= nextPositions.length ? nextPositions : previousPositions;
        let best = Infinity;

        function assign(index, used, total) {
            if (total >= best) return;
            if (index === smaller.length) {
                best = total;
                return;
            }
            larger.forEach((position, targetIndex) => {
                if (used.has(targetIndex)) return;
                const source = smaller[index];
                const distance = Math.abs(source.fret - position.fret) + Math.abs(source.stringIndex - position.stringIndex) * 0.75;
                used.add(targetIndex);
                assign(index + 1, used, total + distance);
                used.delete(targetIndex);
            });
        }

        assign(0, new Set(), 0);
        const addedOrLiftedFingerCost = (larger.length - smaller.length) * 1.5;
        return (best + addedOrLiftedFingerCost) / Math.max(previousPositions.length, nextPositions.length);
    }

    function voiceLeadMetrics(previous, next) {
        if (!previous) {
            return { score: next.playability, semitoneScore: next.playability, fingerMovement: 0, movement: 0, common: 0, bassMove: 0 };
        }
        const movement = assignmentCost(previous.pitches, next.pitches);
        const fingerMovement = fingerTravel(previous, next);
        const previousPcs = new Set(previous.pcs);
        const common = [...new Set(next.pcs)].filter(pc => previousPcs.has(pc)).length;
        const bassMove = Math.abs(previous.pitches[0] - next.pitches[0]);
        const positionMove = Math.abs(previous.center - next.center);
        const semitoneScore = Math.max(0, movement * 1.25 + bassMove * 0.22 + positionMove * 0.35 + next.playability * 0.08 - common * 0.7);
        const score = fingerMovement;
        return { score, semitoneScore, fingerMovement, movement, common, bassMove };
    }

    function diversifyInitial(voicings, limit = 8) {
        const selected = [];
        const masks = new Set();

        for (const voicing of voicings) {
            const mask = voicing.frets.map(fret => fret >= 0 ? "1" : "0").join("");
            const hasNearby = selected.some(item => Math.abs(item.center - voicing.center) < 1.35 && masks.has(mask));
            if (hasNearby && selected.length < 5) continue;
            selected.push(voicing);
            masks.add(mask);
            if (selected.length === limit) break;
        }
        return selected;
    }

    function isFamiliarCompactShape(voicing) {
        const activeStrings = voicing.frets
            .map((fret, index) => fret >= 0 ? index : -1)
            .filter(index => index >= 0);
        if (!activeStrings.length) return false;
        const usesAdjacentStrings = activeStrings[activeStrings.length - 1] - activeStrings[0] + 1 === activeStrings.length;
        return usesAdjacentStrings && voicing.span <= 2;
    }

    function addFamiliarFallback(ranked, allVoicings, previous, limit = 8) {
        const visible = ranked.slice(0, limit);
        const signatures = new Set(visible.map(voicing => voicing.frets.join(",")));
        const familiar = allVoicings
            .filter(isFamiliarCompactShape)
            .sort((a, b) => a.playability - b.playability)[0];

        if (familiar && !signatures.has(familiar.frets.join(","))) {
            visible.push({
                ...familiar,
                metrics: voiceLeadMetrics(previous, familiar),
                isFamiliarFallback: true
            });
        }
        return visible;
    }

    function rankVoicings(chord, kind, previous, rankMode = "fingers") {
        const voicings = generateVoicings(chord, kind);
        if (!previous) {
            const firstChoices = diversifyInitial(voicings, 12);
            const selected = new Set(firstChoices.map(voicing => voicing.frets.join(",")));
            return [...firstChoices, ...voicings.filter(voicing => !selected.has(voicing.frets.join(",")))];
        }
        const ranked = voicings
            .map(voicing => ({ ...voicing, metrics: voiceLeadMetrics(previous, voicing) }))
            .sort((a, b) => {
                if (rankMode === "semitones") {
                    return a.metrics.semitoneScore - b.metrics.semitoneScore || a.metrics.fingerMovement - b.metrics.fingerMovement;
                }
                return a.metrics.fingerMovement - b.metrics.fingerMovement || a.metrics.semitoneScore - b.metrics.semitoneScore;
            });
        return ranked;
    }

    function chooseChordScale(chord, key) {
        const chordPcs = chordPitchClasses(chord, "full");
        const keySet = new Set(key.scale);
        return MODES.map(mode => {
            const scale = mode.intervals.map(interval => mod(chord.root + interval));
            const missingChordTones = chordPcs.filter(pc => !scale.includes(pc)).length;
            const overlap = scale.filter(pc => keySet.has(pc)).length;
            const outside = 7 - overlap;
            return {
                ...mode,
                scale,
                missingChordTones,
                overlap,
                outside,
                score: missingChordTones * 100 + outside * 3 - overlap
            };
        }).sort((a, b) => a.score - b.score)[0];
    }

    function soloScaleSets(chord, key, view = "full") {
        const fullChordScale = chooseChordScale(chord, key);
        if (view !== "pentatonic") {
            return {
                keyScale: key.scale,
                chordScale: fullChordScale.scale,
                chordScaleName: `${noteName(chord.root)} ${fullChordScale.name}`,
                overlap: fullChordScale.overlap,
                total: 7
            };
        }

        const keyIntervals = key.mode === "minor" ? MINOR_PENTATONIC : MAJOR_PENTATONIC;
        const chordIsMinor = ["minor", "dim"].includes(chord.type.family);
        const chordIntervals = chordIsMinor ? MINOR_PENTATONIC : MAJOR_PENTATONIC;
        const keyScale = keyIntervals.map(interval => mod(key.tonic + interval));
        const chordScale = chordIntervals.map(interval => mod(chord.root + interval));
        const overlap = chordScale.filter(pc => keyScale.includes(pc)).length;

        return {
            keyScale,
            chordScale,
            chordScaleName: `${noteName(chord.root)} ${chordIsMinor ? "minor" : "major"} pentatonic`,
            overlap,
            total: 5
        };
    }

    function routeColor(index) {
        return ROUTE_COLORS[index % ROUTE_COLORS.length];
    }

    function routeRingGradient(indexes) {
        const segment = 100 / indexes.length;
        const stops = indexes.map((index, position) => {
            const start = (position * segment).toFixed(2);
            const end = ((position + 1) * segment).toFixed(2);
            return `${routeColor(index)} ${start}% ${end}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }

    function buildTab(chords, choices) {
        const width = Math.max(9, ...chords.map(chord => chord.raw.length + 4));
        const heading = "   " + chords.map(chord => chord.raw.padStart(Math.floor((width + chord.raw.length) / 2)).padEnd(width)).join("");
        const lines = [heading];

        [5, 4, 3, 2, 1, 0].forEach(stringIndex => {
            const label = `${TUNING[stringIndex].name}|`;
            const cells = choices.map(choice => {
                const fret = choice.frets[stringIndex] < 0 ? "x" : String(choice.frets[stringIndex]);
                const cell = `--${fret}--`;
                return cell.padStart(Math.floor((width + cell.length) / 2), "-").padEnd(width, "-");
            });
            lines.push(label + cells.join(""));
        });
        return lines.join("\n");
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function voicingNoteLabels(voicing, chord) {
        return voicing.frets.map((fret, index) => {
            if (fret < 0) return "";
            const pitchClass = mod(TUNING[index].pc + fret);
            const chordInterval = chordIntervalLabel(chord, pitchClass);
            return `${noteName(pitchClass)}(${chordInterval})`;
        });
    }

    function outsideNoteUses(chords, key) {
        return key.missingNotes.map(pc => ({
            pc,
            chords: [...new Set(chords
                .filter(chord => chordPitchClasses(chord, "full").includes(pc))
                .map(chord => chord.raw))]
        }));
    }

    function naturalList(values) {
        if (values.length < 2) return values[0] || "";
        if (values.length === 2) return `${values[0]} and ${values[1]}`;
        return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
    }

    function samePitchCollection(first, second) {
        return first.scale.length === second.scale.length && first.scale.every(pc => second.scale.includes(pc));
    }

    function keyFitExplanation(best, matches, chords) {
        if (best.missing === 0) return "Every note in the progression belongs to this scale.";

        const flat = prefersFlats(best);
        const uses = outsideNoteUses(chords, best);
        const details = uses.map(use => `${noteName(use.pc, flat)} (used by ${naturalList(use.chords)})`);
        const verb = best.missing === 1 ? "falls" : "fall";
        let explanation = `${naturalList(details)} ${verb} outside ${best.name}.`;

        const tiedAlternative = matches.find(candidate =>
            candidate.name !== best.name &&
            candidate.missing === best.missing &&
            !samePitchCollection(candidate, best)
        );
        if (tiedAlternative) {
            const alternativeUses = outsideNoteUses(chords, tiedAlternative);
            const alternativeFlat = prefersFlats(tiedAlternative);
            const alternativeDetails = alternativeUses.map(use => `${noteName(use.pc, alternativeFlat)} in ${naturalList(use.chords)}`);
            explanation += ` ${tiedAlternative.name} is equally close by pitch count; its outside ${tiedAlternative.missing === 1 ? "note is" : "notes are"} ${naturalList(alternativeDetails)}.`;
        }
        return explanation;
    }

    function renderKeyPanel() {
        const best = state.key;
        const exact = best.missing === 0;
        const keyPanel = document.getElementById("key-panel");
        const badge = document.getElementById("fit-badge");
        document.getElementById("key-name").textContent = best.name;
        badge.textContent = exact ? "Exact fit" : `${best.missing} outside ${best.missing === 1 ? "note" : "notes"}`;
        badge.classList.toggle("is-near", !exact);

        document.getElementById("key-explanation").textContent = keyFitExplanation(best, state.keyMatches, state.chords);

        const candidateContainer = document.getElementById("key-candidates");
        candidateContainer.replaceChildren();
        state.keyMatches.slice(1, 4).forEach(candidate => {
            const card = createElement("div", "candidate-key");
            card.append(
                createElement("strong", "", candidate.name),
                createElement("span", "", candidate.missing === 0 ? "0 outside · exact" : `${candidate.missing} outside ${candidate.missing === 1 ? "note" : "notes"}`)
            );
            candidateContainer.append(card);
        });
        keyPanel.hidden = false;
    }

    function shapeStringGrid(voicing, chord) {
        const grid = createElement("div", "shape-strings");
        const noteLabels = voicingNoteLabels(voicing, chord);
        voicing.frets.forEach((fret, index) => {
            const string = createElement("span", `shape-string${fret < 0 ? " is-muted" : ""}`);
            string.append(
                createElement("i", "", TUNING[index].name),
                createElement("strong", "", fret < 0 ? "×" : String(fret)),
                createElement("small", "", noteLabels[index])
            );
            grid.append(string);
        });
        return grid;
    }

    function renderChordRail() {
        const rail = document.getElementById("chord-rail");
        rail.replaceChildren();
        state.chords.forEach((chord, index) => {
            const picked = Boolean(state.choices[index]);
            const current = index === state.currentIndex;
            const button = createElement("button", `rail-chord${picked ? " is-picked" : ""}${current ? " is-current" : ""}`);
            button.type = "button";
            button.style.setProperty("--chord-color", routeColor(index));
            button.disabled = !picked || current;
            button.append(
                createElement("span", "", String(index + 1).padStart(2, "0")),
                createElement("strong", "", chord.raw),
                createElement("small", "", picked ? state.choices[index].frets.map(fret => fret < 0 ? "x" : fret).join(" ") : current ? "Choosing now" : "Up next")
            );
            if (picked) {
                button.disabled = false;
                button.addEventListener("click", () => {
                    state.currentIndex = index;
                    state.choices = state.choices.slice(0, index);
                    state.kinds = state.kinds.slice(0, index + 1);
                    state.showAllVoicings = false;
                    document.getElementById("play-section").hidden = true;
                    renderPicker();
                });
            }
            rail.append(button);
        });
    }

    function renderPicker() {
        const index = state.currentIndex;
        const chord = state.chords[index];
        if (!chord) return;

        const kind = state.kinds[index] || state.kinds[index - 1] || "triad";
        state.kinds[index] = kind;
        const previous = index > 0 ? state.choices[index - 1] : null;
        const allOptions = rankVoicings(chord, kind, previous, state.rankMode);
        const options = state.showAllVoicings ? allOptions : addFamiliarFallback(allOptions, allOptions, previous, 12);
        const fullCount = chordPitchClasses(chord, "full").length;
        const triadCount = chordPitchClasses(chord, "triad").length;

        document.getElementById("picker-step").textContent = index === 0 ? "First chord · choose your anchor" : `Chord ${index + 1} · ranked from your last shape`;
        document.getElementById("picker-chord").textContent = chord.raw;
        const selectedCount = kind === "triad" ? triadCount : fullCount;
        const sameToneCount = fullCount === triadCount;
        const guideIntervals = chord.type.triad.map(interval => {
            const label = chordIntervalLabel(chord, mod(chord.root + interval));
            return label === "root" ? "1" : label;
        }).join(" · ");
        const toneSetName = fullCount === triadCount ? "Chord tones" : "Guide tones";
        const noteSet = kind === "triad" ? ` ${toneSetName}: ${guideIntervals}.` : "";
        let guidance;
        if (kind === "full" && sameToneCount) {
            guidance = `${chord.raw} has ${fullCount} distinct chord tones, so both modes use the same notes here. All tones stays on and will include 7ths or extensions later.`;
        } else if (index === 0) {
            guidance = `Choose a ${selectedCount}-note starting shape that feels right. This mode carries through the progression.`;
        } else {
            guidance = `These ${selectedCount}-note shapes are ordered by ${state.rankMode === "fingers" ? "estimated finger travel" : "semitone voice leading"} from ${state.chords[index - 1].raw}. This mode carries forward.`;
        }
        document.getElementById("picker-guidance").textContent = `${guidance}${noteSet}`;

        const sortControl = document.getElementById("voicing-sort");
        sortControl.hidden = !previous;
        document.querySelectorAll("[data-rank-mode]").forEach(button => {
            button.classList.toggle("is-active", button.dataset.rankMode === state.rankMode);
        });

        document.querySelectorAll("[data-kind]").forEach(button => {
            const buttonKind = button.dataset.kind;
            button.classList.toggle("is-active", buttonKind === kind);
            if (buttonKind === "full") {
                button.textContent = `All tones (${fullCount})`;
            } else {
                button.textContent = `Triad / guide tones (${triadCount})`;
            }
        });

        const grid = document.getElementById("voicing-grid");
        grid.replaceChildren();
        if (!options.length) {
            grid.append(createElement("p", "empty-voicings", "No compact shape found in the first 15 frets. Try Triad / guide tones for this chord."));
        }

        const rankNames = previous ? ["Most natural", "Very smooth", "Very smooth", "Close move", "Close move", "Alternate", "Alternate", "Stretch"] : ["Easy anchor", "Open choice", "Low neck", "Compact", "Middle neck", "Alternate", "Higher color", "Upper neck"];

        options.forEach((voicing, optionIndex) => {
            const metrics = voicing.metrics || voiceLeadMetrics(previous, voicing);
            const button = createElement("button", "voicing-option");
            button.type = "button";
            button.setAttribute("aria-label", `Choose ${chord.raw} voicing ${voicing.frets.map(fret => fret < 0 ? "muted" : fret).join(", ")}`);

            const rank = createElement("div", "option-rank");
            const optionName = voicing.isFamiliarFallback ? "Familiar shape" : rankNames[optionIndex] || "Option";
            rank.append(
                createElement("span", "", `${String(optionIndex + 1).padStart(2, "0")} · ${optionName}`),
                createElement("b", "", previous ? state.rankMode === "fingers" ? `${metrics.fingerMovement.toFixed(1)} move` : `${metrics.movement.toFixed(1)} st` : "")
            );
            const detail = previous
                ? `${metrics.fingerMovement.toFixed(1)} finger steps average · ${metrics.movement.toFixed(1)} semitones average · ${metrics.common} common ${metrics.common === 1 ? "tone" : "tones"}`
                : `${voicing.frets.filter(fret => fret >= 0).length} strings · ${voicing.span ? `${voicing.span}-fret span` : "no fret span"}`;

            button.append(
                rank,
                shapeStringGrid(voicing, chord),
                createElement("div", "option-position", describePosition(voicing)),
                createElement("p", "option-detail", detail)
            );
            button.addEventListener("click", () => selectVoicing(voicing, kind));
            grid.append(button);
        });

        const showAllButton = document.getElementById("show-all-voicings");
        showAllButton.hidden = allOptions.length <= 12;
        showAllButton.textContent = state.showAllVoicings ? "Show top choices" : `Show all ${allOptions.length} voicings`;
        showAllButton.setAttribute("aria-expanded", String(state.showAllVoicings));

        renderChordRail();
    }

    function selectVoicing(voicing, kind) {
        const index = state.currentIndex;
        state.choices[index] = voicing;
        state.kinds[index] = kind;
        state.choices = state.choices.slice(0, index + 1);
        state.kinds = state.kinds.slice(0, index + 1);

        if (index < state.chords.length - 1) {
            state.currentIndex = index + 1;
            state.showAllVoicings = false;
            renderPicker();
            document.getElementById("picker-shell").scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            renderChordRail();
            renderPlaySection();
            document.getElementById("play-section").scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function renderPlaySection() {
        const playSection = document.getElementById("play-section");
        document.getElementById("tab-output").textContent = buildTab(state.chords, state.choices);
        const chordButtons = document.getElementById("inspect-chords");
        chordButtons.replaceChildren();
        state.chords.forEach((chord, index) => {
            const button = createElement("button", index === state.inspectedIndex ? "is-active" : "", `${String(index + 1).padStart(2, "0")} ${chord.raw}`);
            button.type = "button";
            button.style.setProperty("--chord-color", routeColor(index));
            button.addEventListener("click", () => {
                state.inspectedIndex = index;
                renderFretboard();
            });
            chordButtons.append(button);
        });
        renderFretboard();
        playSection.hidden = false;
    }

    function renderFretboard() {
        const index = Math.min(state.inspectedIndex, state.chords.length - 1);
        state.inspectedIndex = index;
        const chord = state.chords[index];
        const scales = soloScaleSets(chord, state.key, state.scaleView);
        const routeByPosition = new Map();
        state.choices.forEach((choice, chordIndex) => {
            choice.frets.forEach((fret, stringIndex) => {
                if (fret < 0) return;
                const position = `${stringIndex}:${fret}`;
                if (!routeByPosition.has(position)) routeByPosition.set(position, []);
                routeByPosition.get(position).push(chordIndex);
            });
        });
        const soundedFrets = state.choices.flatMap(choice => choice.frets).filter(fret => fret >= 0);
        const positive = soundedFrets.filter(fret => fret > 0);
        const containsOpen = soundedFrets.includes(0);
        let startFret = containsOpen ? 0 : Math.max(0, (positive.length ? Math.min(...positive) : 1) - 2);
        let endFret = Math.min(15, Math.max(startFret + 5, (positive.length ? Math.max(...positive) : 3) + 2));
        if (endFret - startFret < 5) startFret = Math.max(0, endFret - 5);
        const frets = [];
        for (let fret = startFret; fret <= endFret; fret += 1) frets.push(fret);

        document.getElementById("fretboard-title").textContent = `Route map · focus ${chord.raw}`;
        document.getElementById("scale-description").textContent = state.scaleView === "pentatonic"
            ? `${scales.chordScaleName} against ${state.key.name} pentatonic: ${scales.overlap}/${scales.total} notes overlap.`
            : `${scales.chordScaleName} is the closest chord-rooted scale to ${state.key.name}: ${scales.overlap}/${scales.total} notes overlap.`;

        document.querySelectorAll("[data-scale-view]").forEach(button => {
            button.classList.toggle("is-active", button.dataset.scaleView === state.scaleView);
        });

        document.querySelectorAll("#inspect-chords button").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });

        const board = document.getElementById("fretboard");
        board.replaceChildren();
        board.style.gridTemplateColumns = `52px repeat(${frets.length}, minmax(92px, 1fr))`;
        board.append(createElement("div", "fret-label", "String"));
        frets.forEach(fret => board.append(createElement("div", `fret-label${fret === 0 ? " is-open" : ""}`, fret === 0 ? "Open" : `Fret ${fret}`)));

        [5, 4, 3, 2, 1, 0].forEach(stringIndex => {
            board.append(createElement("div", "string-label", TUNING[stringIndex].name));
            frets.forEach(fret => {
                const cell = createElement("div", "fret-cell");
                const pc = mod(TUNING[stringIndex].pc + fret);
                const inKey = scales.keyScale.includes(pc);
                const inChordScale = scales.chordScale.includes(pc);
                const routeIndexes = routeByPosition.get(`${stringIndex}:${fret}`) || [];
                const isRouteTone = routeIndexes.length > 0;
                const isFocusedTone = routeIndexes.includes(index);

                if (inKey || inChordScale || isRouteTone) {
                    const colorClass = inKey && inChordScale ? "both" : inKey ? "key-only" : inChordScale ? "chord-only" : "selected-only";
                    const marker = createElement("span", `note-marker${isRouteTone ? " is-route-tone" : ""}${isFocusedTone ? " has-focus" : ""}`);
                    if (isRouteTone) marker.style.setProperty("--route-ring", routeRingGradient(routeIndexes));
                    const dot = createElement("span", `note-dot ${colorClass}`);
                    dot.append(
                        document.createTextNode(noteName(pc)),
                        createElement("small", "", `K${intervalLabel(state.key.tonic, pc)} · C${chordIntervalLabel(chord, pc)}`)
                    );
                    if (isRouteTone) {
                        dot.append(createElement("b", "route-badge", routeIndexes.map(chordIndex => chordIndex + 1).join("·")));
                    }
                    const membership = inKey && inChordScale ? "home key and chord scale" : inKey ? "home key" : inChordScale ? "chord scale" : "route chord tone";
                    const routeNames = routeIndexes.map(chordIndex => `${chordIndex + 1} ${state.chords[chordIndex].raw}`).join(", ");
                    dot.title = `${noteName(pc)} · key ${intervalLabel(state.key.tonic, pc)} · chord ${chordIntervalLabel(chord, pc)} · ${membership}${isRouteTone ? ` · route: ${routeNames}` : ""}${isFocusedTone ? " · focused voicing" : ""}`;
                    marker.append(dot);
                    cell.append(marker);
                }
                board.append(cell);
            });
        });
    }

    function analyzeProgression(input, shouldScroll = true) {
        const error = document.getElementById("progression-error");
        error.textContent = "";
        try {
            const tokens = tokenizeProgression(input);
            if (tokens.length < 2) throw new Error("Add at least two chords so there is a voice-leading path to build.");
            if (tokens.length > 12) throw new Error("Keep this pass to 12 chords or fewer so the route stays readable.");

            state.chords = tokens.map(parseChord);
            state.keyMatches = fitKeys(state.chords);
            state.key = state.keyMatches[0];
            state.choices = [];
            state.kinds = [];
            state.currentIndex = 0;
            state.inspectedIndex = 0;
            state.rankMode = "fingers";
            state.showAllVoicings = false;

            renderKeyPanel();
            document.getElementById("voicing-workspace").hidden = false;
            document.getElementById("play-section").hidden = true;
            renderPicker();
            if (shouldScroll) document.getElementById("key-panel").scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (caught) {
            error.textContent = caught.message;
        }
    }

    function init() {
        const form = document.getElementById("progression-form");
        const input = document.getElementById("progression-input");
        form.addEventListener("submit", event => {
            event.preventDefault();
            analyzeProgression(input.value);
        });

        document.querySelectorAll("[data-example]").forEach(button => {
            button.addEventListener("click", () => {
                input.value = button.dataset.example;
                analyzeProgression(input.value);
            });
        });

        document.querySelectorAll("[data-kind]").forEach(button => {
            button.addEventListener("click", () => {
                const kind = button.dataset.kind;
                if (state.kinds[state.currentIndex] === kind) return;
                state.kinds[state.currentIndex] = kind;
                state.choices = state.choices.slice(0, state.currentIndex);
                state.showAllVoicings = false;
                document.getElementById("play-section").hidden = true;
                renderPicker();
            });
        });

        document.querySelectorAll("[data-rank-mode]").forEach(button => {
            button.addEventListener("click", () => {
                state.rankMode = button.dataset.rankMode;
                state.showAllVoicings = false;
                renderPicker();
            });
        });

        document.getElementById("show-all-voicings").addEventListener("click", () => {
            state.showAllVoicings = !state.showAllVoicings;
            renderPicker();
        });

        document.querySelectorAll("[data-scale-view]").forEach(button => {
            button.addEventListener("click", () => {
                state.scaleView = button.dataset.scaleView;
                if (!document.getElementById("play-section").hidden) renderFretboard();
            });
        });

        document.getElementById("copy-tab").addEventListener("click", async event => {
            const button = event.currentTarget;
            try {
                await navigator.clipboard.writeText(document.getElementById("tab-output").textContent);
                button.textContent = "Copied";
                window.setTimeout(() => { button.textContent = "Copy tab"; }, 1400);
            } catch (_error) {
                button.textContent = "Select tab to copy";
                document.getElementById("tab-output").focus();
            }
        });

        analyzeProgression(input.value, false);
    }

    const api = {
        parseChord,
        tokenizeProgression,
        fitKeys,
        chordPitchClasses,
        generateVoicings,
        voiceLeadMetrics,
        chooseChordScale,
        buildTab,
        describePosition,
        rankVoicings,
        voicingNoteLabels,
        soloScaleSets,
        routeColor,
        routeRingGradient,
        fingerTravel,
        chordIntervalLabel,
        outsideNoteUses,
        keyFitExplanation
    };

    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (typeof window !== "undefined") window.RhythmGuitarHero = api;
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
        else init();
    }
}());
