define(['underscore', 'LocalNode', 'Utils'], function(_, LocalNode, Utils) {
  var Chord = function(config) {
    if (!_.isObject(config)) {
      throw new Error("Invalid argument.");
    }

    this._config = config;
    this._localNode = null;
  };

  Chord.prototype = {
    create: function(callback) {
      var self = this;

      if (!_.isNull(this._localNode)) {
        throw new Error("Local node is already created.");
      }
      if (_.isUndefined(callback)) {
        callback = function() { ; };
      }

      LocalNode.create(this._config, function(localNode) {
        if (_.isNull(localNode)) {
          callback(null);
          return;
        }

        self._localNode = localNode;
        self._localNode.create(callback);
      });
    },

    join: function(bootstrapId, callback) {
      var self = this;

      if (!Utils.isNonemptyString(bootstrapId)) {
        throw new Error("Invalid argument.");
      }
      if (!_.isNull(this._localNode)) {
        throw new Error("Local node is already created.");
      }
      if (_.isUndefined(callback)) {
        callback = function() { ; };
      }

      LocalNode.create(this._config, function(localNode) {
        if (_.isNull(localNode)) {
          callback(null);
          return;
        }

        self._localNode = localNode;
        self._localNode.join(bootstrapId, callback);
      });
    },

    leave: function() {
      var self = this;

      if (_.isNull(this._localNode)) {
        return;
      }

      this._localNode.leave(function() {
        self._localNode = null;
      });
    },

    insert: function(key, value, callback) {
      if (_.isUndefined(callback)) {
        callback = function() { ; };
      }
      if (!Utils.isNonemptyString(key) || _.isUndefined(value)) {
        callback(false);
        return;
      }

      this._localNode.insert(key, value, callback);
    },

    retrieve: function(key, callback) {
      if (_.isUndefined(callback)) {
        callback = function() { ; };
      }
      if (!Utils.isNonemptyString(key)) {
        callback(null);
        return;
      }

      this._localNode.retrieve(key, callback);
    },

    remove: function(key, value, callback) {
      if (_.isUndefined(callback)) {
        callback = function() { ; };
      }
      if (!Utils.isNonemptyString(key) || _.isUndefined(value)) {
        callback(false);
        return;
      }

      this._localNode.remove(key, value, callback);
    },

    getStatuses: function() {
      return this._localNode.getStatuses();
    },

    getPeerId: function() {
      if (_.isNull(this._localNode)) {
        return null;
      }

      return this._localNode.getPeerId();
    }
  };

  return Chord;
});
