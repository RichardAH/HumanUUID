# HumanUUID
## 1. Introduction
In the age of information it is often necessary to refer to unique individuals without direct reference to sensitive personal information. A standardized cryptographically secure computationally intensive hash can serve to produce a universally unique identifier *UUID* from the relatively small set of immutable information each of us was born with.

## 2. Hash Algorithm
[Argon2 v1.3](https://github.com/P-H-C/phc-winner-argon2/raw/master/argon2-specs.pdf) is used due to its computational intensity and suitability for password (short input) hashing. Specifically the crypto_pwhash() routine in [Libsodium 1.0.18](https://github.com/jedisct1/libsodium/releases) is used with algorithm`crypto_pwhash_ALG_ARGON2ID13` and CPU and memory limits: `crypto_pwhash_OPSLIMIT_SENSITIVE`, `crypto_pwhash_MEMLIMIT_SENSITIVE` respectively.

## 3. Intended Generators
The intended generator of a `HumanUUID` is a notary: some person of trust who will verify the authenticity of the human's birth certificate and use the information thereon to publicly declare a true and accurate `HumanUUID` according to the rules of this specification.

In addition any party with KYC/AML requirements might also generate a `HumanUUID` from customer-provided data to verify a person is who they say they are or that a specified third party account belongs to that user. This might be useful for example in compliance with the  [Travel Rule](https://www.sec.gov/about/offices/ocie/aml2007/fincen-advissu7.pdf).

## 4. Input Data Rules
The input data to the hash routine must follow the below rules to ensure deterministic generation of the same `HumanUUID` for the same person from two different generators.

1. All data used in the hash must be sourced from the person's **official birth certificate.** However the data should also be checked against another form of government ID before a notary generates a `HumanUUID`.
2. All names (including place names) are `UTF-32` encoded in 64 character fields. Unused characters must be filled with the null character `\u00000000`.
3. Given names fit in a single field. Where more than one name is given a null character is inserted between the names.
4. Names fields may be truncated if the legitimate contents according to the above rules of the field is longer than 64 characters.
5. Abbreviations must not be used.
6. If the country does not issue birth certificate IDs then this field is left blank (all null characters)
7. All datatypes are to be written in big endian in the order they appear in Table 5 to a buffer of exactly 1032 bytes. The data in this buffer then becomes the input to the hash function.

## 5. Input Data Schema
| Field Type | Field Content |
|:------------|:-------------|
|UTF-32 [64]|Family Name *|
|UTF-32 [64]|Given Names *|
|UTF-32 [64]|Birth Certificate ID *|
|UTF-32 [64]|Place of Birth *|
|uint32_t|ISO_3166 Numeric Code ^|
|uint16_t|Year of Birth ~|
|uint8_t|Month of Birth ~|
|uint8_t|Day of Birth ~|

\* Exactly as listed on birth certificate.
^ ISO3166-1 code converted from country of issue as it appears on birth certificate
~ According to Gregorian calendar. Years are C.E. Month starts 1. Day starts from 1.
