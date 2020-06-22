import React, { Component } from 'react';
import BuyForm from './BuyForm'
import SellForm from './SellForm'

class Main extends Component {

  state = {
    currentForm: 'buy'
  }

  renderContent() {
    if(this.state.currentForm === 'buy') {
      return (
        <BuyForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          buyTokens={this.props.buyTokens}
        />
      )
    } else {
      return (
        <SellForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          sellTokens={this.props.sellTokens}
        />
      )
    }
  }

  render() {
    return (
      <div id="content">
         <div className="d-flex justify-content-between mb-3">
          <button
              className="btn btn-light"
              onClick={(event) => {
                this.setState({ currentForm: 'buy' })
              }}
            >
            Buy
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
              className="btn btn-light"
              onClick={(event) => {
                this.setState({ currentForm: 'sell' })
              }}
            >
            Sell
          </button>
        </div>

        <div className="card mb-4" >

          <div className="card-body">

            {this.renderContent()}

          </div>

        </div>
      </div>
    );
  }
}

export default Main;