const Faye = require('faye');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

let BLOCKCHAIN, TRANSACTIONPOOL;

class PubSub {
  constructor({ blockchain, transactionPool, pubSubUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    BLOCKCHAIN = blockchain;
    TRANSACTIONPOOL = transactionPool;

    this.pubSubUrl = pubSubUrl;
    this.client = new Faye.Client(this.pubSubUrl);

    this.client.bind('transport:down', function() {
      console.log(`[PUBSUB CONNECTION DOWN]`);
    });
    this.client.bind('transport:up', function() {
      console.log(`[PUBSUB CONNECTION UP]`);
    });
  
    this.subscribeToChannels();
  }

  /*
  handleMessage(blockchain, transactionPool, data) {
    console.log('pubsub.js@30: ',data);
    const {channel, text} = data;
    const message = text;
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        blockchain.replaceChain(parsedMessage, true, () => {
          transactionPool.clearBlockchainTransactions({
              chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }
  */


  subscribeToChannels() {
    var subscription;

    Object.values(CHANNELS).forEach(channel => {
      subscription = this.client.subscribe(`/messages/${channel}`, function(data){
        //this.handleMessage(this.blockchain,this.transactionPool,message);
        const {channel, text} = data;
        const message = text;
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parsedMessage = JSON.parse(message);

        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            BLOCKCHAIN.replaceChain(parsedMessage, true, () => {
              TRANSACTIONPOOL.clearBlockchainTransactions({
                  chain: parsedMessage
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            TRANSACTIONPOOL.setTransaction(parsedMessage);
            break;
          default:
            return;
        }        
      });
    });

    subscription.callback(function() {
      console.log('[SUBSCRIBE SUCCEEDED]');
    });
    subscription.errback(function(error) {
      console.log('[SUBSCRIBE FAILED]', error);
    });
  }

  publish({ channel, message }) {
    var publication = this.client.publish(`/messages/${channel}`, {
      channel: channel,
      text: message
    });
    publication.callback(function() {
      console.log('[PUBLISH SUCCEEDED]');
    });
    publication.errback(function(error) {
      console.log('[PUBLISH FAILED]', error);
    });        
  }

  broadcastChain(blockchain) {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;
