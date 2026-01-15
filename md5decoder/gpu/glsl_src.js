function getWgslSource(algorithm) {
    // Common structs and helpers
    const common = `
struct Hash {
    v: array<u32, ${algorithm === 'SHA256' ? 8 : 4}>,
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
`;

    // MD5 Implementation
    if (algorithm === 'MD5') {
        return common + `
fn rotl(v: u32, s: u32) -> u32 {
    return (v << s) | (v >> (32u - s));
}

// MD5 auxiliary functions
fn F(x: u32, y: u32, z: u32) -> u32 { return (x & y) | (~x & z); }
fn G(x: u32, y: u32, z: u32) -> u32 { return (x & z) | (y & ~z); }
fn H(x: u32, y: u32, z: u32) -> u32 { return x ^ y ^ z; }
fn I(x: u32, y: u32, z: u32) -> u32 { return y ^ (x | ~z); }

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let dedup_len = params.dedup_len;

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
    let m1 = get_number_byte(mid_idx + 0u);
    let m2 = get_number_byte(mid_idx + 1u);
    let m3 = get_number_byte(mid_idx + 2u);
    let m4 = get_number_byte(mid_idx + 3u);

    let last_idx = last_num * 4u;
    let l1 = get_number_byte(last_idx + 0u);
    let l2 = get_number_byte(last_idx + 1u);
    let l3 = get_number_byte(last_idx + 2u);
    let l4 = get_number_byte(last_idx + 3u);

    // Pack into message words w0..w15 (Little Endian)
    let w0 = (prefix_c2 << 8u) | prefix_c1 | (prefix_c3 << 16u) | (m1 << 24u);
    let w1 = (m3 << 8u) | m2 | (m4 << 16u) | (l1 << 24u);
    let w2 = (l3 << 8u) | l2 | (l4 << 16u) | 0x80000000u;
    let w3 = 0u;
    let w4 = 0u; let w5 = 0u; let w6 = 0u; let w7 = 0u;
    let w8 = 0u; let w9 = 0u; let w10 = 0u; let w11 = 0u;
    let w12 = 0u; let w13 = 0u;
    let w14 = 88u; // 11 * 8 bits
    let w15 = 0u;

    var a = 0x67452301u;
    var b = 0xEFCDAB89u;
    var c = 0x98BADCFEu;
    var d = 0x10325476u;

    // Round 1
    a=b+rotl(a+F(b,c,d)+w0+0xD76AA478u,7u); d=a+rotl(d+F(a,b,c)+w1+0xE8C7B756u,12u); c=d+rotl(c+F(d,a,b)+w2+0x242070DBu,17u); b=c+rotl(b+F(c,d,a)+w3+0xC1BDCEEEu,22u);
    a=b+rotl(a+F(b,c,d)+w4+0xF57C0FAFu,7u); d=a+rotl(d+F(a,b,c)+w5+0x4787C62Au,12u); c=d+rotl(c+F(d,a,b)+w6+0xA8304613u,17u); b=c+rotl(b+F(c,d,a)+w7+0xFD469501u,22u);
    a=b+rotl(a+F(b,c,d)+w8+0x698098D8u,7u); d=a+rotl(d+F(a,b,c)+w9+0x8B44F7AFu,12u); c=d+rotl(c+F(d,a,b)+w10+0xFFFF5BB1u,17u); b=c+rotl(b+F(c,d,a)+w11+0x895CD7BEu,22u);
    a=b+rotl(a+F(b,c,d)+w12+0x6B901122u,7u); d=a+rotl(d+F(a,b,c)+w13+0xFD987193u,12u); c=d+rotl(c+F(d,a,b)+w14+0xA679438Eu,17u); b=c+rotl(b+F(c,d,a)+w15+0x49B40821u,22u);

    // Round 2
    a=b+rotl(a+G(b,c,d)+w1+0xF61E2562u,5u); d=a+rotl(d+G(a,b,c)+w6+0xC040B340u,9u); c=d+rotl(c+G(d,a,b)+w11+0x265E5A51u,14u); b=c+rotl(b+G(c,d,a)+w0+0xE9B6C7AAu,20u);
    a=b+rotl(a+G(b,c,d)+w5+0xD62F105Du,5u); d=a+rotl(d+G(a,b,c)+w10+0x02441453u,9u); c=d+rotl(c+G(d,a,b)+w15+0xD8A1E681u,14u); b=c+rotl(b+G(c,d,a)+w4+0xE7D3FBC8u,20u);
    a=b+rotl(a+G(b,c,d)+w9+0x21E1CDE6u,5u); d=a+rotl(d+G(a,b,c)+w14+0xC33707D6u,9u); c=d+rotl(c+G(d,a,b)+w3+0xF4D50D87u,14u); b=c+rotl(b+G(c,d,a)+w8+0x455A14EDu,20u);
    a=b+rotl(a+G(b,c,d)+w13+0xA9E3E905u,5u); d=a+rotl(d+G(a,b,c)+w2+0xFCEFA3F8u,9u); c=d+rotl(c+G(d,a,b)+w7+0x676F02D9u,14u); b=c+rotl(b+G(c,d,a)+w12+0x8D2A4C8Au,20u);

    // Round 3
    a=b+rotl(a+H(b,c,d)+w5+0xFFFA3942u,4u); d=a+rotl(d+H(a,b,c)+w8+0x8771F681u,11u); c=d+rotl(c+H(d,a,b)+w11+0x6D9D6122u,16u); b=c+rotl(b+H(c,d,a)+w14+0xFDE5380Cu,23u);
    a=b+rotl(a+H(b,c,d)+w1+0xA4BEEA44u,4u); d=a+rotl(d+H(a,b,c)+w4+0x4BDECFA9u,11u); c=d+rotl(c+H(d,a,b)+w7+0xF6BB4B60u,16u); b=c+rotl(b+H(c,d,a)+w10+0xBEBFBC70u,23u);
    a=b+rotl(a+H(b,c,d)+w13+0x289B7EC6u,4u); d=a+rotl(d+H(a,b,c)+w0+0xEAA127FAu,11u); c=d+rotl(c+H(d,a,b)+w3+0xD4EF3085u,16u); b=c+rotl(b+H(c,d,a)+w6+0x04881D05u,23u);
    a=b+rotl(a+H(b,c,d)+w9+0xD9D4D039u,4u); d=a+rotl(d+H(a,b,c)+w12+0xE6DB99E5u,11u); c=d+rotl(c+H(d,a,b)+w15+0x1FA27CF8u,16u); b=c+rotl(b+H(c,d,a)+w2+0xC4AC5665u,23u);

    // Round 4
    a=b+rotl(a+I(b,c,d)+w0+0xF4292244u,6u); d=a+rotl(d+I(a,b,c)+w7+0x432AFF97u,10u); c=d+rotl(c+I(d, a,b)+w14+0xAB9423A7u,15u); b=c+rotl(b+I(c,d,a)+w5+0xFC93A039u,21u);
    a=b+rotl(a+I(b,c,d)+w12+0x655B59C3u,6u); d=a+rotl(d+I(a,b,c)+w3+0x8F0CCC92u,10u); c=d+rotl(c+I(d,a,b)+w10+0xFFEFF47Du,15u); b=c+rotl(b+I(c,d,a)+w1+0x85845DD1u,21u);
    a=b+rotl(a+I(b,c,d)+w8+0x6FA87E4Fu,6u); d=a+rotl(d+I(a,b,c)+w15+0xFE2CE6E0u,10u); c=d+rotl(c+I(d,a,b)+w6+0xA3014314u,15u); b=c+rotl(b+I(c,d,a)+w13+0x4E0811A1u,21u);
    a=b+rotl(a+I(b,c,d)+w4+0xF7537E82u,6u); d=a+rotl(d+I(a,b,c)+w11+0xBD3AF235u,10u); c=d+rotl(c+I(d,a,b)+w2+0x2AD7D2BBu,15u); b=c+rotl(b+I(c,d,a)+w9+0xEB86D391u,21u);

    let h0 = 0x67452301u + a;
    let h1 = 0xEFCDAB89u + b;
    let h2 = 0x98BADCFEu + c;
    let h3 = 0x10325476u + d;

    // Binary search
    var low = 0u;
    var high = dedup_len;
    while (low < high) {
        let mid = (low + high) / 2u;
        // Use direct array access for vec4<u32> (workaround if needed, but array<u32,4> implies different access pattern)
        // Since we changed Hash struct to use array<u32, 4>, we access components by index
        let mid_hash_v = hashes_in[mid].v;
        
        let mh0 = mid_hash_v[0];
        let mh1 = mid_hash_v[1];
        let mh2 = mid_hash_v[2];
        let mh3 = mid_hash_v[3];

        if (h0 < mh0 ||
           (h0 == mh0 && h1 < mh1) ||
           (h0 == mh0 && h1 == mh1 && h2 < mh2) ||
           (h0 == mh0 && h1 == mh1 && h2 == mh2 && h3 < mh3)) {
            high = mid;
        } else if (h0 > mh0 ||
                  (h0 == mh0 && h1 > mh1) ||
                  (h0 == mh0 && h1 == mh1 && h2 > mh2) ||
                  (h0 == mh0 && h1 == mh1 && h2 == mh2 && h3 > mh3)) {
            low = mid + 1u;
        } else {
             // Found
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
    }

    // SHA256 Implementation
    if (algorithm === 'SHA256') {
        return common + `
fn rotr(v: u32, s: u32) -> u32 {
    return (v >> s) | (v << (32u - s));
}

fn Ch(x: u32, y: u32, z: u32) -> u32 { return (x & y) ^ (~x & z); }
fn Maj(x: u32, y: u32, z: u32) -> u32 { return (x & y) ^ (x & z) ^ (y & z); }
fn Sigma0(x: u32) -> u32 { return rotr(x, 2u) ^ rotr(x, 13u) ^ rotr(x, 22u); }
fn Sigma1(x: u32) -> u32 { return rotr(x, 6u) ^ rotr(x, 11u) ^ rotr(x, 25u); }
fn sigma0(x: u32) -> u32 { return rotr(x, 7u) ^ rotr(x, 18u) ^ (x >> 3u); }
fn sigma1(x: u32) -> u32 { return rotr(x, 17u) ^ rotr(x, 19u) ^ (x >> 10u); }

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let dedup_len = params.dedup_len;

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
    let m1 = get_number_byte(mid_idx + 0u);
    let m2 = get_number_byte(mid_idx + 1u);
    let m3 = get_number_byte(mid_idx + 2u);
    let m4 = get_number_byte(mid_idx + 3u);

    let last_idx = last_num * 4u;
    let l1 = get_number_byte(last_idx + 0u);
    let l2 = get_number_byte(last_idx + 1u);
    let l3 = get_number_byte(last_idx + 2u);
    let l4 = get_number_byte(last_idx + 3u);

    // Prepare message schedule W (64 words)
    // We only have one block of 512 bits (64 bytes)
    // The mobile number is 11 bytes.
    // Padding: 0x80 appended.
    // Length (bits) at the end (64 bits, big endian). 11 * 8 = 88.
    
    // Construct first 16 words W[0..15] (Big Endian)
    var W = array<u32, 64>();

    // Bytes: p1 p2 p3 m1 | m2 m3 m4 l1 | l2 l3 l4 0x80 | 0 ...
    W[0] = (prefix_c1 << 24u) | (prefix_c2 << 16u) | (prefix_c3 << 8u) | m1;
    W[1] = (m2 << 24u) | (m3 << 16u) | (m4 << 8u) | l1;
    W[2] = (l2 << 24u) | (l3 << 16u) | (l4 << 8u) | 0x80u;
    
    // W[3]..W[14] are 0
    // W[15] is length in bits (88)
    W[15] = 88u;

    // Extend to W[16..63]
    for (var i = 16u; i < 64u; i = i + 1u) {
        W[i] = sigma1(W[i-2u]) + W[i-7u] + sigma0(W[i-15u]) + W[i-16u];
    }

    // Initialize vars
    var a = 0x6a09e667u;
    var b = 0xbb67ae85u;
    var c = 0x3c6ef372u;
    var d = 0xa54ff53au;
    var e = 0x510e527fu;
    var f = 0x9b05688cu;
    var g = 0x1f83d9abu;
    var h = 0x5be0cd19u;

    let K = array<u32, 64>(
        0x428a2f98u, 0x71374491u, 0xb5c0fbcfu, 0xe9b5dba5u, 0x3956c25bu, 0x59f111f1u, 0x923f82a4u, 0xab1c5ed5u,
        0xd807aa98u, 0x12835b01u, 0x243185beu, 0x550c7dc3u, 0x72be5d74u, 0x80deb1feu, 0x9bdc06a7u, 0xc19bf174u,
        0xe49b69c1u, 0xefbe4786u, 0x0fc19dc6u, 0x240ca1ccu, 0x2de92c6fu, 0x4a7484aau, 0x5cb0a9dcu, 0x76f988dau,
        0x983e5152u, 0xa831c66du, 0xb00327c8u, 0xbf597fc7u, 0xc6e00bf3u, 0xd5a79147u, 0x06ca6351u, 0x14292967u,
        0x27b70a85u, 0x2e1b2138u, 0x4d2c6dfcu, 0x53380d13u, 0x650a7354u, 0x766a0abbu, 0x81c2c92eu, 0x92722c85u,
        0xa2bfe8a1u, 0xa81a664bu, 0xc24b8b70u, 0xc76c51a3u, 0xd192e819u, 0xd6990624u, 0xf40e3585u, 0x106aa070u,
        0x19a4c116u, 0x1e376c08u, 0x2748774cu, 0x34b0bcb5u, 0x391c0cb3u, 0x4ed8aa4au, 0x5b9cca4fu, 0x682e6ff3u,
        0x748f82eeu, 0x78a5636fu, 0x84c87814u, 0x8cc70208u, 0x90befffau, 0xa4506cebu, 0xbef9a3f7u, 0xc67178f2u
    );

    for (var i = 0u; i < 64u; i = i + 1u) {
        let T1 = h + Sigma1(e) + Ch(e, f, g) + K[i] + W[i];
        let T2 = Sigma0(a) + Maj(a, b, c);
        h = g;
        g = f;
        f = e;
        e = d + T1;
        d = c;
        c = b;
        b = a;
        a = T1 + T2;
    }

    let h0 = 0x6a09e667u + a;
    let h1 = 0xbb67ae85u + b;
    let h2 = 0x3c6ef372u + c;
    let h3 = 0xa54ff53au + d;
    let h4 = 0x510e527fu + e;
    let h5 = 0x9b05688cu + f;
    let h6 = 0x1f83d9abu + g;
    let h7 = 0x5be0cd19u + h;

    // Binary search (Comparing 8 components)
    var low = 0u;
    var high = dedup_len;
    while (low < high) {
        let mid = (low + high) / 2u;
        let mid_hash_v = hashes_in[mid].v;
        
        // Manual unrolled comparison for 8 components
        var cmp = 0; // 0: equal, -1: less, 1: greater
        
        if (h0 < mid_hash_v[0]) { cmp = -1; }
        else if (h0 > mid_hash_v[0]) { cmp = 1; }
        else {
            if (h1 < mid_hash_v[1]) { cmp = -1; }
            else if (h1 > mid_hash_v[1]) { cmp = 1; }
            else {
                if (h2 < mid_hash_v[2]) { cmp = -1; }
                else if (h2 > mid_hash_v[2]) { cmp = 1; }
                else {
                    if (h3 < mid_hash_v[3]) { cmp = -1; }
                    else if (h3 > mid_hash_v[3]) { cmp = 1; }
                    else {
                        if (h4 < mid_hash_v[4]) { cmp = -1; }
                        else if (h4 > mid_hash_v[4]) { cmp = 1; }
                        else {
                            if (h5 < mid_hash_v[5]) { cmp = -1; }
                            else if (h5 > mid_hash_v[5]) { cmp = 1; }
                            else {
                                if (h6 < mid_hash_v[6]) { cmp = -1; }
                                else if (h6 > mid_hash_v[6]) { cmp = 1; }
                                else {
                                    if (h7 < mid_hash_v[7]) { cmp = -1; }
                                    else if (h7 > mid_hash_v[7]) { cmp = 1; }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (cmp < 0) {
            high = mid;
        } else if (cmp > 0) {
            low = mid + 1u;
        } else {
             // Found
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
    }
}