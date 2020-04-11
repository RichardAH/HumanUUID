const HumanUUID = require('./humanuuid.js')
const assert = require('assert')
HumanUUID.generate_easy('Smith', 'John Apple', '10001', 'San Francisco', 000, 1901, 1, 1).then(
    uuidhex => {
        console.log(uuidhex) // print the HumanUUID generated for John Apple Smith
        assert(uuidhex == '8e1034fe3af63d34d2e7f8ee3aaf6b8f', 'humanuuid generated the wrong uuid for test person')
        process.exit(0)
    }
)
