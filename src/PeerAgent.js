define(['underscore', 'peerjs', 'Utils'], function(_, Peer, Utils) {
  var PeerAgent = function(config, callbacks) {
    var self = this;

    if (!_.isObject(config.peer)) {
      config.peer = {id: undefined, options: {}};
    }
    if (!_.isObject(config.peer.options)) {
      config.peer.options = {};
    }
    if (!Utils.isZeroOrPositiveNumber(config.connectRateLimit)) {
      config.connectRateLimit = 3000;
    }
    if (!Utils.isZeroOrPositiveNumber(config.connectionOpenTimeout)) {
      config.connectionOpenTimeout = 30000;
    }

    if (!_.isString(config.peer.id)) {
      this._peer = new Peer(config.peer.options);
    } else {
      this._peer = new Peer(config.peer.id, config.peer.options);
    }
    this._config = config;
    this._callbacks = callbacks;
    this._waitingTimer = null;
    this.connect = _.throttle(this.connect, config.connectRateLimit);

    var onPeerSetup = _.once(callbacks.onPeerSetup);

    this._peer.on('open', function(id) {
      Utils.debug("Peer opend (peer ID:", id, ")");

      self._peer.on('connection', function(conn) {
        Utils.debug("Connection from", conn.peer);

        callbacks.onConnection(conn.peer, conn);
      });

      self._peer.on('close', function() {
        Utils.debug("Peer closed.");

        callbacks.onPeerClosed();
      });

      onPeerSetup(id);
    });

    this._peer.on('error', function(error) {
      Utils.debug("Peer error:", error);

      var match = error.message.match(/Could not connect to peer (\w+)/);
      if (match) {
        if (!self.isWaitingOpeningConnection()) {
          return;
        }

        clearTimeout(self._waitingTimer);
        self._waitingTimer = null;

        var peerId = match[1];
        callbacks.onConnectionOpened(peerId, null, error);
        return;
      }

      console.log(error);
      onPeerSetup(null, error);
    });
  };

  PeerAgent.prototype = {
    connect: function(peerId) {
      var self = this;

      var conn = this._peer.connect(peerId);
      if (!conn) {
        var error = new Error("Failed to open connection to " + peerId + ".");
        this._callbacks.onConnectionOpened(peerId, null, error);
        return;
      }

      this._waitingTimer = setTimeout(function() {
        if (!self.isWaitingOpeningConnection()) {
          return;
        }

        self._waitingTimer = null;

        var error = new Error("Opening connection to " + peerId + " timed out.");
        self._callbacks.onConnectionOpened(peerId, null, error);
      }, this._config.connectionOpenTimeout);

      conn.on('open', function() {
        Utils.debug("Connection to", conn.peer, "opened.");

        if (!self.isWaitingOpeningConnection()) {
          conn.close();
          return;
        }

        clearTimeout(self._waitingTimer);
        self._waitingTimer = null;

        self._callbacks.onConnectionOpened(peerId, conn);
      });
    },

    isWaitingOpeningConnection: function() {
      return !_.isNull(this._waitingTimer);
    },

    destroy: function() {
      this._peer.destroy();
    },

    getPeerId: function() {
      return this._peer.id;
    },

    listAllPeers: function(callback) {
      this._peer.listAllPeers(callback);
    }
  };

  return PeerAgent;
});
