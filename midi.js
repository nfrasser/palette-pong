// Request browser MIDI access
window.addEventListener('load', () => {
    if (typeof navigator.requestMIDIAccess === 'function') {
        navigator.requestMIDIAccess().then(onMIDIInit, onMIDISystemError)
    } else {
        alert("Error: Please use a browser that supports the Web MIDI API.")
    }
})

function onMIDIInit(midi) {
    // Enumerate MIDI input devices, ensure MIDI events are handled
    for (var input of midi.inputs.values()) {
        input.onmidimessage = midiMessageReceived
    }
}

function onMIDISystemError(err) {
    alert("MIDI not initialized - error encountered: " + err.code)
}

function midiMessageReceived(ev) {
    let cmd = ev.data[0] >> 4
    let channel = ev.data[0] & 0xf
    let noteNumber = ev.data[1]

    let velocity = 0
    if (ev.data.length > 2) velocity = ev.data[2]

    let detail = {cmd, channel, noteNumber, velocity}
    var event

    // MIDI noteon with velocity=0 is the same as noteoff
    if (cmd == 8 || ((cmd==9) && (velocity==0))) { // noteoff
        event = new CustomEvent('palette-note-off', {detail})
    } else if (cmd == 9) { // note on
        event = new CustomEvent('palette-note-on', {detail})
    } else if (cmd == 11) { // controller message
        event = new CustomEvent('palette-controller', {detail})
    } else {
      // probably sysex!
    }

    document.dispatchEvent(event)
}
