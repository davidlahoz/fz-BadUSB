/* ============================================================
   FZ.BadUSB — payload generator
   Builds Flipper Zero BadUSB (DuckyScript) payloads in-browser.
   ============================================================ */

'use strict';

(() => {
    const byId = (id) => document.getElementById(id);

    const output       = byId('output');
    const lineCountEl  = byId('line-count');
    const charCountEl  = byId('char-count');
    const lastActionEl = byId('last-action');

    if (!output) return;

    const FLASH_MS = 1400;

    /* ===================== Status bar ===================== */

    let flashTimer = null;
    let restingStatus = lastActionEl ? lastActionEl.textContent : '';

    /** Text the status bar returns to once a flash message fades. */
    function setStatus(text) {
        restingStatus = text;
        if (lastActionEl && flashTimer === null) lastActionEl.textContent = text;
    }

    /** Show a transient confirmation, then restore the resting status. */
    function flashStatus(text) {
        if (!lastActionEl) return;
        clearTimeout(flashTimer);
        lastActionEl.textContent = `✓ ${text}`;
        lastActionEl.style.color = 'var(--phosphor)';
        flashTimer = setTimeout(() => {
            flashTimer = null;
            lastActionEl.style.color = '';
            lastActionEl.textContent = restingStatus;
        }, FLASH_MS);
    }

    function refreshStats(lastCommand) {
        const value = output.value;
        if (lineCountEl) lineCountEl.textContent = value.split('\n').filter(Boolean).length;
        if (charCountEl) charCountEl.textContent = value.length;
        if (lastCommand) setStatus(`→ ${lastCommand.split(/\s+/)[0].slice(0, 18)}`);
    }

    /* ===================== Payload editing ===================== */

    /** Append raw text to the payload and refresh the status bar. */
    function append(text, label) {
        output.value += text;
        refreshStats(label);
    }

    function addCommand(command) {
        append(`${command}\n`, command);
    }

    /**
     * Read a field, optionally clearing it.
     * @returns {string} the trimmed value ('' when empty or missing)
     */
    function readField(id, { clear = true } = {}) {
        const el = byId(id);
        if (!el) return '';
        const value = el.value.trim();
        if (clear) el.value = '';
        return value;
    }

    /** Prefix a single field value, e.g. "REM some note". */
    function addPrefixed(inputId, prefix, options) {
        const value = readField(inputId, options);
        if (value) addCommand(`${prefix} ${value}`);
    }

    /** Prefix every non-empty line of a textarea, e.g. bulk STRING entry. */
    function addBulkLines(inputId, prefix) {
        const el = byId(inputId);
        if (!el) return;
        const lines = el.value.split('\n').map((line) => line.trim()).filter(Boolean);
        el.value = '';
        if (lines.length) append(lines.map((line) => `${prefix} ${line}\n`).join(''), prefix);
    }

    function addRepeat() {
        const times = readField('repeat-input');
        if (Number(times) > 0) addCommand(`REPEAT ${times}`);
    }

    function clearPayload() {
        if (!output.value) return;
        if (!confirm('Clear the entire payload?')) return;
        output.value = '';
        refreshStats('CLEAR');
        flashStatus('CLEARED');
    }

    /* ===================== Export ===================== */

    function withTxtExtension(name) {
        return /\.txt$/i.test(name) ? name : `${name}.txt`;
    }

    function saveOutput() {
        if (!output.value) {
            flashStatus('EMPTY');
            return;
        }
        const name = prompt('Enter the payload name', 'payload.txt');
        if (name === null) return;

        const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = withTxtExtension(name.trim() || 'payload');
        anchor.click();
        // Give the download a moment to start before releasing the blob.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        flashStatus('SAVED');
    }

    /** Pre-Clipboard-API fallback (also covers non-secure origins, e.g. file://). */
    function legacyCopy() {
        output.select();
        const copied = document.execCommand('copy');
        output.setSelectionRange(output.value.length, output.value.length);
        return copied;
    }

    async function copyToClipboard() {
        if (!output.value) {
            flashStatus('EMPTY');
            return;
        }
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(output.value);
            } else if (!legacyCopy()) {
                throw new Error('execCommand copy failed');
            }
            flashStatus('COPIED');
        } catch {
            flashStatus(legacyCopy() ? 'COPIED' : 'COPY FAILED');
        }
    }

    /* ===================== Wiring ===================== */

    const HANDLERS = {
        'add-remark-btn':       () => addPrefixed('remark-input', 'REM'),
        'add-string-btn':       () => addPrefixed('string-input', 'STRING'),
        'add-altcode-btn':      () => addPrefixed('altcode-input', 'ALTCODE'),
        'add-altchar-btn':      () => addPrefixed('altchar-input', 'ALTCHAR'),
        'add-delay-btn':        () => addPrefixed('delay-input', 'DELAY', { clear: false }),
        'add-default-delay-btn':() => addPrefixed('default-delay-input', 'DEFAULT_DELAY', { clear: false }),
        'add-button-press-btn': () => addCommand('WAIT_FOR_BUTTON_PRESS'),
        'add-repeat-btn':       addRepeat,
        'bulkStringBtn':        () => addBulkLines('bulkStringAltcodeInput', 'STRING'),
        'bulkAltcodeBtn':       () => addBulkLines('bulkStringAltcodeInput', 'ALTCODE'),
        'bulkRemarkBtn':        () => addBulkLines('bulkRemarkInput', 'REM'),
        'bulkAltcharBtn':       () => addBulkLines('bulkAltcharInput', 'ALTCHAR'),
        'save-btn':             saveOutput,
        'saveAlternateBtn':     copyToClipboard,
        'clearBtn':             clearPayload,
    };

    for (const [id, handler] of Object.entries(HANDLERS)) {
        byId(id)?.addEventListener('click', handler);
    }

    // Every fixed-command button carries its own DuckyScript in data-cmd.
    const commandsSection = byId('commands-section');
    commandsSection?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cmd]');
        if (button) addCommand(button.dataset.cmd);
    });

    const cmdCountEl = byId('cmd-count');
    if (cmdCountEl && commandsSection) {
        cmdCountEl.textContent = `${commandsSection.querySelectorAll('.command-group').length} modules`;
    }

    output.addEventListener('input', () => refreshStats());
    refreshStats();
})();
