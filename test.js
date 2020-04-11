const HumanUUID = require('./humanuuid.js')
const assert = require('assert')
HumanUUID.generate_easy('Smith', 'John Apple', '10001', 'San Francisco', 000, 1901, 1, 1).then(
    uuidhex => {
        console.log(uuidhex) // print the HumanUUID generated for John Apple Smith
        assert(uuidhex == 'eb211866768c8b23151ed77fd6d03006', 'humanuuid generated the wrong uuid for test person')
        process.exit(0)
    }
)
