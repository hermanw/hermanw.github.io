const wgslSource = `
struct Hash {
    v: vec4<u32>,
};

struct Params {
    dedup_len: u32,
    count: atomic<u32>,
    prefix_c1: u32,
    prefix_c2: u32,
    prefix_c3: u32,
};

// Input buffer for the hashes to be cracked.
@group(0) @binding(0) var<storage, read> hashes_in: array<Hash>;

// Output buffer for the found mobile numbers.
@group(0) @binding(1) var<storage, read_write> mobiles_out: array<vec3<u32>>;

// Input buffer for pre-computed numbers '0000' through '9999'.
@group(0) @binding(2) var<storage, read> numbers_in: array<u32>;

// Input/Output buffer for parameters.
@group(0) @binding(3) var<storage, read_write> params: Params;


// Helper function to read a single byte from the packed numbers_in buffer.
fn get_number_byte(byte_index: u32) -> u32 {
    let u32_index = byte_index / 4u;
    let byte_offset = byte_index % 4u;
    let word = numbers_in[u32_index];
    return (word >> (byte_offset * 8u)) & 0xFFu;
}

fn rotl(v: u32, s: u32) -> u32 {
    return (v << s) | (v >> (32u - s));
}

// Main compute shader entry point.
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {

    let dedup_len = params.dedup_len;

    // Early exit if all hashes have been found.
    if (atomicLoad(&params.count) >= dedup_len) {
        return;
    }

    let mid_num = global_id.x;
    let last_num = global_id.y;

    if (mid_num >= 10000u || last_num >= 10000u) {
        return;
    }

    let prefix_c1 = params.prefix_c1;
    let prefix_c2 = params.prefix_c2;
    let prefix_c3 = params.prefix_c3;

    let mid_idx = mid_num * 4u;
    let mid_c1 = get_number_byte(mid_idx + 0u);
    let mid_c2 = get_number_byte(mid_idx + 1u);
    let mid_c3 = get_number_byte(mid_idx + 2u);
    let mid_c4 = get_number_byte(mid_idx + 3u);

    let last_idx = last_num * 4u;
    let last_c1 = get_number_byte(last_idx + 0u);
    let last_c2 = get_number_byte(last_idx + 1u);
    let last_c3 = get_number_byte(last_idx + 2u);
    let last_c4 = get_number_byte(last_idx + 3u);

    let w0 = (prefix_c2 << 8u) | prefix_c1 | (prefix_c3 << 16u) | (mid_c1 << 24u);
    let w1 = (mid_c3 << 8u) | mid_c2 | (mid_c4 << 16u) | (last_c1 << 24u);
    let w2 = (last_c3 << 8u) | last_c2 | (last_c4 << 16u) | 0x80000000u; // Padding for 11-byte message
    let w14 = 88u; // Message length in bits (11 bytes * 8)

    // MD5 Implementation
    var h0 = 1732584193u;
    var h1 = 4023233417u;
    var h2 = 2562383102u;
    var h3 = 271733878u;

    var a = h0;
    var b = h1;
    var c = h2;
    var d = h3;

    // Round 1
    a = b + rotl(a + ((b & c) | (~b & d)) + w0 + 3614090359u, 7u);
    d = a + rotl(d + ((a & b) | (~a & c)) + w1 + 389564586u, 12u);
    c = d + rotl(c + ((d & a) | (~d & b)) + w2 + 606105819u, 17u);
    b = c + rotl(b + ((c & d) | (~c & a)) + 0u + 3250441966u, 22u);
    a = b + rotl(a + ((b & c) | (~b & d)) + 0u + 4118548399u, 7u);
    d = a + rotl(d + ((a & b) | (~a & c)) + 0u + 1200080426u, 12u);
    c = d + rotl(c + ((d & a) | (~d & b)) + 0u + 2821735955u, 17u);
    b = c + rotl(b + ((c & d) | (~c & a)) + 0u + 4249261313u, 22u);
    a = b + rotl(a + ((b & c) | (~b & d)) + 0u + 1770035416u, 7u);
    d = a + rotl(d + ((a & b) | (~a & c)) + 0u + 2336552879u, 12u);
    c = d + rotl(c + ((d & a) | (~d & b)) + 0u + 4294925233u, 17u);
    b = c + rotl(b + ((c & d) | (~c & a)) + 0u + 2304563134u, 22u);
    a = b + rotl(a + ((b & c) | (~b & d)) + 0u + 1804603682u, 7u);
    d = a + rotl(d + ((a & b) | (~a & c)) + w14 + 4254626195u, 12u);
    c = d + rotl(c + ((d & a) | (~d & b)) + 0u + 2792965004u, 17u);
    b = c + rotl(b + ((c & d) | (~c & a)) + 0u + 1236535329u, 22u);

    // Round 2
    a = b + rotl(a + ((d & b) | (c & ~d)) + w1 + 4129170786u, 5u);
    d = a + rotl(d + ((c & a) | (b & ~c)) + 0u + 3225465664u, 9u);
    c = d + rotl(c + ((b & d) | (a & ~b)) + 0u + 643717713u, 14u);
    b = c + rotl(b + ((a & c) | (d & ~a)) + w0 + 3921069994u, 20u);
    a = b + rotl(a + ((d & b) | (c & ~d)) + 0u + 3593408605u, 5u);
    d = a + rotl(d + ((c & a) | (b & ~c)) + 0u + 38016083u, 9u);
    c = d + rotl(c + ((b & d) | (a & ~b)) + 0u + 3634488961u, 14u);
    b = c + rotl(b + ((a & c) | (d & ~a)) + 0u + 3889429448u, 20u);
    a = b + rotl(a + ((d & b) | (c & ~d)) + 0u + 568446438u, 5u);
    d = a + rotl(d + ((c & a) | (b & ~c)) + 0u + 3275163606u, 9u);
    c = d + rotl(c + ((b & d) | (a & ~b)) + w14 + 4107603335u, 14u);
    b = c + rotl(b + ((a & c) | (d & ~a)) + w2 + 1163531501u, 20u);
    a = b + rotl(a + ((d & b) | (c & ~d)) + 0u + 2850285829u, 5u);
    d = a + rotl(d + ((c & a) | (b & ~c)) + 0u + 4243563512u, 9u);
    c = d + rotl(c + ((b & d) | (a & ~b)) + 0u + 1735328473u, 14u);
    b = c + rotl(b + ((a & c) | (d & ~a)) + 0u + 2368359562u, 20u);

    // Round 3
    a = b + rotl(a + (b ^ c ^ d) + 0u + 4294588738u, 4u);
    d = a + rotl(d + (a ^ b ^ c) + 0u + 2272392833u, 11u);
    c = d + rotl(c + (d ^ a ^ b) + 0u + 1839030562u, 16u);
    b = c + rotl(b + (c ^ d ^ a) + 0u + 4259657740u, 23u);
    a = b + rotl(a + (b ^ c ^ d) + w1 + 2763975236u, 4u);
    d = a + rotl(d + (a ^ b ^ c) + 0u + 1272893353u, 11u);
    c = d + rotl(c + (d ^ a ^ b) + 0u + 4139469664u, 16u);
    b = c + rotl(b + (c ^ d ^ a) + 0u + 3200236656u, 23u);
    a = b + rotl(a + (b ^ c ^ d) + 0u + 681279174u, 4u);
    d = a + rotl(d + (a ^ b ^ c) + w0 + 3936430074u, 11u);
    c = d + rotl(c + (d ^ a ^ b) + 0u + 3572445317u, 16u);
    b = c + rotl(b + (c ^ d ^ a) + w14 + 76029189u, 23u);
    a = b + rotl(a + (b ^ c ^ d) + 0u + 3654602809u, 4u);
    d = a + rotl(d + (a ^ b ^ c) + 0u + 3873151461u, 11u);
    c = d + rotl(c + (d ^ a ^ b) + 0u + 530742520u, 16u);
    b = c + rotl(b + (c ^ d ^ a) + w2 + 3299628645u, 23u);

    // Round 4
    a = b + rotl(a + (c ^ (b | ~d)) + 0u + 4096336452u, 6u);
    d = a + rotl(d + (b ^ (a | ~c)) + 0u + 1126891415u, 10u);
    c = d + rotl(c + (a ^ (d | ~b)) + w14 + 2878612391u, 15u);
    b = c + rotl(b + (d ^ (c | ~a)) + 0u + 4237533241u, 21u);
    a = b + rotl(a + (c ^ (b | ~d)) + 0u + 1700485571u, 6u);
    d = a + rotl(d + (b ^ (a | ~c)) + 0u + 2399980690u, 10u);
    c = d + rotl(c + (a ^ (d | ~b)) + 0u + 4293915773u, 15u);
    b = c + rotl(b + (d ^ (c | ~a)) + w1 + 2240044497u, 21u);
    a = b + rotl(a + (c ^ (b | ~d)) + 0u + 1873313359u, 6u);
    d = a + rotl(d + (b ^ (a | ~c)) + 0u + 4264355552u, 10u);
    c = d + rotl(c + (a ^ (d | ~b)) + 0u + 2734768916u, 15u);
    b = c + rotl(b + (d ^ (c | ~a)) + 0u + 1309151649u, 21u);
    a = b + rotl(a + (c ^ (b | ~d)) + 0u + 4149444226u, 6u);
    d = a + rotl(d + (b ^ (a | ~c)) + 0u + 3174756917u, 10u);
    c = d + rotl(c + (a ^ (d | ~b)) + w2 + 718787259u, 15u);
    b = c + rotl(b + (d ^ (c | ~a)) + w0 + 3951481745u, 21u);

    h0 = h0 + a;
    h1 = h1 + b;
    h2 = h2 + c;
    h3 = h3 + d;

    let final_hash = vec4<u32>(h0, h1, h2, h3);

    // Binary search for the computed hash in the input hash list.
    var low = 0u;
    var high = dedup_len;
    while (low < high) {
        let mid = (low + high) / 2u;
        let mid_hash = hashes_in[mid].v;
        if (final_hash.x < mid_hash.x ||
           (final_hash.x == mid_hash.x && final_hash.y < mid_hash.y) ||
           (final_hash.x == mid_hash.x && final_hash.y == mid_hash.y && final_hash.z < mid_hash.z) ||
           (final_hash.x == mid_hash.x && final_hash.y == mid_hash.y && final_hash.z == mid_hash.z && final_hash.w < mid_hash.w)) {
            high = mid;
        } else if (final_hash.x > mid_hash.x ||
                  (final_hash.x == mid_hash.x && final_hash.y > mid_hash.y) ||
                  (final_hash.x == mid_hash.x && final_hash.y == mid_hash.y && final_hash.z > mid_hash.z) ||
                  (final_hash.x == mid_hash.x && final_hash.y == mid_hash.y && final_hash.z == mid_hash.z && final_hash.w > mid_hash.w)) {
            low = mid + 1u;
        } else {
            // Hash found!
            let mobile_word0 = prefix_c1 | (prefix_c2 << 8u) | (prefix_c3 << 16u) | (mid_c1 << 24u);
            let mobile_word1 = mid_c2 | (mid_c3 << 8u) | (mid_c4 << 16u) | (last_c1 << 24u);
            let mobile_word2 = last_c2 | (last_c3 << 8u) | (last_c4 << 16u);
            mobiles_out[mid] = vec3<u32>(mobile_word0, mobile_word1, mobile_word2);
            
            atomicAdd(&params.count, 1u);
            break;
        }
    }
}
`;