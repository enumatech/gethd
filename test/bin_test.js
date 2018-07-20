const Chai = require('chai')
const {expect} = Chai
const Web3 = require('web3')

describe('bin.js', function () {
    let web3, accounts;

    before(async () => {
        web3 = new Web3('http://localhost:8545')
        accounts = await web3.eth.getAccounts()
    })

    describe('balance', function () {
        it('of account 0 is positive', async () => {
            expect(await web3.eth.getBalance(accounts[0]))
                .eql('115792089237316195423570985008687907853269984665640564039457584007913129639927')
        })

        it('of account 1 is 100', async () => {
             expect(await web3.eth.getBalance(accounts[1])).eql('100')
        })
    })
})
