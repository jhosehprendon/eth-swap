const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', ([deployer, investor]) => {

  let token
  let ethSwap

  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    await token.transfer(ethSwap.address, tokens('1000000'));

  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'Tauro Token')
    })
  })

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Buy tokens', async () => {
    let result

    before(async () => {
      result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
    })

    it('allows user to instantly purchase tokens from ethSwap', async () => {
      // Check investor token balance after purchase
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'))

      // Check ethSwap balance after purchase
      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('999900'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

      // Check logs to ensure event was emitted correctly
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')
    })
  })

  describe('Sell tokens', async () => {
    let result

    before(async () => {
      // Investor must approve the purchase
      await token.approve(ethSwap.address, tokens('100'), { from: investor })
      // Investor sells the tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: investor })
    })

    it('allows user to instantly sell tokens to ethSwap', async () => {
      // Check investor token balance after selling
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'))

      // Check ethSwap balance after selling
      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))

      // Check logs to ensure event was emitted correctly
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // Failiure: investor can't send more tokens than they have
      await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected
      
    })
  })
})