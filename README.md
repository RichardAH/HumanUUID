# HumanUUID
## License
HumanUUID is in the Public Domain

## 1. Introduction
In the age of information it is often necessary to refer to unique individuals without direct reference to sensitive personal information. A standardized cryptographically secure computationally intensive hash can serve to produce a `128 bit universally unique identifier` from the relatively small set of immutable information each of us was born with.

## 2. Hash Algorithm
[Argon2 v1.3](https://github.com/P-H-C/phc-winner-argon2/raw/master/argon2-specs.pdf) is used due to its computational intensity and suitability for password (short input) hashing. Specifically the crypto_pwhash() routine in [Libsodium 1.0.18](https://github.com/jedisct1/libsodium/releases) is used with algorithm`crypto_pwhash_ALG_ARGON2ID13` and CPU and memory limits: `crypto_pwhash_OPSLIMIT_SENSITIVE`, `crypto_pwhash_MEMLIMIT_SENSITIVE` respectively.

The `salt` parameter must be a buffer containing the following bytes `[0x48,0x75,0x6d,0x61,0x6e,0x55,0x55,0x49,0x44,0x30,0x30,0x30,0x30,0x30,0x30,0x30]`.

## 3. Intended Generators
The intended generator of a `HumanUUID` is a notary: some person of trust who will verify the authenticity of the human's birth certificate and use the information thereon to publicly declare a true and accurate `HumanUUID` according to the rules of this specification.

In addition any party with KYC/AML requirements might also generate a `HumanUUID` from customer-provided data to verify a person is who they say they are or that a specified third party account belongs to that user. This might be useful for example in compliance with the  [Travel Rule](https://www.sec.gov/about/offices/ocie/aml2007/fincen-advissu7.pdf).

## 4. Input Data Rules
The input data to the hash routine must follow the below rules to ensure deterministic generation of the same `HumanUUID` for the same person from two different generators.

1. All data used in the hash must be sourced from the person's **official birth certificate.** However the data should also be checked against another form of government ID before a notary generates a `HumanUUID`.
2. All names (including place names) are `UTF-32BE` encoded in 64 character fields. Unused characters must be filled with the null character `\u00000000`.
3. All names, including place names must be in the exact case -- in the exact characters -- specified on the birth certificate. E.g. John Smith
3. Given names fit in a single field. Where more than one name is given a null character is inserted between the names.
4. Names fields may be truncated if the legitimate contents according to the above rules of the field is longer than 64 characters.
5. Abbreviations must not be used.
6. If the country does not issue birth certificate IDs then this field is left blank (all null characters)
7. All datatypes are to be written in big endian in the order they appear in Table 5 to a buffer of exactly 1032 bytes. The data in this buffer then becomes the input to the hash function.

Note: UTF-32BE does not use a header like `\u0000fffe`, the byte of the field is the most significant byte of the first code unit. [UTF-32BE Rules - See D99](http://www.unicode.org/versions/Unicode5.0.0/ch03.pdf)

## 5. Input Data Schema
| Field Type | Field Content |
|:------------|:-------------|
|UTF-32BE [64]|Family Name *|
|UTF-32BE [64]|Given Names *|
|UTF-32BE [64]|Birth Certificate ID *|
|UTF-32BE [64]|Place of Birth *|
|uint32_t|ISO_3166 Numeric Code ^|
|uint16_t|Year of Birth ~|
|uint8_t|Month of Birth ~|
|uint8_t|Day of Birth ~|

\* Exactly as listed on birth certificate.
^ ISO3166-1 code converted from country of issue as it appears on birth certificate
~ According to Gregorian calendar. Years are C.E. Month starts 1. Day starts from 1.

## 6. Reference Implementation Usage
Warning Reference Implementation is in Alpha
```js
    const HumanUUID = require('./humanuuid.js')
    HumanUUID.generate_easy('Smith', 'John Apple', '10001', 'San Francisco', 000, 1901, 1, 1).then(
        uuidhex => {
            console.log(uuidhex) // print the HumanUUID generated for John Apple Smith
        }
    )
```
