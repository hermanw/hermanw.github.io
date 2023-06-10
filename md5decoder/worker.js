import init from "./mm.js";

export function sendProgress(i, hash, mobile) {
    postMessage({ i: i, hash: copyCStr(hash), mobile: copyCStr(mobile) });
}
export function printToJS(log) {
    console.log(copyCStr(log));
}

let wasm;

onmessage = async (e) => {
    if(wasm == undefined) wasm = await init();

    var data = e.data;
    var thread_num = data.thread_num;
    var threadid = data.threadid;
    if(threadid == undefined) return;

    var buf = newString(data.input);
    var hash_count = wasm.validate(buf);
    postMessage({hash_count : hash_count});

    if (hash_count > 0 ){
        wasm.decode(buf, thread_num, threadid);
    }

    wasm.dealloc_str(buf);    
    postMessage({i:threadid, hash:"", mobile:""});
}

function newString(str) {
    const utf8Encoder = new TextEncoder("UTF-8");
    let string_buffer = utf8Encoder.encode(str)
    let len = string_buffer.length
    let ptr = wasm.alloc(len + 1)

    let memory_buffer = new Uint8Array(wasm.memory.buffer);
    for (var i = 0; i < len; i++) {
      memory_buffer[ptr + i] = string_buffer[i]
    }

    memory_buffer[ptr + len] = 0;

    return ptr;
}

function copyCStr(ptr) {
    let orig_ptr = ptr;
    const collectCString = function* () {
        let memory = new Uint8Array(wasm.memory.buffer);
        while (memory[ptr] !== 0) {
            if (memory[ptr] === undefined) { throw new Error("Tried to read undef mem") }
            yield memory[ptr]
            ptr += 1
        }
    }

    const buffer_as_u8 = new Uint8Array(collectCString())
    const utf8Decoder = new TextDecoder("UTF-8");
    const buffer_as_utf8 = utf8Decoder.decode(buffer_as_u8);
    wasm.dealloc_str(orig_ptr);
    return buffer_as_utf8
}