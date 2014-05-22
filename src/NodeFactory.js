define([
  'underscore', 'Node', 'ConnectionFactory', 'RequestHandler', 'ID', 'Utils'
], function(_, Node, ConnectionFactory, RequestHandler, ID, Utils) {
  var NodeFactory = function(localNode, config) {
    var self = this;

    if (_.isNull(localNode)) {
      throw new Error("Invalid arguments.");
    }

    this._localNode = localNode;
    this._config = config;
    this._connectionFactory = null;
    this._requestHandler = new RequestHandler(localNode, this);
    this._callbacks = {};
  };

  NodeFactory.create = function(localNode, config, callback) {
    if (_.isNull(localNode)) {
      callback(null, null);
    }

    var nodeFactory = new NodeFactory(localNode, config);
    ConnectionFactory.create(config, nodeFactory, function(peerId, connectionFactory) {
      if (!Utils.isNonemptyString(peerId)) {
        callback(null, null);
        return;
      }

      nodeFactory._connectionFactory = connectionFactory;

      callback(peerId, nodeFactory);
    });
  };

  NodeFactory.prototype = {
    create: function(nodeInfo, callback) {
      var self = this;

      if (!Node.isValidNodeInfo(nodeInfo)) {
        callback(null);
        return;
      }

      if (this._localNode.nodeId.equals(ID.create(nodeInfo.peerId))) {
        callback(this._localNode);
        return;
      }

      var node = new Node(nodeInfo, this, this._callbacks, this._connectionFactory,
                          this._requestHandler, this._config);

      callback(node);
    },

    createAll: function(nodesInfo, callback) {
      var self = this;

      if (_.isEmpty(nodesInfo)) {
        callback([]);
        return;
      }
      this.create(_.first(nodesInfo), function(node) {
        self.createAll(_.rest(nodesInfo), function(nodes) {
          if (!_.isNull(node)) {
            callback([node].concat(nodes));
          } else {
            callback(nodes);
          }
        });
      });
    },

    destroy: function() {
      this._connectionFactory.destroy();
    }
  };

  return NodeFactory;
});
