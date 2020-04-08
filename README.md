# HumanUUID
## 1. Introduction
In the age of information it is often necessary to refer to unique individuals without direct reference to sensitive personal information. A standardized cryptographically secure computationally intensive hash can serve to produce a universally unique identifier *UUID* from the relatively small set of immutable information each of us was born with.

Further, a modular hashing scheme allows end users to reveal only specific pieces of information to third parties, at their discretion, such as country of birth, or year of birth.

## 2. Hash Algorithm
[Argon2 v1.3](https://github.com/P-H-C/phc-winner-argon2/raw/master/argon2-specs.pdf) is used due to its computational intensity and suitability for password (short input) hashing. Specifically the crypto_pwhash() routine in [Libsodium 1.0.18](https://github.com/jedisct1/libsodium/releases) is used with algorithm`crypto_pwhash_ALG_ARGON2ID13` and CPU and memory limits: `crypto_pwhash_OPSLIMIT_SENSITIVE`, `crypto_pwhash_MEMLIMIT_SENSITIVE` respectively. Output length is 128 bits.

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
6. If the country does no issue birth certificate IDs then this field is left blank (all null characters)
7. All datatypes are to be written in big endian in the order.

## 5. HumanUUID Schema
To generate a `HumanUUID` the hashes described in 6 and 7 are hashed.

`HumanUUID:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|uint8_t [128]|`Partial Hash 1`
|uint8_t [128]|`Partial Hash 2`
|uint8_t [128]|`Partial Hash 3`
|uint8_t [128]|`Partial Hash 4`
|uint8_t [128]|`Partial Hash 5`
|uint8_t [128]|`Partial Hash 6`
|uint8_t [128]|`Partial Hash 7`
|uint8_t [128]|`Partial Hash 8`

## 6. Full Hash Schema
This is the first hash to generate before a `HumanUUID` can be generated.

`Full Hash:`
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

## 7. Partial Hash Schema
Once a `Full Hash` hash has been created we additionally need to create `Partial Hash` for each of the fields according to the schema below. Each `Partial Hash` allows the end user to preserve privacy, for example only showing their birth year to a third party to buy an alcoholic beverage. The `Full Hash` acts as an anchor for each `Partial Hash`.

`Partial Hash 1:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|UTF-32 [64]|Family Name *|

`Partial Hash 2:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|UTF-32 [64]|Given Names *|

`Partial Hash 3:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|UTF-32 [64]|Birth Certificate ID *|

`Partial Hash 4`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|UTF-32 [64]|Place of Birth *|

`Partial Hash 5:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|uint32_t|ISO_3166 Numeric Code ^|

`Partial Hash 6:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|uint16_t|Year of Birth ~|

`Partial Hash 7:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|uint8_t|Month of Birth ~|

`Partial Hash 8:`
| Field Type | Field Content |
|:------------|:-------------|
|uint8_t [128]|`Full Hash`
|uint8_t|Day of Birth ~|

## 8. Suggested Usage
Once a user has received a `HumanUUID` stamp on an account, the notary who produced it should also provide each of the nine hashes described in 5. By providing these to a third party the user does not compromise the user's identity.

The user may provide a single piece of information such as year of birth along with the nine hashes (a 288 nibble hexadecimal string). The partial hash corresponding to that piece of information is then computed by the third party and verified against the `HumanUUID` by computing the hash again over the `Full Hash` and all `Partial Hashes`. In this way the user can provide select pieces of information to third parties.
