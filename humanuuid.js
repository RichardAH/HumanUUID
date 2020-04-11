// HumanUUID a universal identifier for natural people based on birth certificate details
// Author: Richard Holland
// Date: 2020-04-12
// Version: 0.1 (warning-alpha)

const sodium = require('libsodium-wrappers-sumo');
const assert = require('assert')
const iconv = require('iconv').Iconv

// helper function that expects iso-8859-1 strings (with space delimiters for given names) and machine-endian numbers and encodes to the relvant buffers before calling generate()
async function generate_easy(
    family_name,
    given_names,
    birth_certificate_id,
    place_of_birth,
    iso3166_country_code,
    year_of_birth,
    month_of_birth,
    day_of_birth
) {
    
    await sodium.ready

    // check types and limits
    assert(typeof(family_name) == 'string' && family_name.length <= 64 && family_name.length >= 1, "family_name must be provided as a js string type with betweeen 1 and 64 characters")
    assert(typeof(given_names) == 'string' && given_names.length <= 64 && given_names.length >= 1, "given_names must be provided as a js string type with betweeen 1 and 64 characters")
    assert(typeof(birth_certificate_id) == 'string' && birth_certificate_id.length <= 64 && birth_certificate_id.length >= 1, "birth_certificate_id must be provided as a js string type with betweeen 1 and 64 characters")
    assert(typeof(place_of_birth) == 'string' && place_of_birth.length <= 64 && place_of_birth.length >= 1, "place_of_birth must be provided as a js string type with betweeen 1 and 64 characters")

    assert(typeof(iso3166_country_code) == 'number' && iso3166_country_code >= 0 && iso3166_country_code <= 0x0fffffff && iso3166_country_code%1 == 0, "iso3166_country_code must be a positive integer")
    assert(typeof(year_of_birth) == 'number' && year_of_birth >= 1900 && year_of_birth <= 4096 && year_of_birth%1 == 0, "year_of_birth must be a positive integer between 1900 and 4096")
    assert(typeof(month_of_birth) == 'number' && month_of_birth >= 1 && month_of_birth <= 12 && month_of_birth%1 == 0, "month_of_birth must be a positive integer between 1 and 12")
    assert(typeof(day_of_birth) == 'number' && day_of_birth >= 1 && day_of_birth <= 31 && day_of_birth%1 == 0, "day_of_birth must be a positive integer between 1 and 31")

    // prepare the fields by replacing space and comma characters and adding the null padding
    family_name = family_name.replace(/,/g, ' ')
    given_names = given_names.replace(/,/g, ' ')
    birth_certificate_id = birth_certificate_id.replace(/,/g, ' ')
    place_of_birth = place_of_birth.replace(/,/g, ' ')

    family_name = family_name.replace(/ +/g, '\x00')
    given_names = given_names.replace(/ +/g, '\x00')
    birth_certificate_id = birth_certificate_id.replace(/ +/g, '\x00')
    place_of_birth = place_of_birth.replace(/ +/g, '\x00')
    
    family_name += ' '.repeat(Math.max(0, 64 - family_name.length))
    given_names += ' '.repeat(Math.max(0, 64 - given_names.length))
    birth_certificate_id += ' '.repeat(Math.max(0, 64 - birth_certificate_id.length))
    place_of_birth += ' '.repeat(Math.max(0, 64 - place_of_birth.length))

    // prepare the converter
    var conv = new iconv('ISO-8859-1', 'UTF-32BE')
    
    // generate buffers
    iso3166_country_code_buf = new Uint8Array(4)
    iso3166_country_code_buf[0] = (iso3166_country_code >> 24) & 0xff
    iso3166_country_code_buf[1] = (iso3166_country_code >> 16) & 0xff
    iso3166_country_code_buf[2] = (iso3166_country_code >> 8) & 0xff
    iso3166_country_code_buf[3] = (iso3166_country_code) & 0xff

    year_of_birth_buf = new Uint8Array(2)
    year_of_birth_buf[0] = year_of_birth >> 8
    year_of_birth_buf[1] = year_of_birth & 0xff
    
    month_of_birth_buf = new Uint8Array(1)
    month_of_birth_buf[0] = month_of_birth

    day_of_birth_buf = new Uint8Array(1)
    day_of_birth_buf[0] = month_of_birth

    // finally perform the actual HumanUUID generation
    return generate(  
        new Uint8Array(conv.convert(family_name).buffer),
        new Uint8Array(conv.convert(given_names).buffer),
        new Uint8Array(conv.convert(birth_certificate_id).buffer),
        new Uint8Array(conv.convert(place_of_birth).buffer),
        iso3166_country_code_buf,
        year_of_birth_buf,
        month_of_birth_buf,
        day_of_birth_buf)

}


// todo check for illegal comma seperators in given names
// This function takes canonical fields as uint arrays, and produces the humanuuid hash for them
// the fields must be provided exactly as specified in README.md. Consider using generate_easy
// returns the HumanUUID as hexadecimal string 32 nibbles long
async function generate (
    family_name, 
    given_names,
    birth_certificate_id,
    place_of_birth,
    iso3166_country_code,
    year_of_birth,
    month_of_birth,
    day_of_birth
) {

    await sodium.ready

    assert('constructor' in family_name && family_name.constructor == Uint8Array && family_name.length == 256, "family_name must be UTF-32BE[64] provided as a Uint8Array[256]")
    assert('constructor' in given_names && given_names.constructor == Uint8Array && given_names.length == 256, "given_names must be UTF-32BE[64] provided as a Uint8Array[256]")
    assert('constructor' in birth_certificate_id && birth_certificate_id.constructor == Uint8Array && birth_certificate_id.length == 256, "birth_certificate_id must be UTF-32BE[64] provided as a Uint8Array[256]")
    assert('constructor' in place_of_birth && place_of_birth.constructor == Uint8Array && place_of_birth.length == 256, "place_of_birth must be UTF-32BE[64] provided as a Uint8Array[256]")
    assert('constructor' in iso3166_country_code && iso3166_country_code.constructor == Uint8Array && iso3166_country_code.length == 4, "iso3166_country_code must be uint32_t big endian provided as a Uint8Array[4]")
    assert('constructor' in year_of_birth && year_of_birth.constructor == Uint8Array && year_of_birth.length == 2, "year_of_birth must be uint16_t big endian provided as a Uint8Array[2]")
    assert('constructor' in month_of_birth && month_of_birth.constructor == Uint8Array && month_of_birth.length == 1, "month_of_birth must be uint8_t provided as a Uint8Array[1]")
    assert('constructor' in day_of_birth && day_of_birth.constructor == Uint8Array && day_of_birth.length == 1, "day_of_birth must be uint8_t provided as a Uint8Array[1]")

    // check some endians
    assert(iso3166_country_code[0] == 0, "fields must be provided as big endian, country code should start with 0x00")
    assert((year_of_birth[0]&0xf0) == 0, "fields must be provided as big endian, year of birth should start with a 0 nibble e.g. 0x07CB")
    
    // check UTF32 hasn't been provided by mistake
    var test = family_name[0] + (family_name[1]<<8) + (family_name[2]<<16) + (family_name[3]<<24)
    assert(test != 0xFFFE0000 && test != 0xFFFE, "fields must be provided in UTF-32BE not UTF-32, family_name was provided incorrectly")
    test = given_names[0] + (given_names[1]<<8) + (given_names[2]<<16) + (given_names[3]<<24)
    assert(test != 0xFFFE0000 && test != 0xFFFE, "fields must be provided in UTF-32BE not UTF-32, given_names was provided incorrectly")
    test = birth_certificate_id[0] + (birth_certificate_id[1]<<8) + (birth_certificate_id[2]<<16) + (birth_certificate_id[3]<<24)
    assert(test != 0xFFFE0000 && test != 0xFFFE, "fields must be provided in UTF-32BE not UTF-32, birth_certificate_id was provided incorrectly")
    test = place_of_birth[0] + (place_of_birth[1]<<8) + (place_of_birth[2]<<16) + (place_of_birth[3]<<24)
    assert(test != 0xFFFE0000 && test != 0xFFFE, "fields must be provided in UTF-32BE not UTF-32, place_of_birth was provided incorrectly")

    // check numbers fit in constraints
    var yob = (year_of_birth[0] << 8) + year_of_birth[1]
    var mob = month_of_birth[0] 
    var dob = day_of_birth[0]


    assert(yob >= 1900 && yob <= (new Date().getFullYear()), "year of birth must be between 1900 and the current year")
    assert(mob >= 1 && mob <= 12, "month of birth must be between 1 and 12")
    assert(dob >= 1 && dob <= 31, "day of birth must be between 1 and 31")
   
    // check if the date sits is a real day that really happened
    var birthdate = null
    try {
        var ts = Date.parse(yob + '-' + mob + '-' + dob + " 00:00:00 GMT")
        birthdate = new Date(ts)

        var pieces = birthdate.toISOString().slice(0,10).split('-')
        assert(parseInt(pieces[0]) == yob && parseInt(pieces[1]) == mob && parseInt(pieces[2]) == dob, "specified birthdate doesn't appear on gregorian calendar")
        assert(ts < Date.now(), "birthdate must be in the past")

    } catch (e) {
        assert(false, "invalid birthdate, got this error: " + e)
    } 


    // produce the buffer
    var buf = new Uint8Array(1032)
    var upto = 0
    for (var x in family_name) buf[upto++] = family_name[x]
    for (var x in given_names) buf[upto++] = given_names[x]
    for (var x in birth_certificate_id) buf[upto++] = birth_certificate_id[x]
    for (var x in place_of_birth) buf[upto++] = place_of_birth[x]
    for (var x in iso3166_country_code) buf[upto++] = iso3166_country_code[x]
    for (var x in year_of_birth) buf[upto++] = year_of_birth[x]
    for (var x in month_of_birth) buf[upto++] = month_of_birth[x]
    for (var x in day_of_birth) buf[upto++] = day_of_birth[x]    

    assert(upto == 1032, "fatal: buffers wrong length")

    return new Promise ( resolve => {
        resolve(Buffer.from(sodium.crypto_pwhash( 16, buf, 'HumanUUID0000000', sodium.crypto_pwhash_OPSLIMIT_SENSITIVE, sodium.crypto_pwhash_MEMLIMIT_SENSITIVE, sodium.crypto_pwhash_ALG_ARGON2ID13 )).toString('hex'))
    })

}
module.exports.generate = generate
module.exports.generate_easy = generate_easy
