import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import EthSwap from '../abis/EthSwap.json';
import Token from '../abis/Token.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  state = {
    account: '',
    ethBalance: 0,
    token: {},
    ethSwap: {},
    tokenBalance: 0,
    loading: true
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // Load Token Smart Contract
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    const address = tokenData ? tokenData.address : window.alert('Token contract not deployed to detected network')
    const token = new web3.eth.Contract(Token.abi, address)
    this.setState({ token })
    let tokenBalance = await token.methods.balanceOf(this.state.account).call()
    this.setState({ tokenBalance: tokenBalance.toString()})

    // Load EthSwap Smart Contract
    const ethSwapData = EthSwap.networks[networkId]
    const ethSwapaddress = ethSwapData ? ethSwapData.address : window.alert('EthSwap contract not deployed to detected network')
    const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapaddress)
    this.setState({ ethSwap })

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  loadMain() {
    if(this.state.loading) {
      return <p id="loader" className="text-center">Loading...</p>
    } else {
      return (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      )
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {this.loadMain()}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
