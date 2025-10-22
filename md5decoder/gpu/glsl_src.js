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

fn rotl(v: u32, s: u32) -> u32 {
    return (v << s) | (v >> (32u - s));
}

// Helper function to read a single byte from the packed numbers_in buffer.
fn get_number_byte(byte_index: u32) -> u32 {
    let u32_index = byte_index / 4u;
    let byte_offset = byte_index % 4u;
    let word = numbers_in[u32_index];
    return (word >> (byte_offset * 8u)) & 0xFFu;
}

// MD5 auxiliary functions
fn F(x: u32, y: u32, z: u32) -> u32 { return (x & y) | (~x & z); }
fn G(x: u32, y: u32, z: u32) -> u32 { return (x & z) | (y & ~z); }
fn H(x: u32, y: u32, z: u32) -> u32 { return x ^ y ^ z; }
fn I(x: u32, y: u32, z: u32) -> u32 { return y ^ (x | ~z); }

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

    // Compose 11-byte message as little-endian words (MD5 block)
    // message bytes: [p1, p2, p3, m1, m2, m3, m4, l1, l2, l3, l4]
    let mid_idx = mid_num * 4u;
    let m1 = get_number_byte(mid_idx + 0u);
    let m2 = get_number_byte(mid_idx + 1u);
    let m3 = get_number_byte(mid_idx + 2u);
    let m4 = get_number_byte(mid_idx + 3u);

    let last_idx = last_num * 4u;
    let l1 = get_number_byte(last_idx + 0u);
    let l2 = get_number_byte(last_idx + 1u);
    let l3 = get_number_byte(last_idx + 2u);
    let l4 = get_number_byte(last_idx + 3u);

    // Pack into message words w0..w15
    let w0 = (prefix_c2 << 8u) | prefix_c1 | (prefix_c3 << 16u) | (m1 << 24u);
    let w1 = (m3 << 8u) | m2 | (m4 << 16u) | (l1 << 24u);
    let w2 = (l3 << 8u) | l2 | (l4 << 16u) | 0x80000000u; // Padding at next byte
    let w3 = 0u;
    let w4 = 0u;
    let w5 = 0u;
    let w6 = 0u;
    let w7 = 0u;
    let w8 = 0u;
    let w9 = 0u;
    let w10 = 0u;
    let w11 = 0u;
    let w12 = 0u;
    let w13 = 0u;
    let w14 = 88u; // 11 * 8 bits
    let w15 = 0u;

    // Initialize MD5 state
    var a = 0x67452301u;
    var b = 0xEFCDAB89u;
    var c = 0x98BADCFEu;
    var d = 0x10325476u;

    // Round 1
    a = b + rotl(a + F(b, c, d) + w0 + 0xD76AA478u, 7u);
    d = a + rotl(d + F(a, b, c) + w1 + 0xE8C7B756u, 12u);
    c = d + rotl(c + F(d, a, b) + w2 + 0x242070DBu, 17u);
    b = c + rotl(b + F(c, d, a) + w3 + 0xC1BDCEEEu, 22u);
    a = b + rotl(a + F(b, c, d) + w4 + 0xF57C0FAFu, 7u);
    d = a + rotl(d + F(a, b, c) + w5 + 0x4787C62Au, 12u);
    c = d + rotl(c + F(d, a, b) + w6 + 0xA8304613u, 17u);
    b = c + rotl(b + F(c, d, a) + w7 + 0xFD469501u, 22u);
    a = b + rotl(a + F(b, c, d) + w8 + 0x698098D8u, 7u);
    d = a + rotl(d + F(a, b, c) + w9 + 0x8B44F7AFu, 12u);
    c = d + rotl(c + F(d, a, b) + w10 + 0xFFFF5BB1u, 17u);
    b = c + rotl(b + F(c, d, a) + w11 + 0x895CD7BEu, 22u);
    a = b + rotl(a + F(b, c, d) + w12 + 0x6B901122u, 7u);
    d = a + rotl(d + F(a, b, c) + w13 + 0xFD987193u, 12u);
    c = d + rotl(c + F(d, a, b) + w14 + 0xA679438Eu, 17u);
    b = c + rotl(b + F(c, d, a) + w15 + 0x49B40821u, 22u);

    // Round 2
    a = b + rotl(a + G(b, c, d) + w1 + 0xF61E2562u, 5u);
    d = a + rotl(d + G(a, b, c) + w6 + 0xC040B340u, 9u);
    c = d + rotl(c + G(d, a, b) + w11 + 0x265E5A51u, 14u);
    b = c + rotl(b + G(c, d, a) + w0 + 0xE9B6C7AAu, 20u);
    a = b + rotl(a + G(b, c, d) + w5 + 0xD62F105Du, 5u);
    d = a + rotl(d + G(a, b, c) + w10 + 0x02441453u, 9u);
    c = d + rotl(c + G(d, a, b) + w15 + 0xD8A1E681u, 14u);
    b = c + rotl(b + G(c, d, a) + w4 + 0xE7D3FBC8u, 20u);
    a = b + rotl(a + G(b, c, d) + w9 + 0x21E1CDE6u, 5u);
    d = a + rotl(d + G(a, b, c) + w14 + 0xC33707D6u, 9u);
    c = d + rotl(c + G(d, a, b) + w3 + 0xF4D50D87u, 14u);
    b = c + rotl(b + G(c, d, a) + w8 + 0x455A14EDu, 20u);
    a = b + rotl(a + G(b, c, d) + w13 + 0xA9E3E905u, 5u);
    d = a + rotl(d + G(a, b, c) + w2 + 0xFCEFA3F8u, 9u);
    c = d + rotl(c + G(d, a, b) + w7 + 0x676F02D9u, 14u);
    b = c + rotl(b + G(c, d, a) + w12 + 0x8D2A4C8Au, 20u);

    // Round 3
    a = b + rotl(a + H(b, c, d) + w5 + 0xFFFA3942u, 4u);
    d = a + rotl(d + H(a, b, c) + w8 + 0x8771F681u, 11u);
    c = d + rotl(c + H(d, a, b) + w11 + 0x6D9D6122u, 16u);
    b = c + rotl(b + H(c, d, a) + w14 + 0xFDE5380Cu, 23u);
    a = b + rotl(a + H(b, c, d) + w1 + 0xA4BEEA44u, 4u);
    d = a + rotl(d + H(a, b, c) + w4 + 0x4BDECFA9u, 11u);
    c = d + rotl(c + H(d, a, b) + w7 + 0xF6BB4B60u, 16u);
    b = c + rotl(b + H(c, d, a) + w10 + 0xBEBFBC70u, 23u);
    a = b + rotl(a + H(b, c, d) + w13 + 0x289B7EC6u, 4u);
    d = a + rotl(d + H(a, b, c) + w0 + 0xEAA127FAu, 11u);
    c = d + rotl(c + H(d, a, b) + w3 + 0xD4EF3085u, 16u);
    b = c + rotl(b + H(c, d, a) + w6 + 0x04881D05u, 23u);
    a = b + rotl(a + H(b, c, d) + w9 + 0xD9D4D039u, 4u);
    d = a + rotl(d + H(a, b, c) + w12 + 0xE6DB99E5u, 11u);
    c = d + rotl(c + H(d, a, b) + w15 + 0x1FA27CF8u, 16u);
    b = c + rotl(b + H(c, d, a) + w2 + 0xC4AC5665u, 23u);

    // Round 4
    a = b + rotl(a + I(b, c, d) + w0 + 0xF4292244u, 6u);
    d = a + rotl(d + I(a, b, c) + w7 + 0x432AFF97u, 10u);
    c = d + rotl(c + I(d, a, b) + w14 + 0xAB9423A7u, 15u);
    b = c + rotl(b + I(c, d, a) + w5 + 0xFC93A039u, 21u);
    a = b + rotl(a + I(b, c, d) + w12 + 0x655B59C3u, 6u);
    d = a + rotl(d + I(a, b, c) + w3 + 0x8F0CCC92u, 10u);
    c = d + rotl(c + I(d, a, b) + w10 + 0xFFEFF47Du, 15u);
    b = c + rotl(b + I(c, d, a) + w1 + 0x85845DD1u, 21u);
    a = b + rotl(a + I(b, c, d) + w8 + 0x6FA87E4Fu, 6u);
    d = a + rotl(d + I(a, b, c) + w15 + 0xFE2CE6E0u, 10u);
    c = d + rotl(c + I(d, a, b) + w6 + 0xA3014314u, 15u);
    b = c + rotl(b + I(c, d, a) + w13 + 0x4E0811A1u, 21u);
    a = b + rotl(a + I(b, c, d) + w4 + 0xF7537E82u, 6u);
    d = a + rotl(d + I(a, b, c) + w11 + 0xBD3AF235u, 10u);
    c = d + rotl(c + I(d, a, b) + w2 + 0x2AD7D2BBu, 15u);
    b = c + rotl(b + I(c, d, a) + w9 + 0xEB86D391u, 21u);

    // Add initial state
    var h0 = 0x67452301u + a;
    var h1 = 0xEFCDAB89u + b;
    var h2 = 0x98BADCFEu + c;
    var h3 = 0x10325476u + d;

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
            let mobile_word0 = prefix_c1 | (prefix_c2 << 8u) | (prefix_c3 << 16u) | (m1 << 24u);
            let mobile_word1 = m2 | (m3 << 8u) | (m4 << 16u) | (l1 << 24u);
            let mobile_word2 = l2 | (l3 << 8u) | (l4 << 16u);
            mobiles_out[mid] = vec3<u32>(mobile_word0, mobile_word1, mobile_word2);
            atomicAdd(&params.count, 1u);
            break;
        }
    }
}
`;